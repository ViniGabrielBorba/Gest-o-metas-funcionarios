# 💼 Sistema de Gestão de Metas

Sistema web completo para gestão de metas, desempenho e aniversários dos funcionários, desenvolvido para gerentes de loja.

## 🚀 Tecnologias

- **Frontend:** React + Tailwind CSS + Recharts
- **Backend:** Node.js + Express
- **Banco de Dados:** MongoDB (Mongoose)
- **Autenticação:** JWT (JSON Web Token)

## ✨ Funcionalidades

### 👤 Área do Gerente
- ✅ Cadastro e login seguro com JWT
- ✅ Isolamento de dados por loja
- ✅ Dashboard personalizado

### 👥 Gestão de Funcionários
- ✅ CRUD completo de funcionários
- ✅ Cadastro de dados pessoais (nome, idade, sexo, função, aniversário)
- ✅ Meta individual mensal por funcionário
- ✅ Registro de vendas por mês/ano

### 📈 Metas e Performance
- ✅ Definição de metas mensais da loja
- ✅ Gráficos comparativos de vendas
- ✅ Destaque para melhor vendedor do mês e do ano
- ✅ Visualização de desempenho individual

### 🎉 Recursos Extras
- ✅ Aniversariantes do mês destacados no dashboard
- ✅ Gráficos interativos (Recharts)
- ✅ Interface responsiva (mobile, tablet, desktop)
- ✅ Design moderno com cores quentes (vermelho, laranja, amarelo, dourado)
- ✅ Animações leves e feedback visual

## 📦 Instalação Rápida

Consulte o arquivo [INSTALACAO.md](INSTALACAO.md) para instruções detalhadas.

### Passos Básicos:

**Windows (PowerShell):**
```powershell
# Opção 1: Script automático (mais fácil)
.\instalar.bat

# Opção 2: Manual
npm install
cd frontend
npm install
cd ..
```

**Linux/Mac:**
```bash
npm install
cd frontend && npm install && cd ..
```

**Depois:**
1. Crie o arquivo `.env` na raiz (copie do `.env.example`)
2. Configure as variáveis de ambiente
3. Inicie o MongoDB
4. Execute: `npm run dev`

Acesse: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
gerente/
├── backend/
│   ├── models/          # Modelos MongoDB (Gerente, Funcionario, Meta)
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Middleware de autenticação
│   └── server.js        # Servidor Express
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   │   ├── auth/    # Login e Cadastro
│   │   │   ├── dashboard/  # Dashboard principal
│   │   │   ├── funcionarios/  # Gestão de funcionários
│   │   │   ├── metas/   # Gestão de metas
│   │   │   └── layout/  # Navbar
│   │   ├── utils/       # Utilitários (API, Auth)
│   │   └── App.js       # Componente principal
│   └── public/
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json         # Dependências do backend
└── README.md
```

## 🎨 Design

O sistema utiliza um design moderno com:
- **Cores quentes:** Gradientes de vermelho, laranja, amarelo e dourado
- **Responsivo:** Adaptável a todos os dispositivos
- **Animações:** Transições suaves e feedback visual
- **Cards e Ícones:** Interface intuitiva e profissional

## 🔒 Segurança

- Autenticação JWT com tokens válidos por 30 dias
- Senhas hasheadas com bcrypt
- Isolamento de dados por loja (gerente)
- Validação de dados no backend

## 📝 Licença

ISC
