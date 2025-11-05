# 🧪 Testar Backend no Render

## ✅ URL do Backend

```
https://gest-o-metas-funcionarios-3.onrender.com
```

---

## 🧪 Testes Rápidos

### **Teste 1: API de Teste**

Acesse no navegador:
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

**Deve retornar:**
```json
{"message":"API funcionando!"}
```

---

### **Teste 2: Verificar se Está Online**

1. Acesse: `https://gest-o-metas-funcionarios-3.onrender.com`
2. Se aparecer alguma página ou erro, o servidor está respondendo
3. Se demorar muito ou não carregar, pode estar "dormindo" (plano Free)

---

## 📝 URLs Completas para o Frontend

### **Para Configurar no Vercel:**

**Key:** `REACT_APP_API_URL`

**Value:** 
```
https://gest-o-metas-funcionarios-3.onrender.com/api
```

⚠️ **IMPORTANTE:** 
- Deve terminar com `/api`
- Não deve ter barra no final (`/api/`)

---

## 🔗 Endpoints Disponíveis

Com base nessa URL, seus endpoints são:

- **Teste:** `https://gest-o-metas-funcionarios-3.onrender.com/api/test`
- **Login:** `https://gest-o-metas-funcionarios-3.onrender.com/api/auth/login`
- **Cadastro:** `https://gest-o-metas-funcionarios-3.onrender.com/api/auth/register`
- **Funcionários:** `https://gest-o-metas-funcionarios-3.onrender.com/api/funcionarios`
- **Metas:** `https://gest-o-metas-funcionarios-3.onrender.com/api/metas`
- **Dashboard:** `https://gest-o-metas-funcionarios-3.onrender.com/api/dashboard`

---

## ✅ Verificar se Está Funcionando

### **1. Teste Rápido:**

Abra no navegador:
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

Se aparecer `{"message":"API funcionando!"}`, está funcionando! ✅

### **2. Se Demorar ou Não Responder:**

- Plano Free do Render pode "dormir" após inatividade
- Primeira requisição pode demorar 30-60 segundos para "acordar"
- Aguarde um pouco e tente novamente

---

## 🔧 Configurar no Vercel

Com essa URL, configure assim:

**No Vercel → Environment Variables:**

- **Key:** `REACT_APP_API_URL`
- **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`

**Lembre-se:**
- ✅ Termina com `/api`
- ✅ Depois de salvar, faça **redeploy**

---

## 💡 Dica

Se o backend estiver "dormindo" (plano Free):
- Primeira requisição demora 30-60 segundos
- Depois funciona normalmente
- Para sempre online: upgrade para $7/mês

---

**Esse link está correto! Agora é só configurar no Vercel!** 🎯

