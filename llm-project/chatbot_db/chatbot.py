import openai
import psycopg2

# Configuração da API OpenAI
openai.api_key = "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"

# Configuração do Banco de Dados RDS PostgreSQL
DB_HOST = "llm-dbm.c102aia0et2w.us-east-1.rds.amazonaws.com"
DB_NAME = "postgres"
DB_USER = "db_admin"
DB_PASSWORD = "llm-dbm-778899"

# Lista de serviços disponíveis
SERVICOS_DISPONIVEIS = ["troca de lâmpada", "troca de tomada", "troca de chuveiro"]

def conectar_bd():
    """Cria a conexão com o banco de dados RDS PostgreSQL."""
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def buscar_preco_servico(servico):
    """Consulta o preço do serviço no RDS PostgreSQL."""
    conn = conectar_bd()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT preco_base FROM servicos WHERE nome = %s", (servico,))
        resultado = cursor.fetchone()
        return resultado[0] if resultado else None
    except psycopg2.Error as e:
        print(f"Erro no banco de dados: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def chatbot():
    print("Chatbot: Olá! Como posso ajudar você hoje?")

    while True:
        user_input = input("Você: ").lower()

        if user_input in ["sair", "exit"]:
            print("Chatbot: Obrigado por usar nosso serviço. Até logo!")
            break

        # Verifica se o usuário está pedindo um orçamento de serviço
        servico_encontrado = None
        for servico in SERVICOS_DISPONIVEIS:
            if servico in user_input:
                servico_encontrado = servico
                break  # Sai do loop ao encontrar um serviço correspondente

        if servico_encontrado:
            print(f"Chatbot: Você deseja um orçamento para {servico_encontrado}, correto?")
            confirmacao = input("Você (sim/não): ").lower()

            if confirmacao == "sim":
                preco_base = buscar_preco_servico(servico_encontrado)

                if preco_base:
                    print(f"Chatbot: O preço estimado para {servico_encontrado} é **R$ {preco_base:.2f}**.")
                    
                    # Pergunta sobre o agendamento
                    print("Chatbot: Gostaria de agendar uma visita para realizar o serviço?")
                    agendar = input("Você (sim/não): ").lower()

                    if agendar == "sim":
                        print("Chatbot: Para qual dia e horário você gostaria de agendar?")
                        data_horario = input("Você: ")
                        print(f"Chatbot: Seu agendamento para {servico_encontrado} foi registrado para {data_horario}. Um profissional entrará em contato.")

                    print("Chatbot: Obrigado por contar com nossos serviços! Precisa de mais alguma ajuda?")
                    continue  # Pula para a próxima interação

                else:
                    print("Chatbot: Infelizmente, não encontrei esse serviço no sistema. Você pode tentar novamente?")
                    continue

        # Se não for um pedido de orçamento, usa OpenAI para responder
        print("Chatbot: Não entendi... pode reformular a pergunta?")

if __name__ == "__main__":
    chatbot()
