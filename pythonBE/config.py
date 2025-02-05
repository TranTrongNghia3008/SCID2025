# For calling the API
import base64
import requests
from openai import OpenAI

# For crawling data
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
from selenium.webdriver.common.by import By
import re

# For extracting site and keyword data
from pydantic import BaseModel

# For Q&A
from typing_extensions import override
from openai import AssistantEventHandler, OpenAI

# For FastAPI
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# For MongoDB
import os
from pymongo import MongoClient
from bson import ObjectId
import gridfs
from datetime import datetime

# For location summarization
from collections import defaultdict

client = OpenAI(
    api_key = "",
)

clientMongoDB = MongoClient("mongodb+srv://admin:jsmFDvCxbGcoBBfr@cluster0.om2fx.mongodb.net/")
db = clientMongoDB["GeoSI"]
fs = gridfs.GridFS(db)

STORAGE_PATH = "./storage/pdf_files"

# Configure Chrome options
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')  # Run in headless mode
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--window-size=1920x1080')  # Ensure the window size is large enough
chrome_service = Service(ChromeDriverManager().install())

class SearchQuery(BaseModel):
    site: str
    query: str

class Location(BaseModel):
    administrative_area: str
    country: str
    continent: str
    lat: float
    lon: float
    links: Optional[List[str]] = []
    summaries: Optional[List[str]] = []
    sentiment: str

class ListLocation(BaseModel):
    listLocation: List[Location]
    
class LocationFromBot(BaseModel):
    administrative_area: str
    country: str
    continent: str
    lat: float
    lon: float
    summary: str
    sentiment: str

class ListLocationFromBot(BaseModel):
    listLocation: List[LocationFromBot]
    
class LinkArticle(BaseModel):
    title: str
    link: str
    local: Optional[ListLocation] = []

class LocationRequest(BaseModel):
    link_articles: List[LinkArticle]
    files_path: List[str]
    conversationsessionsID: str
    

class ResponseRequest(BaseModel):
    text: str
    isCrawl: bool
    linkSpecific: str
    topK: int
    conversationsessionsID: str
    
class ResponseModel(BaseModel):
    textAnswer: str
    links: List[str]
    locations: List[Location]
    status: str

class EventHandler(AssistantEventHandler):
    def __init__(self):
        super().__init__()
        self.result = None

    @override
    def on_text_created(self, text) -> None:
        print(f"\nassistant > ", end="", flush=True)

    @override
    def on_message_done(self, message) -> None:
        self.result = message.content[0].text.value 