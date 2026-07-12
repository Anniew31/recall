from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from sentence_transformers import SentenceTransformer
import chromadb
import fitz
from pydantic import BaseModel
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')
app = FastAPI()
client = chromadb.PersistentClient(path="./chromadb_data")
collection = client.get_or_create_collection("answers")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def cosine_similarity(a, b):
    a_flat = np.ravel(a)
    b_flat = np.ravel(b)
    
    dot_product = np.dot(a_flat, b_flat)
    norm_a = np.linalg.norm(a_flat)
    norm_b = np.linalg.norm(b_flat)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    return float(dot_product / (norm_a * norm_b))

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
    try:
        result = collection.get(
            ids=[input.question_id],
            include=["embeddings"]
        )
        
        embeddings = result.get("embeddings")

        if embeddings is None or len(embeddings) == 0:
            return {"status": "error", "score": 0}
    
        correct_embedding = result["embeddings"][0]
        player_embedding = model.encode(input.player_answer)
        similarity = cosine_similarity(correct_embedding, player_embedding)
        score = normalize_score(similarity)
    
        return {"status": "ok", "score": score}
    except Exception as e:
        return {"status": "error", "score": 0}