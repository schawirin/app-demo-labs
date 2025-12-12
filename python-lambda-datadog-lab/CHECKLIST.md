# ✅ Checklist de Implementação - Datadog APM Lambda

Use este checklist para garantir que tudo está configurado corretamente.

---

## 📋 Pré-Deploy

### Credenciais
- [ ] API Key do Datadog obtida
- [ ] Site do Datadog identificado (datadoghq.com, datadoghq.eu, etc)
- [ ] Layer ARNs obtidos para sua região e versão Python

### Informações da Lambda
- [ ] Nome da função Lambda identificado
- [ ] Runtime Python confirmado (3.9, 3.10, 3.11 ou 3.12)
- [ ] Região AWS confirmada
- [ ] Handler original anotado (ex: `handler.lambda_handler`)

---

## 🔧 Configuração Terraform

### Layers
- [ ] Datadog Extension Layer ARN adicionado
- [ ] Datadog Python Layer ARN adicionado
- [ ] ARNs correspondem à região da Lambda
- [ ] ARNs correspondem à versão Python da Lambda

### Handler
- [ ] Handler mudado para `datadog_lambda.handler.handler`
- [ ] Variável `DD_LAMBDA_HANDLER` configurada com handler original

### Environment Variables - Obrigatórias
- [ ] `DD_API_KEY` configurada
- [ ] `DD_SITE` configurada
- [ ] `DD_ENV` configurada (ex: production, staging)
- [ ] `DD_SERVICE` configurada (nome do serviço)
- [ ] `DD_VERSION` configurada
- [ ] `DD_LAMBDA_HANDLER` configurada (handler original)

### Environment Variables - Recomendadas
- [ ] `DD_TRACE_ENABLED` = `"true"`
- [ ] `DD_LOGS_INJECTION` = `"true"`
- [ ] `DD_SERVERLESS_LOGS_ENABLED` = `"true"`
- [ ] `DD_ENHANCED_METRICS` = `"true"`
- [ ] `DD_MERGE_XRAY_TRACES` = `"false"`

### Segurança (Opcional mas Recomendado)
- [ ] API Key armazenada em AWS Secrets Manager
- [ ] IAM role tem permissão para ler secret
- [ ] Variável `DD_API_KEY_SECRET_ARN` configurada

---

## 🚀 Deploy

- [ ] `terraform plan` executado e revisado
- [ ] Mudanças aprovadas
- [ ] `terraform apply` executado com sucesso
- [ ] Lambda atualizada sem erros

---

## 🧪 Testes

### Invocar Lambda
- [ ] Lambda invocada manualmente (AWS CLI ou Console)
- [ ] Lambda retornou resposta esperada
- [ ] Sem erros de execução

### Verificar CloudWatch
- [ ] Logs aparecendo no CloudWatch
- [ ] Logs contêm mensagens do Datadog Extension
- [ ] Sem erros relacionados ao Datadog

### Verificar Datadog (aguardar 1-2 min)
- [ ] Service aparece em APM → Services
- [ ] Traces aparecem para as invocações
- [ ] Logs aparecem correlacionados (`dd.trace_id`)
- [ ] Métricas enhanced aparecendo

---

## 📊 Validação Completa

### APM
- [ ] Traces visíveis
- [ ] Latência (p50, p95, p99) aparecendo
- [ ] Throughput calculado
- [ ] Taxa de erro (se houver erros)
- [ ] Service map mostrando Lambda
- [ ] Spans detalhados (aws.lambda, handler, etc)

### Logs
- [ ] Logs estruturados aparecendo
- [ ] Tag `service:` correta
- [ ] Tag `env:` correta
- [ ] Atributo `dd.trace_id` presente
- [ ] Atributo `dd.span_id` presente
- [ ] Link "View Trace" funcionando

### Métricas
- [ ] `aws.lambda.enhanced.invocations` aparecendo
- [ ] `aws.lambda.enhanced.duration` aparecendo
- [ ] `aws.lambda.enhanced.errors` (se houver erros)
- [ ] Cold start metrics visíveis
- [ ] Estimated cost calculado

### Error Tracking
- [ ] Erros capturados (se houver)
- [ ] Stack traces completos
- [ ] Agrupamento de erros funcionando

---

## 🔍 Testes Adicionais

### Distributed Tracing
- [ ] Lambda faz HTTP requests externos?
  - [ ] Spans de HTTP requests aparecendo
  - [ ] Distributed tracing funcionando

### Cold Start
- [ ] Invocar após 5+ minutos de inatividade
- [ ] Cold start identificado no APM
- [ ] Init duration capturado

### Errors
- [ ] Simular erro na Lambda
- [ ] Erro aparece no Error Tracking
- [ ] Stack trace completo visível
- [ ] Correlação com logs funcionando

---

## 📈 Monitoramento Contínuo

### Criar Monitors (Opcional)
- [ ] Monitor de latência alta (p95 > threshold)
- [ ] Monitor de taxa de erro (> 5%)
- [ ] Monitor de cold start excessivo
- [ ] Alertas configurados (email, Slack, PagerDuty)

### Dashboards
- [ ] Dashboard padrão de Lambda revisado
- [ ] Dashboard customizado criado (se necessário)

---

## 🐛 Troubleshooting

Se algo não funcionar, verifique:

### Traces não aparecem
- [ ] Handler = `datadog_lambda.handler.handler`?
- [ ] `DD_LAMBDA_HANDLER` configurada?
- [ ] `DD_TRACE_ENABLED` = `"true"`?
- [ ] Layers corretos adicionados?

### Logs não aparecem
- [ ] `DD_LOGS_INJECTION` = `"true"`?
- [ ] `DD_SERVERLESS_LOGS_ENABLED` = `"true"`?
- [ ] CloudWatch logs habilitado?

### Erro ao invocar
- [ ] Verificar CloudWatch logs
- [ ] Handler wrapper carregou?
- [ ] Layers compatíveis com runtime?

### Nenhum dado no Datadog
- [ ] `DD_API_KEY` correta?
- [ ] `DD_SITE` correto?
- [ ] Network connectivity OK?
- [ ] Aguardou 1-2 minutos?

---

## ✅ Conclusão

Quando todos os itens estiverem marcados:

- ✅ **Setup completo**
- ✅ **APM funcionando**
- ✅ **Logs correlacionados**
- ✅ **Pronto para produção**

---

## 📝 Notas

Data de implementação: ___/___/______

Ambiente: [ ] Development  [ ] Staging  [ ] Production

Responsável: _______________________

Observações:
_____________________________________________
_____________________________________________
_____________________________________________

---

**Última atualização:** Dezembro 2024
