from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
import os
import redis
import requests

# Imports do LangChain para carregamento, processamento e geração
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Importa o MessagingResponse do Twilio para gerar respostas em TwiML
from twilio.twiml.messaging_response import MessagingResponse

# Configurar conexão com Redis
redis_client = redis.Redis(
    host=os.environ.get("REDIS_HOST", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

# Variável global para armazenar a chain de QA
qa_chain = None

# Define o prompt personalizado para a Julia, incluindo as variáveis "context" e "question"
julia_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "Você é a Julia, uma atendente virtual amigável e empática especializada em orçamentos de serviços residenciais, "
        "como troca de lâmpadas. Sua missão é ajudar o cliente, perguntando o nome, qual serviço ele deseja, informando "
        "um orçamento estimado e confirmando a data e a hora do serviço, sempre com uma comunicação clara e humana.\n\n"
        "Contexto: {context}\n"
        "Cliente: {question}\n"
        "Julia:"
    )
)

async def lifespan(app: FastAPI):
    """
    Handler de lifespan executado no startup da aplicação.
    Carrega os documentos, cria os embeddings e monta a chain de QA utilizando o prompt personalizado.
    Se não houver documentos, exibe uma mensagem de aviso e não inicializa a chain.
    """
    global qa_chain

    # Carrega os documentos da pasta "./documents"
    loader = DirectoryLoader("./documents")
    documents = loader.load()

    if not documents:
        print("Nenhum documento encontrado em './documents'. Certifique-se de adicionar arquivos de texto.")
        yield
        return

    # Divide os documentos em chunks para facilitar o processamento
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs_splitted = text_splitter.split_documents(documents)

    # Cria os embeddings usando a API da OpenAI
    embeddings = OpenAIEmbeddings()

    # Cria ou carrega o vectorstore com Chroma para armazenamento dos embeddings
    vectordb = Chroma.from_documents(docs_splitted, embeddings, persist_directory="/data")

    # Cria a chain de QA utilizando RetrievalQA com o prompt personalizado da Julia
    qa_chain = RetrievalQA.from_chain_type(
        llm=OpenAI(model_name="gpt-3.5-turbo", temperature=0),
        chain_type="stuff",
        retriever=vectordb.as_retriever(),
        chain_type_kwargs={"prompt": julia_prompt}
    )

    yield  # Indica que o startup foi concluído

# Cria a aplicação FastAPI, utilizando o lifespan handler
app = FastAPI(lifespan=lifespan)

# Modelo para receber a pergunta do cliente (usado no endpoint /ask)
class Question(BaseModel):
    query: str

@app.get("/health")
def health():
    """
    Endpoint de health-check para confirmar que o serviço está online.
    """
    return {"status": "ok"}

@app.post("/ask")
def ask_question(payload: Question):
    """
    Endpoint que recebe uma pergunta (query) e retorna a resposta gerada pela chain de QA.
    Se a chain não foi inicializada (por falta de documentos), retorna um erro.
    """
    global qa_chain
    if not qa_chain:
        return {"error": "Chain não foi inicializada. Verifique se há documentos na base de conhecimento."}
    answer = qa_chain.run(payload.query)
    return {"answer": answer}

@app.post("/chat")
async def chat_webhook(request: Request):
    """
    Endpoint para gerenciar a conversa via WhatsApp.
    Salva informações no Redis para não repetir perguntas e para manter o contexto.
    Exemplo de fluxo:
      - Se não houver nome salvo, pergunta "Como você se chama?"
      - Se o nome já estiver salvo e a mensagem conter "lâmpada", responde com o orçamento.
      - Caso contrário, segue perguntando conforme necessário.
    """
    data = await request.form()
    incoming_msg = data.get("Body", "").strip()
    sender = data.get("From", "").strip()  # Ex: "whatsapp:+5511974202113"

    # Chave para armazenar os dados do usuário no Redis
    user_key = f"user:{sender}"
    user_data = redis_client.hgetall(user_key)

    # Fluxo de conversa baseado no estado armazenado
    if "nome" not in user_data or not user_data["nome"]:
        if "me chamo" in incoming_msg.lower() or "sou" in incoming_msg.lower():
            # Exemplo simples: pegar a última palavra como nome (ajuste conforme necessário)
            nome = incoming_msg.split()[-1].capitalize()
            redis_client.hset(user_key, "nome", nome)
            resposta = f"Prazer, {nome}. Para qual dia fica melhor para enviarmos um especialista à sua residência?"
        else:
            resposta = "Olá! Como você se chama?"
    else:
        nome = user_data["nome"]
        if "lâmpada" in incoming_msg.lower():
            redis_client.hset(user_key, "servico", "Troca de lâmpada")
            resposta = f"{nome}, o orçamento para troca de lâmpada é R$ 120,00. Qual o melhor dia e horário para o agendamento?"
        elif "confirmo" in incoming_msg.lower() or "ok" in incoming_msg.lower():
            # Suponha que essa seja a confirmação final
            redis_client.hset(user_key, "confirmado", "sim")
            resposta = ("Verificamos e temos agenda livre do Técnico Marcelo. Lembrando que pedimos 40% do serviço antecipadamente e "
                        "o restante é pago quando finalizamos o serviço. Aqui está nossa chave Pix: 222334488899")
        else:
            resposta = f"{nome}, por favor, poderia confirmar seu endereço?"
            # Aqui você pode salvar o endereço se o usuário fornecer

    # Cria a resposta TwiML
    resp = MessagingResponse()
    resp.message(resposta)

    return Response(content=str(resp), media_type="application/xml")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
