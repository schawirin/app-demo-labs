#!/usr/bin/env python3
import time
import socket
from datadog import initialize, api

# Solicitar informações do usuário
API_KEY = input("Digite sua API Key do Datadog: ")
DATADOG_SITE = input("Digite o Datadog Site (ex.: datadoghq.com ou datadoghq.eu): ")
HOSTNAME = input("Digite o nome do host (hostname): ")

# Inicializar a biblioteca do Datadog
options = {
    "api_key": API_KEY,
    "api_host": f"https://api.{DATADOG_SITE}",  # Define o site com base no input
}
initialize(**options)

# Função para enviar métricas via API
def send_metrics_api():
    metrics_payload = {
        "series": [
            {
                "metric": "system.cpu.user",
                "points": [[time.time(), 30.5]],
                "type": "gauge",
                "host": HOSTNAME,
                "tags": ["env:sandbox", "source:script"],
            },
            {
                "metric": "system.mem.used",
                "points": [[time.time(), 2048]],
                "type": "gauge",
                "host": HOSTNAME,
                "tags": ["env:sandbox", "source:script"],
            },
        ]
    }
    response = api.Metric.send(**metrics_payload)
    print("Métricas enviadas via API:", response)

# Função para enviar métricas via DogStatsD
def send_metrics_dogstatsd():
    # Configuração do DogStatsD
    statsd_host = "127.0.0.1"
    statsd_port = 8125

    # Criar socket UDP
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # Métricas no formato DogStatsD
    metrics = [
        f"system.cpu.user:30.5|g|#env:sandbox,source:script,host:{HOSTNAME}",
        f"system.mem.used:2048|g|#env:sandbox,source:script,host:{HOSTNAME}",
    ]

    # Enviar métricas
    for metric in metrics:
        sock.sendto(metric.encode(), (statsd_host, statsd_port))
    print("Métricas enviadas via DogStatsD.")

# Menu de execução com envio contínuo
if __name__ == "__main__":
    print("Enviando métricas para o Datadog a cada 10 segundos. Pressione Ctrl+C para parar.")
    try:
        while True:
            send_metrics_api()  # Enviar via API
            send_metrics_dogstatsd()  # Enviar via DogStatsD
            time.sleep(10)  # Pausar por 10 segundos
    except KeyboardInterrupt:
        print("\nScript encerrado pelo usuário.")
