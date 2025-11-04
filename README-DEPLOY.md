# 🌐 Deploy para Web - Resumo Rápido

## Para Múltiplos Gerentes Usarem Sem Instalar

**Solução:** Hospedar na nuvem (100% gratuito)

### Opção Mais Fácil: Railway + Vercel

1. **Backend (Railway):**
   - https://railway.app → Criar projeto → GitHub
   - Variáveis: `MONGODB_URI`, `JWT_SECRET`
   - Deploy automático!

2. **Frontend (Vercel):**
   - https://vercel.com → Import → GitHub
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Variável: `REACT_APP_API_URL` = URL do Railway + `/api`
   - Deploy!

3. **Compartilhar URL:**
   - Cada gerente acessa a URL do Vercel
   - Cada um cria sua conta
   - Pronto!

**Leia:** `GUIA-DEPLOY-COMPLETO.md` para passo a passo detalhado.



