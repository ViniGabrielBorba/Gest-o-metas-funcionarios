# 🔧 Solução: Erro 502 Bad Gateway no Render

## ❌ Problema

```
502 Bad Gateway
Um serviço web foi configurado incorretamente. host e porta.
```

O Render precisa que o servidor escute em `0.0.0.0` (não apenas `localhost`).

---

## ✅ Solução Aplicada

O código do servidor foi corrigido para escutar em `0.0.0.0`:

```javascript
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
```

---

## 📋 Próximos Passos

### **1. Fazer Commit e Push:**

```bash
git add backend/server.js
git commit -m "Fix: Servidor escuta em 0.0.0.0 para Render"
git push
```

### **2. Render vai fazer Redeploy Automático:**

1. O Render detecta o push no GitHub
2. Faz deploy automático (2-3 minutos)
3. O erro 502 deve desaparecer

### **3. Verificar se Funcionou:**

Após o deploy, teste:
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

Deve aparecer: `{"message":"API funcionando!"}`

---

## 🔍 O Que Foi Corrigido

### **Antes (Errado):**
```javascript
app.listen(PORT, () => {
  // Escutava apenas em localhost
});
```

### **Depois (Correto):**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  // Escuta em 0.0.0.0 (aceita conexões externas)
});
```

---

## ✅ Verificar Logs no Render

Após o redeploy, verifique os logs:

1. Render → Web Service → **Logs**
2. Você deve ver:
   ```
   🚀 Servidor rodando em http://0.0.0.0:10000
   🌐 Acessível externamente na porta 10000
   ✅ MongoDB conectado com sucesso!
   ```

---

## 🆘 Se Ainda Não Funcionar

### **Verificar Variáveis de Ambiente:**

No Render → Environment Variables:

- ✅ `PORT` - Render define automaticamente (geralmente 10000)
- ✅ `MONGODB_URI` - String de conexão
- ✅ `JWT_SECRET` - Chave secreta
- ✅ `NODE_ENV` - `production`
- ✅ `FRONTEND_URL` - URL do Vercel (opcional)

### **Verificar Start Command:**

No Render → Settings → Build & Deploy:

- **Start Command:** `npm start` (ou `node backend/server.js`)

---

## 📝 Checklist

- [ ] Código corrigido (escuta em `0.0.0.0`)
- [ ] Commit feito
- [ ] Push para GitHub
- [ ] Render fez redeploy
- [ ] Logs mostram "Servidor rodando em http://0.0.0.0:..."
- [ ] Teste `/api/test` funciona
- [ ] Erro 502 desapareceu

---

## 💡 Explicação Técnica

**Por que `0.0.0.0`?**

- `localhost` ou `127.0.0.1` → Aceita apenas conexões locais
- `0.0.0.0` → Aceita conexões de qualquer lugar (necessário para serviços na nuvem)

O Render precisa que o servidor aceite conexões externas, então precisa escutar em `0.0.0.0`.

---

**Depois de fazer commit e push, o erro 502 deve desaparecer!** 🎉

