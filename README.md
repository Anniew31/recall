# Recall

A real-time multiplayer study game where players upload their notes, submit questions from the material, and race to answer them under a countdown timer. Answers are graded semantically using vector embeddings — partial credit for close answers, not just exact matches.

**Live demo → [recall-tool.vercel.app](https://recall-tool.vercel.app)**

## Tech Stack

**Backend**

Node.js + Socket.io — WebSocket-based real-time game state, room management, and server-driven timers synced across all clients

**Embedding Service**

Python + FastAPI — REST API for PDF text extraction, answer embedding generation, and semantic scoring
using sentence-transformers (all-MiniLM-L6-v2)
ChromaDB — vector store for answer embeddings, queried at scoring time via cosine similarity
PyMuPDF — PDF text extraction from uploaded study notes

**Frontend**

React + TypeScript + Tailwind CSS

**Infrastructure**

Docker Compose — local multi-service orchestration
Vercel (client) + Railway (Node server + Python service)

## Architecture

Upload notes (PyMuPDF extracts text) → submit questions (sentence-transformers embeds correct answers into ChromaDB) → round starts (Node server broadcasts question + drives countdown via Socket.io) → players submit answers (Python service scores via cosine similarity against stored embeddings) → results + leaderboard broadcast to all clients