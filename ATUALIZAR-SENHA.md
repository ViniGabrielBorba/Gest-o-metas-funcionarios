# 🔑 Como Atualizar a Senha do MongoDB

Sua string de conexão está quase pronta! Só falta adicionar a senha.

## Passo a Passo:

1. **Abra o arquivo `.env`** na raiz do projeto

2. **Localize a linha:**
   ```
   MONGODB_URI=mongodb://localhost:27017/gestao-metas
   ```

3. **Substitua por** (colocando sua senha real):
   ```
   MONGODB_URI=mongodb+srv://gerente:SUA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
   ```
   
   **IMPORTANTE:** Substitua `SUA_SENHA_AQUI` pela senha que você criou para o usuário "gerente" no MongoDB Atlas.

4. **Salve o arquivo**

5. **Execute novamente:**
   ```powershell
   npm run dev
   ```

## Exemplo:

Se sua senha for `minhasenha123`, o arquivo `.env` deve ter:
```
MONGODB_URI=mongodb+srv://gerente:minhasenha123@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

## ⚠️ Dica de Segurança:

Se sua senha contém caracteres especiais, você pode precisar codificá-la em URL. Por exemplo:
- `@` vira `%40`
- `#` vira `%23`
- Espaços viram `%20`

Ou simplesmente use uma senha sem caracteres especiais para facilitar.










