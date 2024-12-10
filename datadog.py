import time
from datadog import initialize, api

# Solicitar informações do usuário
API_KEY = input("Digite sua API Key do Datadog: ")
DATADOG_SITE = input("Digite o Datadog Site (ex.: datadoghq.com ou datadoghq.eu): ")
HOSTNAME = input("Digite o nome do host (hostname): ")
ENVIRONMENT = input("Digite o ambiente (ex.: production, staging, sandbox): ")

# Inicializar a biblioteca do Datadog
options = {
    "api_key": API_KEY,
    "api_host": f"https://api.{DATADOG_SITE}",  # Define o site com base no input
}
initialize(**options)

# Função para enviar métricas via API
def send_metrics_api():
    current_time = time.time()  # Timestamp atual
    metrics_payload = {
        "series": [
            {
                "metric": "system.cpu.user",
                "points": [[current_time, 30.5]],  # Timestamp e valor
                "type": "gauge",
                "host": HOSTNAME,
                "tags": [f"env:{ENVIRONMENT}", "source:script"],
            },
            {
                "metric": "system.mem.used",
                "points": [[current_time, 2048]],  # Timestamp e valor
                "type": "gauge",
                "host": HOSTNAME,
                "tags": [f"env:{ENVIRONMENT}", "source:script"],
            },
        ]
    }
    try:
        response = api.Metric.send(**metrics_payload)
        print("Métricas enviadas via API:", response)
    except Exception as e:
        print(f"Erro ao enviar métricas: {e}")

# Menu de execução com envio contínuo
if __name__ == "__main__":
    print("Enviando métricas para o Datadog a cada 10 segundos. Pressione Ctrl+C para parar.")
    try:
        while True:
            send_metrics_api()  # Enviar via API
            time.sleep(10)  # Pausar por 10 segundos
    except KeyboardInterrupt:
        print("\nScript encerrado pelo usuário.")
