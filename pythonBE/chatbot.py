from pythonBE.config import *

def create_vector_store(conversationsessionsID: str):
    vector_store = client.beta.vector_stores.create(name=f"Session Vector Store for: {conversationsessionsID}")
    
    return vector_store

def update_vector_store(vector_store_id: str, file_paths: List[str]):
    if not file_paths:
        return
    
    file_streams = [open(path, "rb") for path in file_paths]

    client.beta.vector_stores.file_batches.upload_and_poll(
        vector_store_id=vector_store_id, files=file_streams
    )

def create_assistant(vector_store_id: str):
    assistant = client.beta.assistants.create(
        name="Articles Analysis Assistant",
        instructions="You are the expert in analyzing the articles. Use your knowledge to answer questions about the articles.",
        model="gpt-4o-mini",
        tools=[{"type": "file_search"}],
    )

    assistant = client.beta.assistants.update(
        assistant_id=assistant.id,
        tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}},
    )

    return assistant

def flow_qa(prompt, assistant_id):
    thread = client.beta.threads.create(
        messages=[{"role": "user", "content": prompt}],
    )

    handler = EventHandler()

    with client.beta.threads.runs.stream(
        thread_id=thread.id,
        assistant_id=assistant_id,
        instructions="Please address the user as Jane Doe. The user has a premium account.",
        event_handler=handler,
    ) as stream:
        stream.until_done()

    return handler.result