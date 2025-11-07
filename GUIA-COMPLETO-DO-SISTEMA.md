# 📚 Guia Completo do Sistema FlowGest

## 📋 Índice
1. [Visão Geral do Sistema](#visão-geral)
2. [Tudo que Foi Criado](#tudo-que-foi-criado)
3. [Guia Passo a Passo - Gerente](#guia-gerente)
4. [Guia Passo a Passo - Dono](#guia-dono)

---

## 🎯 Visão Geral do Sistema {#visão-geral}

O **FlowGest** é um sistema completo de gestão de metas, funcionários e vendas desenvolvido para lojas. O sistema possui duas áreas distintas:

- **Área do Gerente**: Para gerenciar funcionários, metas, vendas e avaliações de cada loja
- **Área do Dono**: Para visualizar dados agregados de todas as lojas

---

## 🛠️ Tudo que Foi Criado {#tudo-que-foi-criado}

### 🔐 Sistema de Autenticação

#### Para Gerentes:
- ✅ **Login de Gerente** (`/login`)
  - Login com email e senha
  - Autenticação JWT (tokens válidos por 30 dias)
  - Isolamento de dados por loja

- ✅ **Cadastro de Gerente** (`/cadastro`)
  - Cadastro com nome, email, senha e nome da loja
  - Validação de dados
  - Senhas criptografadas com bcrypt

#### Para Donos:
- ✅ **Login de Dono** (`/login-dono`)
  - Login separado para donos
  - Acesso a dados de todas as lojas

- ✅ **Cadastro de Dono** (`/cadastro-dono`)
  - Cadastro exclusivo para donos
  - Controle de acesso diferenciado

---

### 📊 Dashboard do Gerente (`/dashboard`)

#### Resumo Geral:
- ✅ **Cards de Resumo**
  - Total de funcionários
  - Meta do mês
  - Total vendido
  - Status da meta (batida, em andamento, abaixo)

- ✅ **Aniversariantes do Mês**
  - Lista de funcionários que fazem aniversário no mês atual
  - Destaque visual

- ✅ **Eventos da Agenda**
  - Eventos de hoje
  - Próximos eventos (7 dias)

- ✅ **Previsão de Vendas**
  - Cálculo automático de previsão de vendas até o fim do mês
  - Baseado na média diária atual

#### Gráficos:
- ✅ **Gráfico Comparativo**
  - Comparação entre mês atual e mês anterior
  - Filtros por mês/ano

- ✅ **Gráfico de Vendas do Mês vs Meta Individual**
  - Comparação de cada funcionário com sua meta
  - Visualização em barras

- ✅ **Gráfico de Top Vendedores**
  - Ranking dos melhores vendedores do mês
  - Top 10 funcionários

- ✅ **Gráfico de Vendas Diárias**
  - Evolução das vendas ao longo do mês
  - Linha temporal

#### Funcionalidades:
- ✅ **Busca de Funcionários**
  - Buscar por nome no ranking

- ✅ **Filtros**
  - Seleção de mês e ano
  - Comparação de períodos

- ✅ **Ranking Completo**
  - Tabela com todos os funcionários
  - Ordenação por vendas
  - Indicadores visuais de meta batida

---

### 👥 Gestão de Funcionários (`/funcionarios`)

#### Cadastro e Edição:
- ✅ **Cadastrar Funcionário**
  - Nome completo
  - Sexo (Masculino/Feminino)
  - Idade
  - Função
  - Data de aniversário
  - Meta individual mensal

- ✅ **Editar Funcionário**
  - Atualizar todos os dados
  - Alterar meta individual

- ✅ **Excluir Funcionário**
  - Remoção com confirmação

#### Vendas Diárias:
- ✅ **Registrar Venda Diária**
  - Data da venda
  - Valor da venda
  - Observações (opcional)

- ✅ **Editar Venda Diária**
  - Corrigir valores errados
  - Atualizar data e observações

- ✅ **Histórico de Vendas**
  - Visualizar todas as vendas do funcionário
  - Filtro por mês/ano
  - Total mensal calculado automaticamente

#### Filtros e Busca:
- ✅ **Buscar por Nome**
  - Busca em tempo real

- ✅ **Filtrar por Função**
  - Filtrar funcionários por cargo

- ✅ **Filtrar por Status de Vendas**
  - Com vendas no mês
  - Sem vendas no mês
  - Meta batida

#### Visualização:
- ✅ **Cards de Funcionários**
  - Informações principais
  - Vendas do mês
  - Percentual da meta
  - Indicador visual de meta batida

---

### 🎯 Gestão de Metas (`/metas`)

#### Metas Mensais:
- ✅ **Criar Meta Mensal**
  - Selecionar mês e ano
  - Definir valor da meta
  - Meta única por mês/ano

- ✅ **Editar Meta**
  - Atualizar valor da meta

- ✅ **Excluir Meta**
  - Remoção com confirmação

#### Vendas da Loja:
- ✅ **Registrar Venda Direta da Loja**
  - Vendas que não são de funcionários específicos
  - Data, valor e observações

- ✅ **Registrar Venda de Funcionário**
  - Associar venda a um funcionário específico
  - Integração com vendas do funcionário

- ✅ **Editar Vendas**
  - Editar vendas da loja
  - Editar vendas de funcionários
  - Corrigir valores e datas

#### Histórico e Relatórios:
- ✅ **Histórico de Vendas Diárias**
  - Vendas diretas da loja
  - Vendas dos funcionários
  - Total geral calculado

- ✅ **Gráfico Mensal**
  - Gráfico de linha com vendas diárias
  - Visualização do progresso

- ✅ **Funcionários Destaques**
  - Top funcionários do mês
  - Destaque visual

- ✅ **Imprimir Relatório**
  - Relatório completo formatado
  - Gráficos e dados

#### Notificações:
- ✅ **Notificação de Meta Batida**
  - Notificação no navegador quando meta é atingida
  - Animação de parabéns

---

### 💬 Feedback de Funcionários (`/feedback`)

#### Seleção e Visualização:
- ✅ **Selecionar Funcionário**
  - Lista de todos os funcionários
  - Busca por nome

- ✅ **Filtros de Período**
  - Selecionar mês e ano
  - Visualizar dados do período

#### Dados do Funcionário:
- ✅ **Informações Gerais**
  - Nome, função, meta individual

- ✅ **Resumo de Vendas**
  - Total vendido no período
  - Número de dias com vendas
  - Média diária

- ✅ **Gráfico de Vendas Diárias**
  - Gráfico de linha com evolução
  - Visualização do desempenho

- ✅ **Tabela de Vendas**
  - Todas as vendas do período
  - Data, valor e observações

#### Observações do Gerente:
- ✅ **Campo de Observações**
  - Texto livre para anotações
  - Salvar observações por mês/ano
  - Visualizar observações anteriores

#### Comparação:
- ✅ **Comparar Períodos**
  - Comparar mês atual com outro período
  - Gráfico comparativo
  - Indicadores de crescimento/queda

#### Impressão:
- ✅ **Imprimir Relatório**
  - Relatório completo formatado
  - Dados do funcionário
  - Gráfico e tabela de vendas
  - Observações do gerente

---

### 📦 Estoque - Pauta da Reunião (`/estoque`)

#### Avaliações de Estoque:
- ✅ **Criar Avaliação**
  - Frequência da avaliação (Semanal/Mensal)
  - Forma de pagamento (Ganho/Perda)
  - Responsáveis pela avaliação
  - Data da avaliação

#### Tópicos de Avaliação:
- ✅ **7 Tópicos Pré-definidos**
  1. Atraso na produção de novos produtos
  2. Avarias
  3. Abastecimento de loja
  4. Organização do estoque
  5. Falta de produtos do galpão
  6. Falta de suprimentos
  7. Produtos com preço antigo ou sem precificação

- ✅ **Observações e Pontuação**
  - Campo de texto para cada tópico
  - Anotações livres

- ✅ **Sugestões de Novos Tópicos**
  - 4 campos para sugestões
  - Adicionar novos tópicos

#### Valor e Assinatura:
- ✅ **Tipo de Valor**
  - Fixo ou Variável

- ✅ **Valor Mínimo Sugerido**
  - Valor padrão: R$ 200,00

- ✅ **Assinatura**
  - Campo de texto para assinatura

#### Filtros e Comparação:
- ✅ **Filtros**
  - Por data (início e fim)
  - Por frequência

- ✅ **Comparar Avaliações**
  - Selecionar duas avaliações
  - Comparar lado a lado
  - Ver evolução

#### Visualização:
- ✅ **Lista de Avaliações**
  - Todas as avaliações salvas
  - Data, frequência, forma de pagamento

- ✅ **Imprimir Avaliação**
  - Formulário completo formatado
  - Todos os tópicos e observações

---

### 📅 Agenda (`/agenda`)

#### Eventos:
- ✅ **Criar Evento**
  - Data do evento
  - Título
  - Descrição (opcional)
  - Tipo (Tarefa, Compromisso, Reunião, Lembrete, Meta)
  - Prioridade (Baixa, Média, Alta)

#### Lembretes:
- ✅ **Configurar Lembrete**
  - Ativar/desativar lembrete
  - Dias de antecedência
  - Horário da notificação

- ✅ **Notificações Automáticas**
  - Notificação no navegador
  - Lembretes automáticos
  - Verificação a cada minuto

#### Visualização:
- ✅ **Calendário Mensal**
  - Visualização em grade
  - Eventos marcados nos dias
  - Cores por tipo de evento
  - Indicador de prioridade

- ✅ **Lista de Eventos**
  - Todos os eventos do mês
  - Filtros por tipo e prioridade
  - Busca por título/descrição

#### Gerenciamento:
- ✅ **Editar Evento**
  - Atualizar todos os dados
  - Alterar data, tipo, prioridade

- ✅ **Marcar como Concluído**
  - Marcar tarefas concluídas
  - Visual diferenciado

- ✅ **Excluir Evento**
  - Remoção com confirmação

#### Filtros:
- ✅ **Filtros Disponíveis**
  - Por tipo de evento
  - Por prioridade
  - Busca por texto
  - Mostrar/ocultar concluídos

---

### 👑 Dashboard do Dono (`/dashboard-dono`)

#### Resumo Geral:
- ✅ **Cards de Resumo**
  - Total de lojas cadastradas
  - Total de funcionários (todas as lojas)
  - Meta total (soma de todas as lojas)
  - Vendas totais (soma de todas as lojas)

#### Gráficos:
- ✅ **Gráfico de Vendas vs Meta por Loja**
  - Comparação entre lojas
  - Barras comparativas

- ✅ **Gráfico de Distribuição de Vendas**
  - Pizza com percentual por loja
  - Visualização da participação

- ✅ **Gráfico de Evolução**
  - Evolução mensal ou trimestral
  - Linha temporal

- ✅ **Gráfico Comparativo**
  - Comparar períodos diferentes
  - Comparar lojas entre si

#### Top Vendedores:
- ✅ **Top 10 Vendedores**
  - Ranking agregado de todas as lojas
  - Melhores vendedores gerais

#### Lista de Lojas:
- ✅ **Cards de Lojas**
  - Nome da loja e gerente
  - Status da meta (batida, em andamento, abaixo)
  - Percentual atingido
  - Total de funcionários

- ✅ **Visualizar Detalhes da Loja**
  - Modal com informações completas
  - Lista de funcionários
  - Gráfico de vendas diárias
  - Histórico de metas
  - Avaliações de estoque
  - Feedback dos funcionários

#### Filtros e Busca:
- ✅ **Filtros Avançados**
  - Buscar loja por nome
  - Filtrar por status da meta
  - Filtrar por período (mês/ano)
  - Ordenar por desempenho, vendas ou nome

#### Métricas Avançadas:
- ✅ **Métricas Disponíveis**
  - Ticket médio por loja
  - Vendas por funcionário (média)
  - Taxa de conversão de metas
  - Ranking de lojas por desempenho
  - Previsão de vendas

#### Alertas:
- ✅ **Sistema de Alertas**
  - Lojas que bateram a meta
  - Lojas abaixo da meta
  - Funcionários sem vendas

#### Mensagens:
- ✅ **Enviar Mensagens**
  - Enviar mensagem para gerentes
  - Assunto e conteúdo
  - Histórico de mensagens enviadas

#### Agenda Agregada:
- ✅ **Visualizar Agenda de Todas as Lojas**
  - Eventos de todas as lojas
  - Filtro por mês/ano

---

### 🎨 Recursos de Interface

#### Modo Escuro/Claro:
- ✅ **Toggle de Modo**
  - Botão no Navbar
  - Alterna entre modo claro e escuro
  - Preferência salva no navegador
  - Funciona em todas as seções

#### Notificações:
- ✅ **Sistema de Toast**
  - Notificações elegantes
  - Não bloqueiam a tela
  - Tipos: Sucesso, Erro, Aviso, Informação

- ✅ **Notificações do Navegador**
  - Notificações de desktop
  - Meta batida
  - Lembretes da agenda
  - Tarefas pendentes

#### Responsividade:
- ✅ **Design Responsivo**
  - Funciona em celular, tablet e desktop
  - Menu mobile
  - Layout adaptável

#### Impressão:
- ✅ **Relatórios Imprimíveis**
  - Formatação especial para impressão
  - Gráficos e tabelas
  - Layout otimizado

---

## 📖 Guia Passo a Passo - Gerente {#guia-gerente}

### 🔐 1. Primeiro Acesso - Cadastro

1. **Acesse a página de cadastro**
   - URL: `https://seu-dominio.com/cadastro`
   - Ou clique em "Cadastre-se" na tela de login

2. **Preencha os dados**
   - **Nome**: Seu nome completo
   - **Email**: Seu email (será usado para login)
   - **Senha**: Mínimo 6 caracteres
   - **Nome da Loja**: Nome da sua loja

3. **Clique em "Cadastrar"**
   - Se tudo estiver correto, você será redirecionado para o Dashboard

---

### 🏠 2. Dashboard - Visão Geral

#### Entendendo o Dashboard:

1. **Cards de Resumo** (topo da página)
   - **Total de Funcionários**: Quantidade cadastrada
   - **Meta do Mês**: Valor da meta definida
   - **Total Vendido**: Soma de todas as vendas
   - **Status da Meta**: Indicador visual (verde = batida, amarelo = em andamento, vermelho = abaixo)

2. **Aniversariantes do Mês**
   - Lista de funcionários que fazem aniversário no mês atual
   - Clique no nome para ver detalhes

3. **Eventos de Hoje e Próximos Eventos**
   - Eventos da agenda para hoje
   - Próximos 7 dias

4. **Previsão de Vendas**
   - Estimativa de quanto será vendido até o fim do mês
   - Baseado na média diária atual

5. **Gráficos**
   - Use os filtros de mês/ano para ver diferentes períodos
   - Clique em "Comparar Período" para comparar meses

---

### 👥 3. Cadastrar Funcionários

1. **Acesse a seção Funcionários**
   - Clique em "Funcionários" no menu superior
   - Ou acesse: `/funcionarios`

2. **Clique em "Novo Funcionário"**
   - Botão no canto superior direito

3. **Preencha os dados**
   - **Nome**: Nome completo do funcionário
   - **Sexo**: Masculino ou Feminino
   - **Idade**: Idade atual
   - **Função**: Cargo do funcionário (ex: Vendedor, Gerente, etc.)
   - **Data de Aniversário**: Data de nascimento
   - **Meta Individual**: Valor em R$ que o funcionário deve vender por mês

4. **Clique em "Salvar"**
   - O funcionário será cadastrado e aparecerá na lista

---

### 💰 4. Registrar Vendas Diárias

#### Para Funcionários:

1. **Na seção Funcionários**
   - Encontre o card do funcionário
   - Clique em "Registrar Venda"

2. **Preencha os dados**
   - **Data**: Data da venda (padrão: hoje)
   - **Valor**: Valor da venda em R$
   - **Observação**: (Opcional) Anotações sobre a venda

3. **Clique em "Salvar"**
   - A venda será registrada e o total mensal será atualizado

#### Para a Loja (Vendas Diretas):

1. **Na seção Metas**
   - Clique em "Ver Histórico" na meta do mês
   - Clique em "Adicionar Venda" na seção "Vendas Diretas da Loja"

2. **Preencha os dados** (mesmo processo acima)

#### Editar Venda:

1. **No histórico de vendas**
   - Clique no ícone de editar (lápis) ao lado da venda
   - Corrija os dados
   - Clique em "Salvar"

---

### 🎯 5. Criar e Gerenciar Metas

1. **Acesse a seção Metas**
   - Clique em "Metas" no menu

2. **Criar Nova Meta**
   - Clique em "Nova Meta"
   - Selecione o **Mês** e **Ano**
   - Digite o **Valor da Meta** em R$
   - Clique em "Salvar"

3. **Visualizar Histórico**
   - Clique em "Ver Histórico" no card da meta
   - Veja todas as vendas (loja + funcionários)
   - Visualize o gráfico mensal
   - Veja os funcionários destaques

4. **Imprimir Relatório**
   - No histórico, clique em "Imprimir"
   - O relatório será formatado para impressão

---

### 💬 6. Dar Feedback aos Funcionários

1. **Acesse a seção Feedback**
   - Clique em "Feedback" no menu

2. **Selecione o Funcionário**
   - Use a busca para encontrar rapidamente
   - Ou selecione na lista

3. **Selecione o Período**
   - Escolha o mês e ano
   - Os dados serão carregados automaticamente

4. **Visualize os Dados**
   - Resumo de vendas
   - Gráfico de vendas diárias
   - Tabela com todas as vendas

5. **Adicione Observações**
   - Role até o campo "Observações do Gerente"
   - Digite suas observações sobre o funcionário
   - Clique em "Salvar Observação"

6. **Compare Períodos** (Opcional)
   - Ative "Comparar Períodos"
   - Selecione outro mês/ano
   - Veja a comparação no gráfico

7. **Imprimir Relatório**
   - Clique em "Imprimir"
   - Relatório completo será gerado

---

### 📦 7. Avaliação de Estoque

1. **Acesse a seção Estoque**
   - Clique em "Estoque" no menu

2. **Criar Nova Avaliação**
   - Clique em "Nova Avaliação"

3. **Preencha o Formulário**
   - **Frequência**: Semanal ou Mensal
   - **Forma de Pagamento**: Ganho ou Perda
   - **Responsáveis**: Nome dos responsáveis
   - **Data**: Data da avaliação

4. **Avalie os Tópicos**
   - Para cada um dos 7 tópicos:
     - Leia o tópico
     - Adicione observações e pontuação no campo correspondente

5. **Sugestões de Novos Tópicos** (Opcional)
   - Se tiver sugestões, preencha os campos

6. **Valor e Assinatura**
   - Tipo de valor: Fixo ou Variável
   - Valor mínimo sugerido
   - Assinatura

7. **Salvar**
   - Clique em "Salvar Avaliação"

8. **Filtrar e Comparar**
   - Use os filtros para encontrar avaliações
   - Selecione duas avaliações para comparar

9. **Imprimir**
   - Clique em "Imprimir" para gerar o formulário completo

---

### 📅 8. Usar a Agenda

1. **Acesse a seção Agenda**
   - Clique em "Agenda" no menu

2. **Criar Novo Evento**
   - Clique em "Novo Evento"
   - Ou clique diretamente em um dia do calendário

3. **Preencha os Dados**
   - **Data**: Data do evento
   - **Título**: Nome do evento
   - **Descrição**: (Opcional) Detalhes
   - **Tipo**: Tarefa, Compromisso, Reunião, Lembrete ou Meta
   - **Prioridade**: Baixa, Média ou Alta

4. **Configurar Lembrete** (Opcional)
   - Marque "Ativar Lembrete"
   - **Dias de Antecedência**: Quantos dias antes avisar
   - **Horário**: Horário da notificação

5. **Salvar**
   - O evento aparecerá no calendário

6. **Gerenciar Eventos**
   - **Editar**: Clique no evento e depois no ícone de editar
   - **Marcar como Concluído**: Clique no check
   - **Excluir**: Clique no ícone de lixeira

7. **Filtros**
   - Use os filtros para encontrar eventos específicos
   - Busque por título ou descrição

---

### ⚙️ 9. Configurações e Recursos

#### Modo Escuro/Claro:
- Clique no ícone de lua/sol no menu superior
- A preferência é salva automaticamente

#### Notificações:
- O sistema pedirá permissão para notificações
- Você receberá alertas quando:
  - Meta for batida
  - Lembretes da agenda
  - Tarefas pendentes

#### Sair do Sistema:
- Clique em "Sair" no menu superior
- Você será deslogado

---

## 👑 Guia Passo a Passo - Dono {#guia-dono}

### 🔐 1. Primeiro Acesso - Cadastro

1. **Acesse a página de cadastro do dono**
   - URL: `https://seu-dominio.com/cadastro-dono`
   - Ou clique em "Sou dono da loja" na tela de login

2. **Preencha os dados**
   - **Nome**: Seu nome completo
   - **Email**: Seu email (será usado para login)
   - **Senha**: Mínimo 6 caracteres

3. **Clique em "Cadastrar"**
   - Você será redirecionado para o Dashboard do Dono

---

### 🏠 2. Dashboard do Dono - Visão Geral

#### Entendendo o Dashboard:

1. **Cards de Resumo** (topo da página)
   - **Total de Lojas**: Quantidade de lojas cadastradas
   - **Total de Funcionários**: Soma de todos os funcionários
   - **Meta Total**: Soma das metas de todas as lojas
   - **Vendas Totais**: Soma de todas as vendas

2. **Gráfico de Vendas vs Meta por Loja**
   - Comparação visual entre lojas
   - Barras mostram vendas e metas

3. **Gráfico de Distribuição**
   - Pizza mostrando participação de cada loja
   - Percentual de vendas

4. **Top 10 Vendedores**
   - Ranking geral de todas as lojas
   - Melhores vendedores do período

5. **Lista de Lojas**
   - Cards com informações de cada loja
   - Status da meta
   - Percentual atingido

---

### 🔍 3. Filtrar e Buscar Lojas

1. **Filtros Disponíveis** (topo da página)
   - **Mês/Ano**: Selecione o período
   - **Buscar Loja**: Digite o nome da loja ou gerente
   - **Filtrar por Status**: 
     - Todas
     - Meta Batida
     - Em Andamento
     - Abaixo da Meta
   - **Ordenar por**:
     - Desempenho
     - Vendas
     - Nome

2. **Aplicar Filtros**
   - Os dados serão atualizados automaticamente

---

### 📊 4. Visualizar Detalhes de uma Loja

1. **Na lista de lojas**
   - Encontre o card da loja desejada
   - Clique em "Ver Detalhes"

2. **Modal de Detalhes**
   - **Informações do Gerente**: Nome e email
   - **Lista de Funcionários**: Todos os funcionários da loja
   - **Gráfico de Vendas Diárias**: Evolução do mês
   - **Avaliações de Estoque**: Histórico de avaliações
   - **Feedback dos Funcionários**: Observações do gerente
   - **Histórico de Metas**: Metas dos meses anteriores

3. **Fechar Modal**
   - Clique em "Fechar" ou fora do modal

---

### 📈 5. Análise Comparativa

1. **Comparar Períodos**
   - Clique em "Comparar Períodos"
   - Selecione dois períodos diferentes
   - Veja a comparação no gráfico

2. **Evolução Mensal/Trimestral**
   - Clique em "Evolução"
   - Selecione Mensal ou Trimestral
   - Veja a evolução ao longo do tempo

3. **Comparar Lojas**
   - Use os gráficos para comparar desempenho
   - Gráfico de barras mostra comparação direta

---

### 📊 6. Métricas Avançadas

1. **Acesse a seção de Métricas**
   - No Dashboard, role até "Métricas Avançadas"

2. **Métricas Disponíveis**
   - **Ticket Médio**: Valor médio por venda
   - **Vendas por Funcionário**: Média de vendas
   - **Taxa de Conversão**: Percentual de metas batidas
   - **Ranking de Lojas**: Ordenação por desempenho
   - **Previsão de Vendas**: Estimativa para o fim do mês

---

### 🚨 7. Alertas e Notificações

1. **Seção de Alertas**
   - No Dashboard, veja a seção "Alertas"

2. **Tipos de Alertas**
   - **Lojas que Bateram a Meta**: Destaque positivo
   - **Lojas Abaixo da Meta**: Atenção necessária
   - **Funcionários sem Vendas**: Ação necessária

3. **Ações**
   - Clique em "Ver Detalhes" para investigar
   - Use os alertas para tomar decisões

---

### 💬 8. Enviar Mensagens para Gerentes

1. **Na lista de lojas**
   - Encontre a loja desejada
   - Clique em "Enviar Mensagem" (se disponível)

2. **Ou use o menu de mensagens**
   - Acesse a funcionalidade de mensagens
   - Selecione o gerente

3. **Preencha a Mensagem**
   - **Assunto**: Título da mensagem
   - **Mensagem**: Conteúdo

4. **Enviar**
   - Clique em "Enviar"
   - O gerente receberá a mensagem

---

### 📅 9. Visualizar Agenda Agregada

1. **Seção de Agenda**
   - No Dashboard, veja "Agenda Agregada"

2. **Filtros**
   - Selecione mês e ano
   - Veja eventos de todas as lojas

3. **Visualização**
   - Lista de eventos
   - Organizados por data
   - Mostra qual loja tem o evento

---

### ⚙️ 10. Configurações

#### Modo Escuro/Claro:
- Clique no ícone de lua/sol no menu superior
- Funciona igual ao do gerente

#### Sair do Sistema:
- Clique em "Sair" no menu superior
- Você será deslogado

---

## 💡 Dicas Importantes

### Para Gerentes:
- ✅ Registre vendas diariamente para manter dados atualizados
- ✅ Use a agenda para não esquecer compromissos importantes
- ✅ Dê feedback regularmente aos funcionários
- ✅ Monitore o Dashboard para acompanhar o progresso
- ✅ Use os gráficos para identificar tendências

### Para Donos:
- ✅ Acompanhe o Dashboard regularmente
- ✅ Use os filtros para análises específicas
- ✅ Compare períodos para ver evolução
- ✅ Verifique os alertas diariamente
- ✅ Use as métricas para tomar decisões estratégicas

---

## 🔒 Segurança

- ✅ Senhas são criptografadas (não podem ser lidas)
- ✅ Tokens de autenticação expiram após 30 dias
- ✅ Cada gerente só vê dados da sua loja
- ✅ Donos têm acesso apenas a dados agregados
- ✅ Todas as comunicações são seguras (HTTPS)

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique este guia primeiro
2. Teste em diferentes navegadores
3. Limpe o cache do navegador se necessário
4. Verifique sua conexão com a internet

---

**Última atualização**: Dezembro 2024
**Versão do Sistema**: 1.0

