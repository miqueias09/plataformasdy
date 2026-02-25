# 🎯 PLATAFORMAS DA DY - Sistema de Rastreamento

Sistema completo de rastreamento de cliques com painel administrativo protegido por autenticação.

---

## 🔐 **CONFIGURAÇÃO OBRIGATÓRIA**

### ⚠️ **IMPORTANTE: Credenciais por Variável de Ambiente**

O servidor **RECUSA INICIAR** se as credenciais não estiverem configuradas via variáveis de ambiente.

**Nenhuma credencial está hardcoded no código** por segurança.

---

## 🚀 **Início Rápido (3 Passos)**

### **1️⃣ Instalar Dependências**

```bash
npm install
```

### **2️⃣ Configurar Credenciais (OBRIGATÓRIO)**

Escolha **UMA** das opções abaixo:

#### **Opção A: Arquivo .env (Recomendado)**

```bash
# Copiar exemplo
cp .env.example .env

# Editar o .env e configurar:
# ADMIN_USERNAME=Miqueias
# ADMIN_PASSWORD=@Mikeias09
```

#### **Opção B: Variável de Ambiente Inline**

```bash
ADMIN_USERNAME=Miqueias ADMIN_PASSWORD=@Mikeias09 npm start
```

#### **Opção C: Export (Linux/Mac)**

```bash
export ADMIN_USERNAME=Miqueias
export ADMIN_PASSWORD=@Mikeias09
npm start
```

#### **Opção D: Set (Windows CMD)**

```cmd
set ADMIN_USERNAME=Miqueias
set ADMIN_PASSWORD=@Mikeias09
npm start
```

### **3️⃣ Iniciar Servidor**

```bash
npm start
```

Se tudo estiver correto, você verá:

```
🔐 ========================================
✅ Credenciais do Admin configuradas:
   Usuário: Miqueias
   Senha: ********** (10 caracteres)
🔐 ========================================

🚀 ========================================
✅ Servidor rodando na porta 3000
📊 Front-end: http://localhost:3000
🔐 Painel Admin: http://localhost:3000/admin.html
🔑 Credenciais: Miqueias / **********
🚀 ========================================
```

---

## 📊 **Acessar o Sistema**

- **Site Público:** http://localhost:3000
  - 13 plataformas com botões "CADASTRE-SE"
  - Registro automático de cliques
  - Sem exibição de estatísticas (privacidade)

- **Painel Admin:** http://localhost:3000/admin.html
  - Login com usuário + senha configurados
  - Dashboard com estatísticas completas
  - Histórico de cliques com filtros
  - Exportação CSV
  - Resetar cliques

---

## 🔒 **Validações de Segurança**

### **O servidor valida:**

✅ `ADMIN_USERNAME` está definido  
✅ `ADMIN_PASSWORD` está definido  
✅ Credenciais não estão vazias  
✅ Senha tem pelo menos 8 caracteres  

**Se qualquer validação falhar → Servidor NÃO inicia ❌**

---

## 🎯 **Funcionalidades**

### **Front-end Público**
- 13 plataformas integradas
- Design Clean Neon Premium
- Registro automático de cliques
- Responsivo (mobile/tablet/desktop)

### **Painel Admin (Protegido)**
- Login com usuário + senha
- Dashboard com estatísticas:
  - Total de cliques
  - Total em R$ (R$ 1,00 por clique)
  - Tabela por plataforma
- Histórico completo:
  - Paginação (25/50/100/200)
  - Filtro por plataforma
  - Filtro por data (De/Até)
  - Atalhos: Hoje, Últimos 7 dias, Este mês
- Exportar CSV completo
- Resetar cliques
- Auto-refresh (30s)
- Logout seguro

### **Backend**
- Node.js + Express
- SQLite (banco local)
- Sessões seguras (24h)
- Middleware de autenticação
- Proteção de todas as rotas admin
- Logs detalhados

---

## 🔌 **API Endpoints**

### **Públicos**

- `POST /api/click` - Registrar clique

### **Autenticação**

- `POST /api/admin/login` - Login
- `GET /api/admin/check` - Verificar autenticação
- `POST /api/admin/logout` - Logout

### **Protegidos (requerem login)**

- `GET /api/stats` - Estatísticas gerais
- `GET /api/admin/history` - Histórico com filtros
- `GET /api/admin/export-csv` - Exportar CSV completo
- `DELETE /api/admin/clicks` - Resetar todos os cliques

---

## 🛠️ **Desenvolvimento**

### **Modo Desenvolvimento (auto-reload)**

```bash
npm run dev
```

### **Variáveis de Ambiente**

| Variável | Obrigatório | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `ADMIN_USERNAME` | ✅ Sim | - | Usuário do admin |
| `ADMIN_PASSWORD` | ✅ Sim | - | Senha do admin (≥8 chars) |
| `PORT` | ❌ Não | 3000 | Porta do servidor |
| `SESSION_SECRET` | ❌ Não | (padrão) | Secret das sessões |

---

## 🐛 **Troubleshooting**

### **Erro: "Credenciais do admin não configuradas"**

**Causa:** Variáveis `ADMIN_USERNAME` ou `ADMIN_PASSWORD` não definidas.

**Solução:**
```bash
# Opção 1: Criar .env
cp .env.example .env
# Edite o .env

# Opção 2: Usar inline
ADMIN_USERNAME=Miqueias ADMIN_PASSWORD=@Mikeias09 npm start
```

### **Erro: "Senha muito fraca"**

**Causa:** Senha tem menos de 8 caracteres.

**Solução:** Use uma senha com pelo menos 8 caracteres.

### **Erro: "Port 3000 already in use"**

**Causa:** Porta 3000 já está sendo usada.

**Solução:**
```bash
PORT=8080 ADMIN_USERNAME=Miqueias ADMIN_PASSWORD=@Mikeias09 npm start
```

### **Login não funciona no admin**

**Causa:** Credenciais incorretas.

**Solução:** Verifique as credenciais no console ao iniciar o servidor.

---

## 📦 **Deploy em Produção**

### **Render.com (Gratuito)**

1. Push para GitHub
2. Conecte no Render
3. Adicione variáveis de ambiente:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET` (gere um secret forte)
4. Deploy automático!

### **Railway.app (Gratuito)**

1. Push para GitHub
2. Importe no Railway
3. Configure variáveis de ambiente
4. Deploy automático!

### **VPS (DigitalOcean, AWS, etc.)**

```bash
# 1. Clone o repositório
git clone seu-repo.git
cd plataformas-dy

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
export ADMIN_USERNAME=Miqueias
export ADMIN_PASSWORD=SenhaSuperForte123!
export SESSION_SECRET=secret-aleatorio-forte
export NODE_ENV=production

# 4. Instale PM2
npm install -g pm2

# 5. Inicie com PM2
pm2 start server.js --name plataformas-dy

# 6. Configure auto-start
pm2 startup
pm2 save
```

---

## ✅ **Checklist de Segurança (Produção)**

- [ ] Credenciais via variáveis de ambiente (não hardcoded)
- [ ] Senha forte (≥12 caracteres)
- [ ] `SESSION_SECRET` único e forte
- [ ] `NODE_ENV=production`
- [ ] HTTPS ativo (SSL/TLS)
- [ ] Firewall configurado
- [ ] Backup automático do banco
- [ ] Logs monitorados
- [ ] `.env` no `.gitignore`

---

## 📚 **Documentação**

- `README.md` - Este arquivo (documentação principal)
- `.env.example` - Exemplo de configuração
- Comentários no código `server.js`

---

## 🎉 **Resultado**

Sistema **100% funcional e seguro** com:

✅ Credenciais via variáveis de ambiente  
✅ Servidor recusa iniciar sem credenciais  
✅ Validação de senha (≥8 caracteres)  
✅ Autenticação obrigatória no admin  
✅ Todas as rotas admin protegidas  
✅ Sessões seguras (24h)  
✅ Design profissional Clean Neon Premium  
✅ Pronto para produção  

---

**🔐 Segurança em primeiro lugar: sem credenciais hardcoded! 🔐**

**✨ Sistema profissional e pronto para uso! ✨**
