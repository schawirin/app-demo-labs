#!/bin/bash

# Configurações
read -p "Qual sua API Key? " API_KEY
read -p "Você está usando proxy? (yes or no): " USE_PROXY
if [ "$USE_PROXY" == "yes" ]; then
    read -p "Adicione o IP do proxy: " PROXY_IP
else
    PROXY_IP="127.0.0.1"
fi
read -p "Adicione o nome do host: " HOSTNAME

INTERFACE=$(ls /sys/class/net | grep -E '^en|^eth' | head -n 1) # Descobre a interface de rede
if [ -z "$INTERFACE" ]; then
    echo "Nenhuma interface de rede encontrada. Verifique manualmente."
    exit 1
fi

echo "Usando interface de rede: $INTERFACE"
echo "Enviando métricas para $PROXY_IP:8125"

# Loop de envio de métricas a cada 15 segundos
while true; do
    # Coleta métricas
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8}')
    MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
    MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    LOAD_AVG=$(cat /proc/loadavg | awk '{print $1}')
    RX_BYTES=$(cat /sys/class/net/$INTERFACE/statistics/rx_bytes)
    TX_BYTES=$(cat /sys/class/net/$INTERFACE/statistics/tx_bytes)

    TIMESTAMP=$(date +%s)

    # Envio via DogStatsD (porta 8125 UDP)
    echo "system.cpu.usage:$CPU_USAGE|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.mem.total:$MEM_TOTAL|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.mem.used:$MEM_USED|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.disk.usage:$DISK_USAGE|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.load.avg:$LOAD_AVG|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.net.rx_bytes:$RX_BYTES|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.net.tx_bytes:$TX_BYTES|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125

    echo "Métricas enviadas em $TIMESTAMP"
    sleep 15
done
