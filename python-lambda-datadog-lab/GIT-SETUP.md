# 🐙 Git Setup - Como publicar este repositório

Repositório Git criado localmente com sucesso! ✅

Agora você pode publicar no **GitHub**, **GitLab**, **Bitbucket** ou qualquer outro serviço.

---

## 📊 Status Atual

```bash
✅ Git inicializado
✅ Commit inicial feito
✅ 26 arquivos commitados
✅ Branch: dev
```

---

## 🚀 Opção 1: GitHub

### 1.1 - Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `datadog-lambda-python-lab` (ou outro nome)
3. Descrição: `Datadog APM Lab for AWS Lambda Python - Zero code changes`
4. **NÃO** inicialize com README (já temos!)
5. Clique em **Create repository**

### 1.2 - Conectar e fazer push

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-lambda-datadog-lab

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/datadog-lambda-python-lab.git

# Ou com SSH
git remote add origin git@github.com:SEU_USUARIO/datadog-lambda-python-lab.git

# Renomear branch para main (opcional)
git branch -M main

# Push
git push -u origin main
```

### 1.3 - Configurar README

No GitHub, vá em **Settings** e defina `README-REPO.md` como README ou:

```bash
# Renomear README-REPO.md para README.md
git mv README-REPO.md README-GITHUB.md
git mv README.md README-LAB.md
git mv README-GITHUB.md README.md
git commit -m "Rename README for GitHub"
git push
```

---

## 🦊 Opção 2: GitLab

### 2.1 - Criar repositório no GitLab

1. Acesse: https://gitlab.com/projects/new
2. Project name: `datadog-lambda-python-lab`
3. Visibility: Public ou Private
4. **NÃO** inicialize com README
5. Clique em **Create project**

### 2.2 - Conectar e fazer push

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-lambda-datadog-lab

# Adicionar remote
git remote add origin https://gitlab.com/SEU_USUARIO/datadog-lambda-python-lab.git

# Ou com SSH
git remote add origin git@gitlab.com:SEU_USUARIO/datadog-lambda-python-lab.git

# Push
git push -u origin dev

# Ou renomear para main
git branch -M main
git push -u origin main
```

---

## 🪣 Opção 3: Bitbucket

### 3.1 - Criar repositório no Bitbucket

1. Acesse: https://bitbucket.org/repo/create
2. Repository name: `datadog-lambda-python-lab`
3. Access level: Public ou Private
4. Clique em **Create repository**

### 3.2 - Conectar e fazer push

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-lambda-datadog-lab

# Adicionar remote
git remote add origin https://bitbucket.org/SEU_USUARIO/datadog-lambda-python-lab.git

# Push
git push -u origin dev
```

---

## 🏢 Opção 4: GitHub Enterprise / GitLab Self-Hosted

Se sua empresa tem instância própria:

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-lambda-datadog-lab

# Substituir pela URL da sua empresa
git remote add origin https://github.empresa.com/SEU_USUARIO/datadog-lambda-python-lab.git

# Push
git push -u origin dev
```

---

## 🔒 Opção 5: Repositório Privado Datadog

Se for interno da Datadog:

```bash
cd /Users/pedro.schawirin/Documents/app-demo-labs/python-lambda-datadog-lab

# GitHub Datadog
git remote add origin git@github.com:DataDog/datadog-lambda-python-lab.git

# Push
git push -u origin dev
```

---

## 📝 Comandos Git Úteis

### Verificar status

```bash
git status
git log --oneline
git remote -v
```

### Criar nova branch

```bash
git checkout -b feature/nova-funcionalidade
git push -u origin feature/nova-funcionalidade
```

### Atualizar repositório

```bash
# Após fazer mudanças
git add .
git commit -m "Descrição das mudanças"
git push
```

### Criar tag de versão

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

---

## 🏷️ Sugestões de Tags

Você pode adicionar tags para organizar releases:

```bash
# Versão inicial
git tag -a v1.0.0 -m "Initial release - Complete Datadog Lambda Python Lab"

# Push tags
git push origin --tags
```

---

## 📄 .gitignore já configurado

O repositório já tem `.gitignore` configurado para:

- ✅ Arquivos Python (`__pycache__`, `*.pyc`)
- ✅ Terraform state files
- ✅ `terraform.tfvars` (credenciais)
- ✅ Responses de teste
- ✅ Logs
- ✅ Arquivos do OS (`.DS_Store`)
- ✅ IDEs (`.vscode`, `.idea`)

---

## 🎯 Próximos Passos

### Após fazer push:

1. ✅ Adicionar badges ao README
2. ✅ Configurar GitHub Actions (CI/CD)
3. ✅ Adicionar CONTRIBUTING.md
4. ✅ Criar Issues templates
5. ✅ Adicionar LICENSE file

---

## 🎨 Badges Sugeridas

Adicione ao README.md:

```markdown
[![Terraform](https://img.shields.io/badge/Terraform-1.0+-purple)](https://www.terraform.io/)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://www.python.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda/)
[![Datadog](https://img.shields.io/badge/Datadog-APM-blueviolet)](https://www.datadoghq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
```

---

## 📋 Checklist de Publicação

Antes de fazer público:

- [ ] Remover credenciais sensíveis
- [ ] Verificar `.gitignore`
- [ ] Adicionar LICENSE file
- [ ] Revisar README.md
- [ ] Testar clone fresh
- [ ] Adicionar badges
- [ ] Configurar GitHub Pages (opcional)

---

## 🔐 Segurança

### ⚠️ IMPORTANTE: Antes de fazer push

Verifique se NÃO tem:

```bash
# Procurar por API Keys
git grep -i "api.key"
git grep -i "dd_api_key"

# Procurar por secrets
git grep -i "secret"
git grep -i "password"
```

Se encontrar algo, adicione ao `.gitignore` e faça:

```bash
git rm --cached arquivo_com_secret
git commit -m "Remove sensitive data"
```

---

## 📦 Estrutura Final no GitHub/GitLab

```
datadog-lambda-python-lab/
├── README.md                 # ← README principal (usar README-REPO.md)
├── SETUP-CLIENTE.md          # Guia para cliente
├── QUICKSTART.md             # Quick start
├── CHECKLIST.md              # Validação
├── lambda/                   # Código Python
├── terraform/                # IaC
├── payloads/                 # Testes
└── docs/                     # Documentação adicional (opcional)
```

---

## 🚀 Comandos de Referência Rápida

```bash
# Status
git status

# Ver remotes
git remote -v

# Adicionar remote (GitHub)
git remote add origin https://github.com/USER/REPO.git

# Push inicial
git push -u origin main

# Push subsequentes
git push

# Ver histórico
git log --oneline --graph

# Criar tag
git tag -a v1.0.0 -m "Release message"
git push origin v1.0.0
```

---

## 📞 Suporte

Dúvidas sobre Git?

- **Git Docs**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **GitLab Docs**: https://docs.gitlab.com/

---

**Repositório pronto para publicação!** 🎉

Escolha uma das opções acima e faça push do seu lab! 🚀
