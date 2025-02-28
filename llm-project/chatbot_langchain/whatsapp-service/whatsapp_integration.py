from fastapi import FastAPI, Request, Response
from twilio.twiml.messaging_response import MessagingResponse
import redis
import os

app = FastAPI()

# Conecta ao Redis usando as variáveis de ambiente.
# Em ambiente Docker, use host "redis" para se conectar ao container Redis.
redis_client = redis.Redis(
    host=os.environ.get("REDIS_HOST", "redis"),
    port=int(os.environ.get("REDIS_PORT", 6379)),
    db=0,
    password=os.environ.get("REDIS_PASSWORD", None),
    decode_responses=True
)

def extrair_nome(mensagem: str) -> str:
    """
    Função simples para extrair nome a partir de uma mensagem.
    Exemplo: "Me chamo Pedro" -> retorna "Pedro".
    """
    partes = mensagem.split()
    return partes[-1].capitalize() if partes else ""

@app.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Endpoint para receber mensagens do Twilio via WhatsApp.
    Gerencia o fluxo de conversa salvando dados no Redis para evitar perguntas redundantes.
    """
    data = await request.form()
    incoming_msg = data.get("Body", "").strip()
    sender = data.get("From", "").strip()  # Ex: "whatsapp:+5511974202113"

    # Cria uma chave única para o usuário no Redis.
    user_key = f"user:{sender}"
    user_data = redis_client.hgetall(user_key)  # Obtém dados salvos (nome, serviço, etapa, etc.)

    # Define a etapa atual; se nada foi salvo, inicia com "INICIO".
    etapa = user_data.get("etapa", "INICIO")

    # Lógica de fluxo de conversa baseada na etapa armazenada
    if etapa == "INICIO":
        answer = "Olá! Sou a Julia, sua atendente virtual. Como posso ajudar hoje?"
        redis_client.hset(user_key, "etapa", "PERGUNTAR_NOME")
    elif etapa == "PERGUNTAR_NOME":
        if "me chamo" in incoming_msg.lower():
            nome = extrair_nome(incoming_msg)
            redis_client.hset(user_key, "nome", nome)
            redis_client.hset(user_key, "etapa", "PERGUNTAR_SERVICO")
            answer = f"Muito prazer, {nome}! Qual serviço você precisa?"
        else:
            answer = "Qual seu nome, por favor?"
    elif etapa == "PERGUNTAR_SERVICO":
        if "tomada" in incoming_msg.lower():
            redis_client.hset(user_key, "servico", "troca de tomadas")
            redis_client.hset(user_key, "etapa", "AGENDAR_DATA")
            answer = "Para troca de 3 tomadas, o valor total é R$ 297,00. Qual data é melhor para você?"
        elif "lâmpada" in incoming_msg.lower():
            redis_client.hset(user_key, "servico", "troca de lâmpada")
            redis_client.hset(user_key, "etapa", "AGENDAR_DATA")
            answer = "Para troca de lâmpada, o valor estimado é R$ 120,00. Qual data é melhor para você?"
        else:
            answer = "Qual serviço você precisa mesmo?"
    elif etapa == "AGENDAR_DATA":
        # Aqui, consideramos a mensagem como a data/hora desejada para o serviço.
        redis_client.hset(user_key, "data", incoming_msg)
        redis_client.hset(user_key, "etapa", "FIM")
        answer = f"Ótimo! Agendado para {incoming_msg}. Obrigada."
    elif etapa == "FIM":
        nome = user_data.get("nome", "cliente")
        servico = user_data.get("servico", "serviço")
        data_agendada = user_data.get("data", "data não especificada")
        answer = f"{nome}, seu {servico} está agendado para {data_agendada}. Precisa de algo mais?"
    else:
        answer = "Desculpe, ocorreu um erro no fluxo. Vamos recomeçar?"
        redis_client.hset(user_key, "etapa", "INICIO")

    # Monta a resposta TwiML para que o Twilio envie a mensagem no WhatsApp
    resp = MessagingResponse()
    resp.message(answer)
    
    return Response(content=str(resp), media_type="application/xml")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
