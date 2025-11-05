# 🔧 Corrigir Erro: "Invalid Characters" no Vercel

## ❌ Erro Atual

```
The name contains invalid characters. 
Only letters, digits, and underscores are allowed. 
Furthermore, the name should not start with a digit.
```

---

## ✅ Solução Rápida

### **1. Limpar o Campo Key Completamente**

1. **Delete o texto** que está no campo "Key"
2. **Digite manualmente** (não copie e cole):
   ```
   REACT_APP_API_URL
   ```

⚠️ **IMPORTANTE:** 
- Digite letra por letra
- Não copie e cole de outro lugar
- Certifique-se que não há espaços
- Não deve ter caracteres especiais como `|`, `-`, etc.

---

### **2. Verificar o Campo Value**

O campo "Value" deve ter:
```
https://gest-o-metas-funcionarios-3.onrender.com/api
```

⚠️ **IMPORTANTE:**
- Deve começar com `https://`
- NÃO deve ter espaço no final
- Deve terminar com `/api`

---

### **3. Tentar Novamente**

1. **Key:** `REACT_APP_API_URL` (digitado manualmente)
2. **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`
3. **Environments:** Selecione todos
4. **Clique em "Save"**

---

## 🔍 Se Ainda Não Funcionar

### **Opção 1: Usar Nome Alternativo**

Se o Vercel não aceitar `REACT_APP_API_URL`, tente:

**Key:** `REACT_APP_API_BASE_URL`

E então atualize o código do frontend temporariamente (mas isso não é ideal).

---

### **Opção 2: Verificar se Já Existe**

1. Role a página para baixo
2. Veja se já existe uma variável `REACT_APP_API_URL`
3. Se existir, edite ela ao invés de criar nova
4. Clique no ícone de lápis (edit) ao lado dela

---

### **Opção 3: Verificar Caracteres Escondidos**

1. Delete tudo do campo Key
2. Digite novamente: `REACT_APP_API_URL`
3. Certifique-se que não há:
   - Espaços no início ou fim
   - Caracteres especiais
   - Quebras de linha

---

## ✅ Formato Correto

**Key (exatamente assim):**
```
REACT_APP_API_URL
```

**Value (exatamente assim):**
```
https://gest-o-metas-funcionarios-3.onrender.com/api
```

**Caracteres permitidos no Key:**
- ✅ Letras (A-Z, a-z)
- ✅ Números (0-9)
- ✅ Underscore (_)
- ❌ NÃO pode começar com número
- ❌ NÃO pode ter espaços
- ❌ NÃO pode ter caracteres especiais (|, -, etc.)

---

## 💡 Dica

Se continuar dando erro, tente:
1. Limpar o navegador (Ctrl+Shift+Delete)
2. Recarregar a página (F5)
3. Tentar novamente

---

**Depois de corrigir, deve funcionar!** 🎯

