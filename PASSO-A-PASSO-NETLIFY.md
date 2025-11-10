# 🚀 Passo a Passo: Configurar Deploy no Netlify

## 📋 Pré-requisitos
- ✅ Conta no GitHub (já tem)
- ✅ Repositório no GitHub (já tem)
- ✅ Código enviado para o GitHub (já feito)

---

## 🔧 Passo 1: Criar Conta no Netlify

1. Acesse: **https://netlify.com**
2. Clique em **"Sign up"** (ou "Sign in" se já tiver conta)
3. Escolha **"GitHub"** para conectar com sua conta do GitHub
4. Autorize o Netlify a acessar seus repositórios
5. Pronto! Você está logado no Netlify

---

## 🔗 Passo 2: Importar Projeto do GitHub

1. No dashboard do Netlify, clique em **"Add new site"** (canto superior direito)
2. Escolha **"Import an existing project"**
3. Selecione **"GitHub"**
4. Se for a primeira vez, autorize o Netlify a acessar seus repositórios
5. Procure e selecione seu repositório: **`Gest-o-metas-funcionarios`**
6. Clique em **"Import"**

---

## ⚙️ Passo 3: Configurar Build Settings

**IMPORTANTE:** Configure exatamente assim:

### **Branch to deploy:**
```
main
```

### **Build settings:**

1. **Base directory:** 
   ```
   frontend
   ```
   *(Isso faz o Netlify trabalhar dentro da pasta frontend)*

2. **Build command:**
   ```
   npm run build
   ```
   *(Já está dentro do diretório frontend devido ao Base directory)*

3. **Publish directory:**
   ```
   build
   ```
   ⚠️ **NÃO coloque `frontend/build`** - o Netlify já está dentro de `frontend`!

4. **Functions directory:**
   ```
   (DEIXE VAZIO)
   ```
   *(Não precisa de serverless functions para React estático)*

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

1. Role a página até encontrar a seção **"Environment variables"**
2. Clique em **"Add variable"**
3. Adicione as seguintes variáveis:

   **Variável 1:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`
   - Marque: ✅ Production, ✅ Deploy Preview, ✅ Branch Deploys

   **Variável 2 (IMPORTANTE para Node 18):**
   - **Key:** `NODE_VERSION`
   - **Value:** `18`
   - Marque: ✅ Production, ✅ Deploy Preview, ✅ Branch Deploys

4. Clique em **"Save"** para cada variável

**⚠️ IMPORTANTE:** A variável `NODE_VERSION=18` é necessária porque o `react-scripts` não é compatível com Node 22. Sem isso, o build vai falhar!

---

## 🚀 Passo 5: Fazer o Deploy

1. Role até o final da página
2. Clique em **"Deploy site"** (botão verde)
3. Aguarde 2-3 minutos enquanto o Netlify:
   - Instala as dependências (`npm install`)
   - Faz o build (`npm run build`)
   - Publica o site

4. Quando aparecer **"Published"**, seu site está no ar! 🎉

---

## 🌐 Passo 6: Acessar seu Site

1. Após o deploy, você verá uma URL como:
   ```
   https://seu-app-aleatorio.netlify.app
   ```

2. Clique na URL para acessar seu site

3. **Pronto!** Seu frontend está funcionando! 🎊

---

## 📝 Passo 7: Configurar Domínio Personalizado (Opcional)

Se você quiser usar um domínio próprio:

1. Vá em **"Site settings"** (no menu do site)
2. Clique em **"Domain management"**
3. Clique em **"Add custom domain"**
4. Digite seu domínio (ex: `meusite.com`)
5. Siga as instruções para configurar o DNS

---

## ✅ Verificação Final

Após o deploy, verifique:

- ✅ Site carrega sem erros
- ✅ Login funciona
- ✅ Dashboard carrega dados
- ✅ Todas as funcionalidades estão operacionais

---

## 🆘 Problemas Comuns

### **Erro: "Build failed" ou "react-scripts failed"**
- ✅ Verifique se o **Base directory** está como `frontend`
- ✅ Verifique se o **Publish directory** está como `build` (não `frontend/build`)
- ✅ Verifique se a variável `REACT_APP_API_URL` está configurada
- ✅ **VERIFIQUE SE A VARIÁVEL `NODE_VERSION=18` ESTÁ CONFIGURADA!**
  - Sem isso, o Netlify usa Node 22 por padrão, que não é compatível com `react-scripts`
  - Adicione `NODE_VERSION=18` nas variáveis de ambiente

### **Erro: "Module not found"**
- Verifique se todos os arquivos foram enviados para o GitHub
- Faça `git push` novamente

### **Site carrega mas não conecta com a API**
- Verifique se a variável `REACT_APP_API_URL` está configurada corretamente
- Verifique se o backend está rodando no Render

### **Build demora muito**
- Normal! O primeiro build pode levar 3-5 minutos
- Builds subsequentes são mais rápidos (1-2 minutos)

---

## 📞 Precisa de Ajuda?

Se tiver algum problema:
1. Verifique os logs do build no Netlify
2. Verifique se todas as configurações estão corretas
3. Verifique se o código está no GitHub

---

**🎉 Pronto! Seu site está no ar!**

