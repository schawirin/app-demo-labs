#!/bin/bash

# Configuration
read -p "Enter your API Key: " API_KEY
read -p "Are you using a proxy? (yes or no): " USE_PROXY
if [ "$USE_PROXY" == "yes" ]; then
    read -p "Enter the proxy IP: " PROXY_IP
else
    PROXY_IP="127.0.0.1"
fi
read -p "Enter the hostname: " HOSTNAME

INTERFACE=$(ls /sys/class/net | grep -E '^en|^eth' | head -n 1) # Detects the network interface
if [ -z "$INTERFACE" ]; then
    echo "No network interface found. Please check manually."
    exit 1
fi

echo "Using network interface: $INTERFACE"
echo "Sending metrics to $PROXY_IP:8125"

# Function to send metrics
send_metrics() {
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8}')
    MEM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
    MEM_USED=$(free -m | awk '/Mem:/ {print $3}')
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    LOAD_AVG=$(cat /proc/loadavg | awk '{print $1}')
    RX_BYTES=$(cat /sys/class/net/$INTERFACE/statistics/rx_bytes)
    TX_BYTES=$(cat /sys/class/net/$INTERFACE/statistics/tx_bytes)

    echo "system.cpu.usage:$CPU_USAGE|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.mem.total:$MEM_TOTAL|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.mem.used:$MEM_USED|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.disk.usage:$DISK_USAGE|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.load.avg:$LOAD_AVG|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.net.rx_bytes:$RX_BYTES|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
    echo "system.net.tx_bytes:$TX_BYTES|g|#host:$HOSTNAME" | nc -u -w1 $PROXY_IP 8125
}

# First run with "Metric sent" message
send_metrics
echo "Metrics sent successfully!"

# Run in background with 15 seconds interval
while true; do
    send_metrics
    sleep 15
done &

echo "Script is running in detached mode."
