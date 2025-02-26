from twilio.rest import Client

# Substitua pelos valores corretos
account_sid = "AC4b2c9f3e58d547ba1c563c10e8e29722"
auth_token = "200e3ae3bcfc350f8a9601329bf5367c"
client = Client(account_sid, auth_token)

message = client.messages.create(
    from_="whatsapp:+14155238886",  # Número do Sandbox ou seu número aprovado
    body="Your appointment is coming up on July 21 at 3PM",
    to="whatsapp:+5511974202113"    # Número que vai receber a mensagem
)

print(message.sid)
