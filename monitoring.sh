#!/bin/bash

# Pergunta ao usuário as configurações necessárias
read -p "Qual sua API Key? " DD_API_KEY
read -p "Você está usando proxy? (yes or no): " USE_PROXY

if [[ "$USE_PROXY" == "yes" ]]; then
    read -p "Adicione o IP do proxy: " PROXY_IP
    export http_proxy="http://$PROXY_IP"
    export https_proxy="http://$PROXY_IP"
fi

read -p "Adicione o nome do host: " HOST_NAME

# Configuração do endereço DogStatsD local (Datadog Agent)
DOGSTATSD_SERVER="127.0.0.1"
DOGSTATSD_PORT="8125"

# Função para enviar métricas
send_metric() {
    METRIC_NAME=$1
    METRIC_VALUE=$2
    METRIC_TYPE=$3
    METRIC_TAGS=$4
    echo "$METRIC_NAME:$METRIC_VALUE|$METRIC_TYPE|#$METRIC_TAGS" | nc -u -w1 $DOGSTATSD_SERVER $DOGSTATSD_PORT
}

# Loop infinito para envio das métricas a cada 15 segundos
while true; do
    # CPU Usage
    CPU_USAGE=$(grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}')
    send_metric "system.cpu.usage" "$CPU_USAGE" "g" "host:$HOST_NAME"

    # Memory Usage
    MEM_TOTAL=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEM_FREE=$(grep MemFree /proc/meminfo | awk '{print $2}')
    MEM_USAGE=$((MEM_TOTAL - MEM_FREE))
    send_metric "system.memory.usage" "$MEM_USAGE" "g" "host:$HOST_NAME"

    # Disk Usage
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
    send_metric "system.disk.usage" "$DISK_USAGE" "g" "host:$HOST_NAME"

    # Network Traffic (bytes received/transmitted)
    RX_BYTES=$(cat /sys/class/net/eth0/statistics/rx_bytes)
    TX_BYTES=$(cat /sys/class/net/eth0/statistics/tx_bytes)
    send_metric "system.net.rx_bytes" "$RX_BYTES" "g" "host:$HOST_NAME"
    send_metric "system.net.tx_bytes" "$TX_BYTES" "g" "host:$HOST_NAME"

    # Load Average
    LOAD_AVG=$(cat /proc/loadavg | awk '{print $1}')
    send_metric "system.load.1min" "$LOAD_AVG" "g" "host:$HOST_NAME"

    # Espera 15 segundos antes da próxima iteração
    sleep 15
done
