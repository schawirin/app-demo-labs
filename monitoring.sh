#!/bin/bash

# Caminhos para os arquivos
CONFIG_FILE="/etc/monitoring_script.conf"
SERVICE_FILE="/etc/systemd/system/monitoring_script.service"
SCRIPT_PATH="/usr/local/bin/monitoring_script.sh"

# Criar arquivo de configuração
create_config() {
    echo "Criando arquivo de configuração em $CONFIG_FILE..."
    cat <<EOF > $CONFIG_FILE
API_KEY=$API_KEY
DATADOG_SITE=$DATADOG_SITE
HOSTNAME=$HOSTNAME
ENVIRONMENT=$ENVIRONMENT
PROXY=$PROXY
EOF
    echo "Arquivo de configuração criado com sucesso."
}

# Criar script de monitoramento
create_script() {
    echo "Criando script de monitoramento em $SCRIPT_PATH..."
    cat <<'EOF' > $SCRIPT_PATH
#!/bin/bash
source /etc/monitoring_script.conf

collect_metrics() {
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
    MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2 }')
    DISK_USAGE=$(df -h / | awk '$NF=="/"{printf "%s", $5}')
    NETWORK_RX=$(cat /proc/net/dev | awk '/eth0|ens|enp/ {print $2}')
    NETWORK_TX=$(cat /proc/net/dev | awk '/eth0|ens|enp/ {print $10}')
    SERVICES=$(systemctl list-units --type=service --state=running | awk '{if (NR>1) print $1}' | tr '\n' ',')
}

send_to_datadog() {
    METRICS_JSON=$(cat <<EOF2
{
    "series": [
        {
            "metric": "system.cpu.usage",
            "points": [[ $(date +%s), $CPU_USAGE ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:$ENVIRONMENT", "source:script"]
        },
        {
            "metric": "system.memory.usage",
            "points": [[ $(date +%s), $MEMORY_USAGE ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:$ENVIRONMENT", "source:script"]
        },
        {
            "metric": "system.disk.usage",
            "points": [[ $(date +%s), ${DISK_USAGE%?} ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:$ENVIRONMENT", "source:script"]
        },
        {
            "metric": "system.network.rx",
            "points": [[ $(date +%s), $NETWORK_RX ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:$ENVIRONMENT", "source:script"]
        },
        {
            "metric": "system.network.tx",
            "points": [[ $(date +%s), $NETWORK_TX ]],
            "type": "gauge",
            "host": "$HOSTNAME",
            "tags": ["env:$ENVIRONMENT", "source:script"]
        }
    ]
}
EOF2
)

    SERVICES_LOG_JSON=$(cat <<EOF3
{
    "ddsource": "script",
    "service": "services-status",
    "hostname": "$HOSTNAME",
    "env": "$ENVIRONMENT",
    "message": "Running services: $SERVICES"
}
EOF3
)

    if [ "$PROXY" != "no" ]; then
        curl -X POST -H "Content-type: application/json" \
            -H "DD-API-KEY: $API_KEY" \
            -d "$METRICS_JSON" \
            http://$PROXY/api/v1/series

        curl -X POST -H "Content-type: application/json" \
            -H "DD-API-KEY: $API_KEY" \
            -d "$SERVICES_LOG_JSON" \
            http://$PROXY:10514/v1/input
    else
        curl -X POST -H "Content-type: application/json" \
            -H "DD-API-KEY: $API_KEY" \
            -d "$METRICS_JSON" \
            https://api.${DATADOG_SITE}/api/v1/series

        curl -X POST -H "Content-type: application/json" \
            -H "DD-API-KEY: $API_KEY" \
            -d "$SERVICES_LOG_JSON" \
            https://http-intake.logs.${DATADOG_SITE}/v1/input
    fi
}

while true; do
    collect_metrics
    send_to_datadog
    sleep 10
done
EOF
    chmod +x $SCRIPT_PATH
    echo "Script de monitoramento criado com sucesso."
}

# Criar serviço systemd
create_service() {
    echo "Criando serviço systemd em $SERVICE_FILE..."
    cat <<EOF > $SERVICE_FILE
[Unit]
Description=Monitoring Script Service
After=network.target

[Service]
ExecStart=$SCRIPT_PATH
Restart=always
EnvironmentFile=$CONFIG_FILE

[Install]
WantedBy=multi-user.target
EOF
    echo "Serviço systemd criado com sucesso."
}

# Inputs do usuário
read -p "Digite sua API Key do Datadog: " API_KEY
read -p "Digite o Datadog Site (ex.: datadoghq.com ou datadoghq.eu): " DATADOG_SITE
read -p "Digite o nome do host (hostname): " HOSTNAME
read -p "Digite o ambiente (env): " ENVIRONMENT
read -p "Você vai usar um Datadog Proxy? (yes/no): " USE_PROXY

if [ "$USE_PROXY" == "yes" ]; then
    read -p "Qual o IP do seu proxy? " PROXY
else
    PROXY="no"
fi

# Criar arquivos
create_config
create_script
create_service

# Ativar e iniciar o serviço
systemctl daemon-reload
systemctl enable monitoring_script
systemctl start monitoring_script

echo "Script de monitoramento configurado e iniciado com sucesso!"
