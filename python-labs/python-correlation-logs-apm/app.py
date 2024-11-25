from flask import Flask, render_template
import logging
from pythonjsonlogger import jsonlogger

# Configurar o logger com JSON Formatter
logger = logging.getLogger()
logHandler = logging.StreamHandler()

# Configurando o formatter para JSON
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s %(dd.trace_id)s %(dd.span_id)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

app = Flask(__name__)

# Função para retornar a página principal
@app.route('/')
def index():
    return render_template('index.html')

# Função que simula gerar um trace, mas não redireciona
@app.route('/generate_trace', methods=['POST'])
def generate_trace():
    logger.info("Trace gerado", extra={"dd.trace_id": "12345", "dd.span_id": "67890"})
    return "Trace created"

# Função que simula gerar um log, mas não redireciona
@app.route('/generate_log', methods=['POST'])
def generate_log():
    logger.info("Test correlation log generated", extra={"dd.trace_id": "12345", "dd.span_id": "67890"})
    return "Log created"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
