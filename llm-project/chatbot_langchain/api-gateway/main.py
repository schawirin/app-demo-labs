from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Modelo para receber o texto do usuário (exemplo)
class Query(BaseModel):
    text: str

# Endpoint de health check
@app.get("/health")
def health():
    return {"status": "ok"}

# Endpoint de chat (exemplo)
@app.post("/chat")
def chat(query: Query):
    # Aqui você chamaria o seu LangChain ou outra lógica para gerar resposta
    return {"response": f"Você disse: {query.text}"}
