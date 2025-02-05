from pythonBE.locationSummarization import *
from pythonBE.searchInformations import *
from pythonBE.chatbot import *
from pythonBE.config import *

# pip install fastapi uvicorn pydantic openai selenium webdriver-manager pymongo
# python -m uvicorn BE:app --reload

# Initialize the FastAPI app
app = FastAPI()

# Define the origins that are allowed to access the API
origins = [
    "http://localhost:4000",  # Replace with your frontend URL
    "http://localhost:8000",  # You can add more origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins or use ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/start_session")
async def start_session(user_id: str):
    session_data = {
        "UserID": user_id,
        "History": [],
        "VectorStoreID": None,
        "AssistantID": None,  
        "Title": "New Chat",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    session = db.conversationsessions.insert_one(session_data)
    return {"session_id": str(session.inserted_id)}

@app.post("/getLocationInformations")
async def get_location_informations(request: LocationRequest):
    link_articles = request.link_articles
    files_path = request.files_path
    conversationsessionsID = request.conversationsessionsID
    
    for i in range(len(link_articles)):
        news = link_articles[i]
        file_path = files_path[i]

        title = re.sub(r'[^a-zA-Z\s]', '', news.title)
        title = title.replace(" ", "_")

        vector_store_1 = create_vector_store(f"{conversationsessionsID}-{title}")
        update_vector_store(vector_store_1.id, [file_path])

        assistant_1 = create_assistant(vector_store_1.id)

        list_location = flow_extract_location(assistant_1.id)
        news.local = list_location

    merged_locations = merge_locations(link_articles)

    for loc in merged_locations:
        loc_data = {
            "SessionID": ObjectId(conversationsessionsID),
            "administrative_area": loc.administrative_area,  # Directly access attributes
            "country": loc.country,
            "continent": loc.continent,
            "lat": loc.lat,
            "lon": loc.lon,
            "links": loc.links,  # Access the links attribute directly
            "summaries": loc.summaries,  # Access summaries directly
            "sentiment": loc.sentiment,  # Access sentiment directly
            "__v": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        db.locations.insert_one(loc_data)
    
    locations = merged_locations
    
    return locations

@app.get("/getRelevantLinks")
async def get_relevant_links(text: str, topK: int, conversationsessionsID: str):
    query = analyze_prompt(text)
    print(query)
    
    # if not query.site:
    #     return JSONResponse(content={"message": "No site found in the text"}, status_code=400)
    
    links = search_relevant_links(query, topK, conversationsessionsID)
    file_paths, links = convert_to_pdf(links, conversationsessionsID)
    
    location_request = LocationRequest(
        link_articles=links,
        files_path=file_paths,
        conversationsessionsID=conversationsessionsID
    )
    
    locations = await get_location_informations(location_request)
    
    return {"query": query, "links": links, "file paths": file_paths, "locations": locations}

@app.post("/getResponse")
async def get_response(request: ResponseRequest):
    text = request.text
    isCrawl = request.isCrawl
    linkSpecific = request.linkSpecific
    topK = request.topK
    conversationsessionsID = request.conversationsessionsID
    
    session = db.conversationsessions.find_one({"_id": ObjectId(conversationsessionsID)})
    vector_store_id = session.get("VectorStoreID")
    assistant_id = session.get("AssistantID")
    history = session.get("History")

    if not assistant_id:
        isCrawl = True
        vector_store = create_vector_store(conversationsessionsID)
        vector_store_id = vector_store.id

        assistant = create_assistant(vector_store_id)
        assistant_id = assistant.id

    relevant_files = {"query": text, "links": [], "file paths": [], "locations": []}
    
    if linkSpecific.startswith("http://") or linkSpecific.startswith("https://"):
        custom_articles = LinkArticle(
            title=text,
            link=linkSpecific
        )
        relevant_files["links"] = [custom_articles]
        relevant_files["file paths"], relevant_files["links"] = convert_to_pdf([custom_articles], conversationsessionsID)
        
    elif isCrawl:
        relevant_files = await get_relevant_links(text=text, topK=topK, conversationsessionsID=conversationsessionsID)
    else:
        relevant_files = {}
    
    if relevant_files and relevant_files["file paths"]:
        if not vector_store_id:
            vector_store = create_vector_store(conversationsessionsID)
            vector_store_id = vector_store.id

        update_vector_store(vector_store_id, relevant_files["file paths"])
        assistant = create_assistant(vector_store_id)
        assistant_id = assistant.id
        
        db.conversationsessions.update_one(
            {"_id": ObjectId(conversationsessionsID)},
            {"$set": {"VectorStoreID": vector_store_id, "AssistantID": assistant_id}}
        )

    # qa_history = None if not session.get("History") else "\n".join(session.get("History"))

    # Lọc bỏ các mục có chứa 'Ref: '
    filtered_history = [item for item in history if not item.startswith("Ref: ")]

    # Tạo qa_history từ các mục đã lọc
    qa_history = None if not filtered_history else "\n".join(filtered_history)
    
    prompt = (
        f"The uploaded files are articles that were searched with the keyword '{text}'.\n"
        f"Pay attention to previous Q&A history (if any): \n{qa_history}\n"
        f"Given the query below, identify and return the key details explicitly mentioned that are necessary for information retrieval.\n\n"
        f"QUERY: '{text}'"
    )
        
    response = flow_qa(prompt, assistant_id)
    response = re.sub(r"【[^】]*source】", "", response)
    db.conversationsessions.update_one(
        {"_id": ObjectId(conversationsessionsID)},
        {"$push": {"History": f"User: {text}"}}
    )
    db.conversationsessions.update_one(
        {"_id": ObjectId(conversationsessionsID)},
        {"$push": {"History": f"System: {response}"}}
    )
    ref = relevant_files.get("links", []) 
    html_links = " ".join(
        f'<a href="{article.link}" target="_blank">{article.title}</a><br>'
        for article in ref
    )

    # Cập nhật vào trường History của conversationsessions trong MongoDB
    db.conversationsessions.update_one(
        {"_id": ObjectId(conversationsessionsID)},
        {"$push": {"History": f"Ref: {html_links}"}}
    )
    # print(relevant_files["locations"])
    # return ResponseModel(textAnswer=response, links=relevant_files["links"], locations=relevant_files["locations"], status="success")
    return {
        "textAnswer": response,
        "links": relevant_files.get("links", []),
        "locations": relevant_files.get("locations", []),
        "status": "success"
    }