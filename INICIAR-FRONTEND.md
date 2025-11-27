# 🚀 Como Iniciar o Frontend

## O Frontend foi iniciado!

Aguarde 30-60 segundos para compilar e abrir automaticamente.

## Se não abrir automaticamente:

Acesse manualmente: **http://localhost:3000**

## Se ainda não funcionar:

### Opção 1: Iniciar manualmente

1. Abra um novo terminal
2. Navegue até a pasta frontend:
   ```powershell
   cd C:\Users\vinicius\Desktop\gerente\frontend
   ```
3. Execute:
   ```powershell
   npm start
   ```

### Opção 2: Iniciar tudo junto

Na pasta raiz (`C:\Users\vinicius\Desktop\gerente`):
```powershell
npm run dev
```

## Verificar se está rodando:

- Abra o navegador em: http://localhost:3000
- Deve aparecer a tela de login do sistema

## Problemas Comuns:

### Porta 3000 já em uso:
- Feche outros processos Node
- Ou mude a porta editando `frontend/.env`: `PORT=3001`

### Erro de compilação:
- Execute: `cd frontend && npm install`
- Depois: `npm start`

### Não abre automaticamente:
- Acesse manualmente: http://localhost:3000
- Verifique o terminal para ver se há erros


















