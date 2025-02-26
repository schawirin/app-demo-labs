#!/bin/bash

# Função para detectar o hostname automaticamente
detectar_hostname() {
    # Tenta obter o hostname totalmente qualificado
    HOSTNAME=$(hostname -f 2>/dev/null)
    if [ -z "$HOSTNAME" ]; then
        # Se falhar, tenta obter o hostname padrão
        HOSTNAME=$(hostname 2>/dev/null)
    fi
    if [ -z "$HOSTNAME" ]; then
        echo "Não foi possível determinar o hostname automaticamente."
        exit 1
    fi
}

# Função para obter o endereço IP do host
obter_ip_host() {
    IP_ADDRESS=$(hostname -I | awk '{print $1}')
    if [ -z "$IP_ADDRESS" ]; then
        echo "Não foi possível determinar o endereço IP do host."
        exit 1
    fi
}

# Configurações
read -p "Qual sua API Key? " API_KEY
read -p "Você está usando proxy? (yes or no): " USE_PROXY
if [ "$USE_PROXY" == "yes" ]; then
    read -p "Adicione o IP do proxy: " PROXY_IP
else
    PROXY_IP="127.0.0.1"
fi

# Detecta o hostname automaticamente
detectar_hostname
echo "Hostname detectado: $HOSTNAME"

# Obtém o endereço IP do host
obter_ip_host
echo "Endereço IP do host: $IP_ADDRESS"

# Descobre a interface de rede
INTERFACE=$(ls /sys/class/net | grep -E '^en|^eth' | head -n 1)
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
    echo "system.cpu.usage:$CPU_USAGE|g|#host:$HOSTNAME,ip:$IP_ADDRESS" | nc -u -w1 $PROXY_IP 8125
    echo "system.mem.total:$MEM_TOTAL|g|#host:$HOSTNAME,ip:$IP_ADDRESS" | nc -u -w1 $PROXY_IP 8125
    echo "system.mem.used:$MEM_USED|g|#host:$HOSTNAME,ip:$IP_ADDRESS" | nc -u -w1 $PROXY_IP 8125
    echo "system.disk.usage:$DISK_USAGE|g|#host:$HOSTNAME,ip:$IP_ADDRESS" | nc -u -w1 $PROXY_IP 8125
    echo "system.load.avg:$LOAD_AVG|g|#host:$HOSTNAME,ip:$IP_ADDRESS" | nc -u -w1 $PROXY_IP 8125
    echo "system.net.rx_bytes:$RX_BYTES|g|#host:$HOSTNAME,ip:$IP_ADDRESS" | nc -u -w1 $PROXY_IP 8125
    echo "system.net.tx_bytes:$TX_BYTES|g|#host:$HOSTNAME,ip:$IP_ADDRESS" | nc -u -w1 $PROXY_IP 8125

    echo "Métricas enviadas em $TIMESTAMP"
    sleep 15
done
