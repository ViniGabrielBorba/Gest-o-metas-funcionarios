# 🚀 Como Iniciar o Sistema

## URLs de Acesso:

- **Frontend (Interface):** http://localhost:3000
- **Backend (API):** http://localhost:5000/api

## Como Iniciar:

### Opção 1: Iniciar Backend e Frontend Juntos (Recomendado)

Na pasta raiz do projeto (`c:\Users\vinicius\Desktop\gerente`), execute:

```powershell
npm run dev
```

Isso inicia ambos automaticamente.

---

### Opção 2: Iniciar Separadamente

**Terminal 1 - Backend:**
```powershell
npm run server
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

---

## Verificar se Está Rodando:

1. **Backend:** Acesse http://localhost:5000/api/test
   - Deve mostrar: `{"message":"API funcionando!"}`

2. **Frontend:** Acesse http://localhost:3000
   - Deve abrir a tela de login

---

## Se Der Erro:

- Verifique se o MongoDB está conectado
- Verifique se as portas 3000 e 5000 estão livres
- Certifique-se de estar na pasta correta
















