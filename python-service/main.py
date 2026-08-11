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
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def cosine_similarity(a, b):
    a_arr = np.array(a, dtype=np.float32).flatten()
    b_arr = np.array(b, dtype=np.float32).flatten()
    
    dot_product = np.dot(a_arr, b_arr)
    norm_a = np.linalg.norm(a_arr)
    norm_b = np.linalg.norm(b_arr)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    return float(dot_product / (norm_a * norm_b))

def normalize_score(similarity: float) -> float:
    min_sim = 0.15
    max_sim = 0.9
    normalized = (similarity - min_sim) / (max_sim - min_sim)
    raw_score = normalized * 10
    clamped_score = max(0.0, min(10.0, raw_score))
    return round(clamped_score, 1)

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
    qid_str = str(input.question_id)
    collection.add(
        embeddings=[answer_embedding.tolist()],
        documents=[input.answer],
        ids=[qid_str]
    )
    return {"status": "ok"}

@app.post("/score-answer")
def score_answer(input: ScoreInput):
    try:
        qid_str = str(input.question_id)
        result = collection.get(
            ids=[qid_str],
            include=["embeddings"]
        )
        
        embeddings = result.get("embeddings")

        if embeddings is None or len(embeddings) == 0:
            return {"status": "error", "score": 0}
    
        correct_embedding = result["embeddings"][0]
        player_embedding = model.encode(input.player_answer)
        similarity = cosine_similarity(correct_embedding, player_embedding)
        score = normalize_score(similarity)
        print(score)
    
        return {"status": "ok", "score": score}
    except Exception as e:
        return {"status": "error", "score": 0}