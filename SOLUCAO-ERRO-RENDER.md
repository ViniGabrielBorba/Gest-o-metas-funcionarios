# 🔧 Solução: Erro "Não foi possível encontrar o módulo '/opt/render/project/src/server.js'"

## ❌ Problema

O Render está procurando o arquivo `server.js` no lugar errado. O erro aparece porque o **Start Command** está configurado incorretamente.

---

## ✅ Solução Rápida

### **Opção 1: Usar npm start (RECOMENDADO)**

No Render, configure o **Start Command** como:

```
npm start
```

Isso funciona porque o `package.json` na raiz já tem o script:
```json
"start": "node backend/server.js"
```

---

### **Opção 2: Caminho Relativo Correto**

Se preferir usar o comando direto, use:

```
node backend/server.js
```

⚠️ **IMPORTANTE:** Certifique-se de que está exatamente assim, com `backend/` no caminho!

---

## 🔧 Como Corrigir no Render

1. **Acesse seu projeto no Render:**
   - Vá em https://render.com
   - Clique no seu Web Service

2. **Vá em "Settings"** (ou "Environment")

3. **Encontre "Start Command"** na seção "Build & Deploy"

4. **Altere para uma das opções:**
   - `npm start` (recomendado)
   - OU `node backend/server.js`

5. **Clique em "Save Changes"**

6. **O Render vai fazer redeploy automaticamente**

7. **Aguarde 2-3 minutos** e verifique os logs

---

## ✅ Verificar se Funcionou

1. Após o redeploy, verifique os logs
2. Você deve ver:
   ```
   🚀 Servidor rodando na porta 5000
   ✅ MongoDB conectado com sucesso!
   ```
3. Teste a URL: `https://sua-url.onrender.com/api/test`
4. Deve aparecer: `{"message":"API funcionando!"}`

---

## 📝 Configuração Correta Completa

### **Build & Deploy Settings:**

| Campo | Valor |
|-------|-------|
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Root Directory** | (deixe vazio) |

---

## 🆘 Ainda com Erro?

Se ainda não funcionar:

1. **Verifique se o arquivo existe:**
   - O arquivo deve estar em `backend/server.js`
   - Não em `src/server.js` ou `server.js` na raiz

2. **Verifique o package.json:**
   - Deve ter o script: `"start": "node backend/server.js"`

3. **Verifique os logs completos:**
   - No Render, vá em "Logs"
   - Procure por erros de módulo não encontrado

4. **Tente limpar e fazer novo deploy:**
   - Render → Settings → "Clear build cache"
   - Depois faça "Manual Deploy"

---

## 💡 Dica

**Sempre use `npm start` no Render!** É mais confiável porque usa o script do `package.json`, que já está configurado corretamente.

---

**Depois de corrigir, o erro deve desaparecer!** 🎉

