#!/bin/bash

# Função para coletar métricas do sistema
collect_metrics() {
    echo "Coletando métricas do sistema..."

    # CPU
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
    
    # Memória
    MEMORY_TOTAL=$(free -m | awk 'NR==2{print $2}')
    MEMORY_USED=$(free -m | awk 'NR==2{print $3}')
    MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2 }')

    # Disco
    DISK_TOTAL=$(df -h / | awk '$NF=="/"{print $2}')
    DISK_USED=$(df -h / | awk '$NF=="/"{print $3}')
    DISK_USAGE=$(df -h / | awk '$NF=="/"{printf "%s", $5}')

    # Rede
    NETWORK_RX=$(cat /proc/net/dev | awk '/eth0|ens|enp/ {print $2}')
    NETWORK_TX=$(cat /proc/net/dev | awk '/eth0|ens|enp/ {print $10}')

    # Processos
    PROCESSES=$(ps aux --sort=-%mem | head -n 10)

    echo "CPU Uso: $CPU_USAGE%"
    echo "Memória Uso: $MEMORY_USAGE%"
    echo "Memória Total: $MEMORY_TOTAL MB, Usada: $MEMORY_USED MB"
    echo "Disco Uso: $DISK_USAGE"
    echo "Disco Total: $DISK_TOTAL, Usado: $DISK_USED"
    echo "Rede Recebido: $NETWORK_RX bytes, Enviado: $NETWORK_TX bytes"
    echo "Top Processos:"
    echo "$PROCESSES"
}

# Função para enviar métricas para o Datadog
send_to_datadog() {
    API_KEY=$1
    DATADOG_SITE=$2
    HOSTNAME=$3
    PROXY=$4

    echo "Enviando métricas para o Datadog..."
    METRICS_JSON=$(cat <<EOF
{
    "series": [
        {
            "metric": "system.cpu.usage",
            "points": [[ $(date +%s), $CPU_USAGE ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:sandbox", "source:script"]
        },
        {
            "metric": "system.memory.usage",
            "points": [[ $(date +%s), $MEMORY_USAGE ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:sandbox", "source:script"]
        },
        {
            "metric": "system.disk.usage",
            "points": [[ $(date +%s), ${DISK_USAGE%\%} ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:sandbox", "source:script"]
        },
        {
            "metric": "system.network.rx",
            "points": [[ $(date +%s), $NETWORK_RX ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:sandbox", "source:script"]
        },
        {
            "metric": "system.network.tx",
            "points": [[ $(date +%s), $NETWORK_TX ]],
            "type": "gauge",
            "host": "$HOSTNAME",
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
            https://api.${DATADOG_SITE}/api/v1/series
    fi
}

# Script principal
echo "Bem-vindo ao script de monitoramento!"

# Coleta inputs do usuário
read -p "Digite sua API Key do Datadog: " API_KEY
read -p "Digite o Datadog Site (ex.: datadoghq.com ou datadoghq.eu): " DATADOG_SITE
read -p "Digite o nome do host (hostname): " HOSTNAME
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
send_to_datadog "$API_KEY" "$DATADOG_SITE" "$HOSTNAME" "$PROXY"

echo "Script concluído!"
