Boas Práticas Adicionadas:

Segurança de Credenciais:

Nunca commit arquivos .tfvars com credenciais reais

Use sensitive = true para proteger os valores no output

Crie um terraform.tfvars.example para documentação

Gerenciamento Real de Secrets:

Opção 1: Use variáveis de ambiente:

bash
Copy
export TF_VAR_datadog_api_key="apikey"
export TF_VAR_datadog_app_key="appkey"
Opção 2: Use um arquivo local não versionado:

bash
Copy
echo 'datadog_api_key = "sua_chave"\ndatadog_app_key = "sua_chave"' > secrets.auto.tfvars