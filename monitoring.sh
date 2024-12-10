#!/bin/bash

# Função para coletar métricas do sistema
collect_metrics() {
    echo "Coletando métricas do sistema..."
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
    MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2 }')
    DISK_USAGE=$(df -h / | awk '$NF=="/"{printf "%s", $5}')
    NETWORK_USAGE=$(ifconfig | grep "RX packets" | awk '{print $5}' | head -n 1)

    echo "CPU: $CPU_USAGE%"
    echo "Memória: $MEMORY_USAGE%"
    echo "Disco: $DISK_USAGE"
    echo "Rede: $NETWORK_USAGE bytes recebidos"
}

# Função para enviar métricas para o Datadog
send_to_datadog() {
    API_KEY=$1
    PROXY=$2

    echo "Enviando métricas para o Datadog..."
    METRICS_JSON=$(cat <<EOF
{
    "series": [
        {
            "metric": "system.cpu.usage",
            "points": [[ $(date +%s), $CPU_USAGE ]],
            "type": "gauge",
            "tags": ["env:sandbox", "source:script"]
        },
        {
            "metric": "system.memory.usage",
            "points": [[ $(date +%s), $MEMORY_USAGE ]],
            "type": "gauge",
            "tags": ["env:sandbox", "source:script"]
        }
    ]
}
EOF
)

    if [ "$PROXY" == "yes" ]; then
        echo "Usando proxy para envio..."
        curl -X POST -H "Content-type: application/json" \
            -H "DD-API-KEY: $API_KEY" \
            -d "$METRICS_JSON" \
            http://$PROXY/api/v1/series
    else
        echo "Enviando diretamente para a API do Datadog..."
        curl -X POST -H "Content-type: application/json" \
            -H "DD-API-KEY: $API_KEY" \
            -d "$METRICS_JSON" \
            https://api.datadoghq.com/api/v1/series
    fi
}

# Script principal
echo "Bem-vindo ao script de monitoramento!"

# Coleta inputs do usuário
read -p "Qual sua API Key? " API_KEY
read -p "Você vai usar um Datadog Proxy? (yes/no) " USE_PROXY

if [ "$USE_PROXY" == "yes" ]; then
    read -p "Qual o IP do seu proxy? " PROXY_IP
    PROXY=$PROXY_IP
else
    PROXY="no"
fi

# Coletar métricas
collect_metrics

# Enviar métricas
send_to_datadog "$API_KEY" "$PROXY"

echo "Script concluído!"
