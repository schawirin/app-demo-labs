import psutil
from datadog import initialize, statsd

# Configuração Interativa
def configure_datadog():
    api_key = input("Qual sua API Key do Datadog? ").strip()
    use_proxy = input("Você está usando proxy? (yes/no): ").strip().lower()
    
    proxy = None
    if use_proxy == "yes":
        proxy = input("Adicione o IP do proxy: ").strip()
    
    host_name = input("Adicione o nome do host: ").strip()

    return api_key, proxy, host_name

# Inicialização do Datadog
def initialize_datadog(api_key, proxy=None, host_name=None):
    options = {
        'api_key': api_key,
        'statsd_host': '127.0.0.1',
        'statsd_port': 8125,
        'hostname': host_name,
    }

    if proxy:
        options['proxies'] = {'http': proxy, 'https': proxy}
    
    initialize(**options)
    return options

# Coleta e envio de métricas
def collect_and_send_metrics():
    # CPU
    cpu_percent = psutil.cpu_percent(interval=1)
    statsd.gauge('system.cpu.percent', cpu_percent)

    # Memória
    memory = psutil.virtual_memory()
    statsd.gauge('system.memory.total', memory.total)
    statsd.gauge('system.memory.used', memory.used)
    statsd.gauge('system.memory.free', memory.free)
    statsd.gauge('system.memory.percent', memory.percent)

    # Disco
    disk = psutil.disk_usage('/')
    statsd.gauge('system.disk.total', disk.total)
    statsd.gauge('system.disk.used', disk.used)
    statsd.gauge('system.disk.free', disk.free)
    statsd.gauge('system.disk.percent', disk.percent)

    # Load Average (Unix-specific)
    if hasattr(psutil, "getloadavg"):
        load1, load5, load15 = psutil.getloadavg()
        statsd.gauge('system.load.1', load1)
        statsd.gauge('system.load.5', load5)
        statsd.gauge('system.load.15', load15)

    # Rede
    net_io = psutil.net_io_counters()
    statsd.gauge('system.net.bytes_sent', net_io.bytes_sent)
    statsd.gauge('system.net.bytes_recv', net_io.bytes_recv)

def main():
    print("=== Configuração Datadog ===")
    api_key, proxy, host_name = configure_datadog()
    print("\nInicializando Datadog...")
    initialize_datadog(api_key, proxy, host_name)
    print("Coletando e enviando métricas para Datadog...\n")
    
    collect_and_send_metrics()
    print("Métricas enviadas com sucesso!")

if __name__ == "__main__":
    main()
