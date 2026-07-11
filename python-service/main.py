from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from sentence_transformers import SentenceTransformer
import chromadb
import fitz
from pydantic import BaseModel
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')
app = FastAPI()
client = chromadb.Client()
collection = client.get_or_create_collection("answers")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def normalize_score(similarity: float) -> float:
    min_sim = 0.15
    max_sim = 0.9
    normalized = (similarity - min_sim) / (max_sim - min_sim)
    return round(max(0.0, min(1.0, normalized)) * 10, 1)

class AnswerInput(BaseModel):
    question_id: str
    question: str
    answer: str

class ScoreInput(BaseModel):
    question_id: str
    player_answer: str

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return {
        "status": "ok",
        "text": text
    }

@app.post("/embed-answer")
def embed_answer(input: AnswerInput):
    answer_embedding = model.encode(input.answer)
    collection.add(
        embeddings=[answer_embedding.tolist()],
        documents=[input.answer],
        ids=[input.question_id]
    )
    return {"status": "ok"}

@app.post("/score-answer")
def score_answer(input: ScoreInput):
    player_embedding = model.encode(input.player_answer)
    result = collection.get(
        ids=[input.question_id],
        include=["embeddings"]
    )

    if len(result["embeddings"]) == 0:
        return {"status": "error", "score": 0}
    
    correct_embedding = result["embeddings"][0]
    raw_similarity = cosine_similarity(correct_embedding, player_embedding)
    return {
        "status": "ok",
        "score": normalize_score(raw_similarity)
    }
