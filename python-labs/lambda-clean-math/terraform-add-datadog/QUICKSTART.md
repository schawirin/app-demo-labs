# QuickStart - Adicionar Datadog em 3 Passos

## 🚀 Instrumentar em 3 comandos

```bash
# 1. Export AWS credentials
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_SESSION_TOKEN="YOUR_AWS_SESSION_TOKEN"

# 2. Go to terraform directory
cd python-labs/lambda-clean-math/terraform-add-datadog

# 3. Run deploy script
./deploy.sh
```

**Pronto! Datadog instrumentado sem mudar código!** 🎉

---

## 📋 Passo a Passo Manual

### 1. Verify Lambda exists

```bash
aws lambda get-function \
  --function-name clean-math-lambda \
  --region us-east-1
```

### 2. Initialize Terraform

```bash
cd python-labs/lambda-clean-math/terraform-add-datadog
terraform init
```

### 3. Preview changes

```bash
terraform plan
```

**Você verá:**
- Handler mudando de `handler.lambda_handler` → `datadog_lambda.handler.handler`
- 2 Layers sendo adicionados
- ~12 environment variables sendo adicionadas

### 4. Apply

```bash
terraform apply
```

Digite `yes`

### 5. Test

```bash
aws lambda invoke \
  --function-name clean-math-lambda \
  --cli-binary-format raw-in-base64-out \
  --payload '{"operation":"fibonacci","number":20}' \
  --region us-east-1 \
  response.json

cat response.json | jq '.'
```

### 6. Check Datadog

Aguarde 30-60 segundos e acesse:

**APM:**
```
https://app.datadoghq.com/apm/traces?query=service:clean-math-lambda
```

**Logs:**
```
https://app.datadoghq.com/logs?query=service:clean-math-lambda
```

---

## 🧪 Teste Múltiplas Invocações

```bash
# Run 10 invocations
for i in {1..10}; do
  echo "Invocation $i"
  aws lambda invoke \
    --function-name clean-math-lambda \
    --cli-binary-format raw-in-base64-out \
    --payload "{\"operation\":\"fibonacci\",\"number\":$((10 + i))}" \
    --region us-east-1 \
    /tmp/resp$i.json > /dev/null 2>&1
  sleep 1
done

echo "✅ 10 invocations completed!"
echo "Check Datadog APM now!"
```

---

## 📊 O que Verificar no Datadog

### 1. APM Traces (aguarde 30s)

Você deve ver:
- ✅ Service: `clean-math-lambda`
- ✅ Env: `lab`
- ✅ Resource: `handler.lambda_handler`
- ✅ Spans mostrando execução
- ✅ Duration em ms

### 2. Logs (imediato)

Você deve ver:
- ✅ Logs com timestamps
- ✅ Tags: `service`, `env`, `version`
- ✅ `trace_id` correlacionado
- ✅ Click no log → vai para o trace

### 3. Serverless View

Você deve ver:
- ✅ Lambda listada
- ✅ Invocations count
- ✅ Duration graph
- ✅ Error rate
- ✅ Cold starts

---

## 🔧 Troubleshooting

### Não vejo traces no Datadog

**Checklist:**
1. ✅ Aguardou 1-2 minutos?
2. ✅ Handler está como `datadog_lambda.handler.handler`?
3. ✅ Env var `DD_TRACE_ENABLED=true`?
4. ✅ Env var `DD_LAMBDA_HANDLER=handler.lambda_handler`?
5. ✅ Layers aplicados?

**Verificar:**
```bash
aws lambda get-function-configuration \
  --function-name clean-math-lambda \
  --region us-east-1 \
  --query '{Handler:Handler,Layers:Layers[*].Arn,Env:Environment.Variables}' \
  --output json
```

### Erro: "Unable to import module"

**Causa:** Layer não compatível com runtime

**Solução:** Verifique se o layer é para Python 3.12:
```
arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Python312:114
                                                         ^^^
```

### Logs no Datadog mas sem traces

**Causa:** Handler não está usando wrapper

**Fix:**
```bash
aws lambda update-function-configuration \
  --function-name clean-math-lambda \
  --handler datadog_lambda.handler.handler \
  --environment Variables='{DD_LAMBDA_HANDLER=handler.lambda_handler,...}'
```

---

## 🔄 Remover Datadog (Rollback)

```bash
# Via Terraform
terraform destroy

# Ou via AWS CLI
aws lambda update-function-configuration \
  --function-name clean-math-lambda \
  --handler handler.lambda_handler \
  --layers [] \
  --region us-east-1
```

---

## 📚 Next Steps

1. ✅ Instrumentar outras Lambdas
2. ✅ Criar dashboards customizados
3. ✅ Configurar alertas
4. ✅ Adicionar custom metrics
5. ✅ Integrar com outros serviços AWS

---

**Total time: ~5 minutos** ⏱️
**Code changes: 0 linhas** 📝
**Value: Priceless** 💎
