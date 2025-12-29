# Terraform Lambda com for_each - Gerenciamento Múltiplas Lambdas

Este projeto foi refatorado para usar `for_each` do Terraform, permitindo gerenciar múltiplas funções Lambda com uma configuração DRY (Don't Repeat Yourself).

## O que é for_each?

O `for_each` é uma meta-argument do Terraform que permite criar múltiplas instâncias de um recurso a partir de um map ou set. Neste projeto, usamos um map de objetos para definir múltiplas Lambdas.

## Vantagens do for_each

1. **DRY (Don't Repeat Yourself)**: Elimina duplicação de código
2. **Escalabilidade**: Adicionar nova Lambda é apenas adicionar um bloco no map
3. **Manutenção**: Mudanças na estrutura aplicam-se a todas as Lambdas
4. **Organização**: Cada Lambda tem configuração própria mas segue o mesmo padrão
5. **Rastreabilidade**: Cada Lambda é identificada por uma key única

## Estrutura Atual

O projeto gerencia 2 Lambdas via for_each:

- **lambda1**: `fastapi-mangum-test` (original)
- **lambda2**: `fastapi-mangum-test-2` (demonstração for_each)

## Como Funciona

### 1. Variável lambda_functions

No arquivo `variables.tf`, definimos um map de objetos:

```hcl
variable "lambda_functions" {
  description = "Map of Lambda functions to configure with Datadog"
  type = map(object({
    function_name          = string
    handler                = string
    original_handler       = string
    memory_size            = number
    timeout                = number
    dd_env                 = string
    dd_service             = string
    dd_version             = string
    log_retention_days     = number
    environment_variables  = map(string)
    tags                   = map(string)
  }))
}
```

### 2. Uso no main.tf

```hcl
# Iteração sobre todas as Lambdas
resource "aws_lambda_function" "lambda_with_datadog" {
  for_each = var.lambda_functions

  function_name = each.value.function_name
  handler       = each.value.handler
  memory_size   = each.value.memory_size
  # ... outras configurações
}
```

### 3. Configuração no terraform.tfvars

```hcl
lambda_functions = {
  lambda1 = {
    function_name = "fastapi-mangum-test"
    memory_size   = 128
    timeout       = 30
    # ... outras configurações
  }

  lambda2 = {
    function_name = "fastapi-mangum-test-2"
    memory_size   = 256
    timeout       = 60
    # ... outras configurações
  }
}
```

## Como Adicionar uma Nova Lambda

### Passo 1: Criar a Lambda na AWS (se não existir)

```bash
aws lambda create-function \
  --function-name fastapi-mangum-test-3 \
  --runtime python3.12 \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-role \
  --handler handler.handler \
  --zip-file fileb://lambda-code.zip \
  --timeout 30 \
  --memory-size 128
```

### Passo 2: Adicionar no terraform.tfvars

Adicione um novo bloco no map `lambda_functions`:

```hcl
lambda_functions = {
  lambda1 = { ... }
  lambda2 = { ... }

  # Nova Lambda
  lambda3 = {
    function_name          = "fastapi-mangum-test-3"
    handler                = "datadog_lambda.handler.handler"
    original_handler       = "handler.handler"
    memory_size            = 512
    timeout                = 120
    dd_env                 = "production"
    dd_service             = "fastapi-mangum-prod"
    dd_version             = "3.0.0"
    log_retention_days     = 30
    environment_variables  = {
      CUSTOM_VAR = "production-value"
    }
    tags = {
      Environment = "production"
      Team        = "backend"
    }
  }
}
```

### Passo 3: Aplicar as mudanças

```bash
cd terraform
terraform plan    # Revisar mudanças
terraform apply   # Aplicar configuração
```

## Comandos Terraform

### Inicializar
```bash
terraform init
```

### Planejar mudanças
```bash
terraform plan
```

### Aplicar mudanças
```bash
terraform apply
```

### Ver estado de recursos específicos
```bash
# Ver lambda1
terraform state show 'aws_lambda_function.lambda_with_datadog["lambda1"]'

# Ver lambda2
terraform state show 'aws_lambda_function.lambda_with_datadog["lambda2"]'
```

### Aplicar mudanças em Lambda específica
```bash
# Atualizar apenas lambda1
terraform apply -target='aws_lambda_function.lambda_with_datadog["lambda1"]'
```

## Outputs

Os outputs foram refatorados para retornar maps de todas as Lambdas:

```bash
# Ver todos os ARNs
terraform output lambda_arns

# Ver configurações Datadog
terraform output datadog_configurations

# Ver sumário
terraform output summary
```

## Referenciando Recursos no for_each

Quando usa for_each, os recursos se tornam maps. Para referenciar:

```hcl
# Sintaxe antiga (sem for_each)
aws_lambda_function.fastapi_mangum.arn

# Sintaxe nova (com for_each)
aws_lambda_function.lambda_with_datadog["lambda1"].arn
aws_lambda_function.lambda_with_datadog["lambda2"].arn
```

## Estrutura de Arquivos

```
terraform/
├── main.tf              # Recursos principais com for_each
├── variables.tf         # Definição de variáveis
├── outputs.tf           # Outputs refatorados para maps
├── terraform.tfvars     # Configuração das Lambdas
├── dummy.zip            # Zip dummy (lifecycle ignora)
└── README-FOREACH.md    # Este arquivo
```

## Configuração Datadog

Todas as Lambdas recebem automaticamente:

- Datadog Extension Layer
- Datadog Python Layer
- FastAPI Layer
- Environment variables do Datadog
- CloudWatch Log Group com retenção configurável

## Diferenças entre lambda1 e lambda2

| Configuração | lambda1 | lambda2 |
|--------------|---------|---------|
| Function Name | fastapi-mangum-test | fastapi-mangum-test-2 |
| Memory | 128 MB | 256 MB |
| Timeout | 30s | 60s |
| DD_SERVICE | fastapi-mangum-test | fastapi-mangum-test-2 |
| DD_VERSION | 1.0.0 | 2.0.0 |
| Log Retention | 7 dias | 14 dias |
| Custom Env Vars | Nenhuma | CUSTOM_VAR=lambda2-value |

## Testando

### Testar lambda1
```bash
aws lambda invoke \
  --function-name fastapi-mangum-test \
  --payload '{"path": "/health", "httpMethod": "GET"}' \
  response1.json
```

### Testar lambda2
```bash
aws lambda invoke \
  --function-name fastapi-mangum-test-2 \
  --payload '{"path": "/health", "httpMethod": "GET"}' \
  response2.json
```

## Troubleshooting

### Erro: "No declaration found for var.lambda_functions"
- Verifique se o `variables.tf` tem a variável `lambda_functions` definida
- Rode `terraform init` novamente

### Erro: Lambda não encontrada
- Certifique-se que a Lambda existe na AWS antes de rodar terraform
- Use `aws lambda list-functions` para verificar

### Outputs vazios
- Rode `terraform refresh` para atualizar o state
- Verifique se `terraform apply` foi executado com sucesso

## Próximos Passos

1. Adicionar mais Lambdas conforme necessário (lambda3, lambda4, etc.)
2. Criar módulos Terraform reutilizáveis
3. Implementar workspaces para ambientes (dev, staging, prod)
4. Adicionar testes automatizados com Terratest

## Recursos

- [Terraform for_each](https://www.terraform.io/language/meta-arguments/for_each)
- [AWS Lambda with Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)
- [Datadog Lambda Documentation](https://docs.datadoghq.com/serverless/aws_lambda/)
