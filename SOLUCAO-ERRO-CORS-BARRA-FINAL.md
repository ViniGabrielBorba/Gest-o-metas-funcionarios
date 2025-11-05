# 🔧 Solução: Erro CORS com Barra Final na URL

## ❌ Problema

```
Access-Control-Allow-Origin header has a value 
'https://gest-o-metas-funcionarios-89ed.vercel.app/' 
that is not equal to the supplied origin.
```

**O problema:** A URL no header tem uma barra no final (`/`), mas a origem da requisição não tem.

---

## ✅ Solução Aplicada

### **Correção no CORS:**

O código agora **normaliza** as URLs, removendo a barra final automaticamente:

```javascript
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL.replace(/\/$/, '')] // Remove barra final
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    // Normalizar origem removendo barra final
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Verificar se está na lista
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 🔧 Configurar Variável no Render

### **No Render → Environment Variables:**

1. **Key:** `FRONTEND_URL`
2. **Value:** `https://gest-o-metas-funcionarios-89ed.vercel.app`
3. **⚠️ IMPORTANTE:** **NÃO coloque barra no final!**

**Correto:**
```
https://gest-o-metas-funcionarios-89ed.vercel.app
```

**Errado:**
```
https://gest-o-metas-funcionarios-89ed.vercel.app/
```

---

## 📋 Próximos Passos

### **1. Fazer Commit e Push:**

```bash
git add backend/server.js
git commit -m "Fix: Normalizar URLs no CORS para corrigir erro de barra final"
git push
```

### **2. Verificar Variável no Render:**

1. Acesse: https://render.com
2. Vá no seu Web Service
3. **Environment Variables**
4. Verifique `FRONTEND_URL`:
   - Deve ser: `https://gest-o-metas-funcionarios-89ed.vercel.app`
   - **SEM barra no final!**

### **3. Render vai fazer Redeploy:**

- Aguarde 2-3 minutos
- O erro de CORS deve desaparecer

---

## ✅ Testar

### **1. Após o Redeploy:**

1. Acesse o frontend: `https://gest-o-metas-funcionarios-89ed.vercel.app`
2. Tente fazer login ou cadastro
3. Abra o Console (F12)
4. **Não deve mais aparecer erro de CORS!**

### **2. Verificar Logs do Backend:**

No Render → Logs, você deve ver requisições chegando normalmente, sem erros de CORS.

---

## 🔍 Explicação

### **O Problema:**

- Frontend envia origem: `https://gest-o-metas-funcionarios-89ed.vercel.app`
- Backend esperava: `https://gest-o-metas-funcionarios-89ed.vercel.app/` (com barra)
- Browser bloqueia porque não são exatamente iguais

### **A Solução:**

- Normaliza ambas as URLs removendo a barra final
- Assim funcionam com ou sem barra

---

## 🆘 Se Ainda Não Funcionar

### **1. Verificar Variável `FRONTEND_URL`:**

- Deve estar sem barra no final
- Deve ser exatamente a URL do Vercel

### **2. Verificar se Fez Redeploy:**

- Render deve ter feito redeploy após o push
- Aguarde alguns minutos

### **3. Limpar Cache do Navegador:**

- Ctrl + Shift + Delete
- Limpar cache
- Testar novamente

---

## ✅ Checklist

- [ ] Código corrigido (normalização de URLs)
- [ ] Variável `FRONTEND_URL` configurada no Render (SEM barra no final)
- [ ] Commit feito
- [ ] Push para GitHub
- [ ] Render fez redeploy
- [ ] Testado no frontend
- [ ] Erro de CORS desapareceu

---

**Depois de fazer commit e push, o erro de CORS deve desaparecer!** 🎉

