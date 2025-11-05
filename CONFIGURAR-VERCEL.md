# 🚀 Como Configurar o Frontend no Vercel

## 📋 Configuração do Framework

### **No campo "Framework Preset":**

Selecione: **`Create React App`**

---

## ⚙️ Configurações Completas

Quando você importar o projeto no Vercel, configure assim:

### **1. Framework Preset:**
```
Create React App
```

### **2. Root Directory:**
```
frontend
```
⚠️ **IMPORTANTE:** Como seu frontend está na pasta `frontend/`, você DEVE especificar `frontend` aqui.

### **3. Build Command:**
```
npm run build
```
(O Vercel executa `npm install` automaticamente antes, então não precisa colocar `npm install &&`)

### **4. Output Directory:**
```
build
```
(É onde o Create React App gera os arquivos após o build)

### **5. Install Command:**
```
(não precisa preencher - deixe vazio)
```
O Vercel instala automaticamente.

---

## 🌐 Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

| Nome | Valor |
|------|-------|
| `REACT_APP_API_URL` | `https://sua-url-backend.railway.app/api` |

⚠️ **Substitua** `https://sua-url-backend.railway.app` pela URL real do seu backend no Railway.

**Exemplo:**
```
REACT_APP_API_URL=https://sistema-backend.up.railway.app/api
```

---

## 📝 Resumo Visual

```
┌─────────────────────────────────────┐
│ Framework Preset:                  │
│ [Create React App ▼]               │
├─────────────────────────────────────┤
│ Root Directory:                    │
│ [frontend]                         │
├─────────────────────────────────────┤
│ Build Command:                     │
│ [npm run build]                    │
├─────────────────────────────────────┤
│ Output Directory:                  │
│ [build]                            │
├─────────────────────────────────────┤
│ Install Command:                   │
│ [(deixe vazio)]                    │
└─────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Framework Preset: **Create React App**
- [ ] Root Directory: **frontend**
- [ ] Build Command: **npm run build**
- [ ] Output Directory: **build**
- [ ] Install Command: **(vazio)**
- [ ] Variável `REACT_APP_API_URL` configurada com a URL do Railway

---

## 🎯 Passo a Passo Completo

1. **Acesse:** https://vercel.com
2. **Faça login** (ou crie conta com GitHub)
3. **Clique em "Add New" → "Project"**
4. **Selecione seu repositório** do GitHub
5. **Configure as opções acima**
6. **Adicione a variável** `REACT_APP_API_URL`
7. **Clique em "Deploy"**
8. **Aguarde 2-3 minutos**
9. **Pronto!** Você terá uma URL como: `https://seu-app.vercel.app`

---

## 🆘 Problemas Comuns

### Erro: "Build failed"
- Verifique se o **Root Directory** está como `frontend`
- Verifique se o **Output Directory** está como `build`
- Verifique os logs de build para ver o erro específico

### Frontend não conecta ao backend
- Verifique se `REACT_APP_API_URL` está correto
- Verifique se a URL do backend termina com `/api`
- Verifique se o backend está rodando no Railway

### Erro de dependências
- O Vercel instala automaticamente, mas se der erro:
  - Verifique se `package.json` está na pasta `frontend/`
  - Verifique se todas as dependências estão listadas no `package.json`

---

## 💡 Dica

Depois do primeiro deploy, o Vercel salva essas configurações. 
A cada novo push no GitHub, o Vercel faz deploy automático!

---

**Pronto! Com essas configurações, seu frontend deve fazer deploy com sucesso!** 🎉

