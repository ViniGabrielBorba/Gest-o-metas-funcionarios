# 📘 Manual Completo do Sistema FlowGest
## Guia Passo a Passo para Usuários

---

## 📋 Índice

1. [Introdução ao Sistema](#introdução-ao-sistema)
2. [Primeiro Acesso](#primeiro-acesso)
3. [Área do Gerente](#área-do-gerente)
   - [Dashboard](#dashboard)
   - [Dados Funcionários](#dados-funcionários)
   - [Funcionários](#funcionários)
   - [Metas](#metas)
   - [Vendas Comerciais](#vendas-comerciais)
   - [Feedback](#feedback)
   - [Agenda](#agenda)
   - [Estoque](#estoque)
   - [Limpeza](#limpeza)
4. [Área do Dono](#área-do-dono)
   - [Dashboard do Dono](#dashboard-do-dono)
   - [Visualizar Detalhes da Loja](#visualizar-detalhes-da-loja)
   - [Métricas Avançadas](#métricas-avançadas)
5. [Dicas e Informações Importantes](#dicas-e-informações-importantes)
6. [Perguntas Frequentes](#perguntas-frequentes)

---

## 🎯 Introdução ao Sistema {#introdução-ao-sistema}

O **FlowGest** é um sistema completo de gestão de metas, funcionários e vendas desenvolvido para lojas. O sistema possui duas áreas distintas:

- **Área do Gerente**: Para gerenciar funcionários, metas, vendas e avaliações de cada loja
- **Área do Dono**: Para visualizar dados agregados de todas as lojas

### O que o sistema faz?

✅ Gerencia todos os funcionários da loja  
✅ Define e acompanha metas mensais  
✅ Registra e acompanha vendas individuais e da loja  
✅ Gera relatórios e gráficos de desempenho  
✅ Organiza agenda e eventos  
✅ Controla estoque  
✅ Gerencia escala de limpeza  
✅ Fornece feedback sobre funcionários  
✅ Exporta dados em PDF  

---

## 🔐 Primeiro Acesso {#primeiro-acesso}

### Para Gerentes:

1. **Acesse a página de login**
   - Digite o endereço do sistema no navegador
   - Você verá a tela de login

2. **Se ainda não tem conta, faça o cadastro**
   - Clique em "Cadastre-se" ou "Não tem conta? Cadastre-se"
   - Preencha os dados:
     - **Nome**: Seu nome completo
     - **Email**: Seu email (será usado para fazer login)
     - **Senha**: Escolha uma senha segura (mínimo 6 caracteres)
     - **Nome da Loja**: Nome da sua loja
   - Clique em "Cadastrar"

3. **Faça login**
   - Digite seu email e senha
   - Clique em "Entrar"
   - Você será redirecionado para o Dashboard

### Para Donos:

1. **Acesse a página de login do dono**
   - Digite o endereço do sistema seguido de `/login-dono`
   - Ou clique no link "Área do Dono"

2. **Se ainda não tem conta, faça o cadastro**
   - Clique em "Cadastre-se"
   - Preencha os dados:
     - **Nome**: Seu nome completo
     - **Email**: Seu email
     - **Senha**: Escolha uma senha segura
   - Clique em "Cadastrar"

3. **Faça login**
   - Digite seu email e senha
   - Clique em "Entrar"
   - Você será redirecionado para o Dashboard do Dono

---

## 👤 Área do Gerente {#área-do-gerente}

### 🏠 Dashboard {#dashboard}

O Dashboard é a primeira tela que você vê ao fazer login. Ele mostra uma visão geral do desempenho da loja.

#### O que você vê no Dashboard:

**1. Cards de Resumo (no topo)**
- **Total de Funcionários**: Quantidade de funcionários cadastrados
- **Meta do Mês**: Valor da meta definida para o mês atual
- **Total Vendido**: Soma de todas as vendas do mês
- **Status da Meta**: Indicador visual mostrando se a meta foi batida (verde), está no prazo (azul), no ritmo (amarelo) ou abaixo (vermelho)

**2. Filtros de Período**
- No topo direito, você pode selecionar o **mês** e o **ano** que deseja visualizar
- Use os menus dropdown para escolher o período

**3. Aniversariantes do Mês**
- Lista de funcionários que fazem aniversário no mês selecionado
- Mostra o dia do aniversário
- Clique no nome para ver mais detalhes

**4. Eventos da Agenda**
- **Eventos de Hoje**: Mostra eventos marcados para hoje
- **Próximos Eventos**: Mostra eventos dos próximos 7 dias
- Cada evento mostra título, tipo, prioridade e data

**5. Previsão de Vendas**
- Calcula automaticamente quanto será vendido até o fim do mês
- Baseado na média diária atual
- Mostra confiança da previsão

**6. Gráficos**
- **Vendas do Mês vs Meta Individual**: Gráfico de barras comparando vendas de cada vendedor com sua meta
- **Top Vendedores do Mês**: Ranking dos melhores vendedores
- **Vendas Diárias**: Gráfico de linha mostrando a evolução das vendas ao longo do mês
- **Comparação com Mês Anterior**: Gráfico comparativo (se ativado)

**7. Ranking Completo de Funcionários**
- Tabela com todos os vendedores
- Mostra posição, nome, função, vendas, meta, percentual atingido e status
- Você pode buscar funcionários usando a barra de busca

**8. Funcionários por Função**
- Tabelas separadas mostrando funcionários agrupados por função
- Cada função tem sua própria tabela (Vendedor, Caixa, Estoque, Gerente, etc.)
- Mostra o nome de cada funcionário em sua respectiva função

**9. Alertas e Notificações**
- Alertas sobre funcionários sem vendas
- Alertas sobre funcionários abaixo da meta
- Notificações sobre status da meta

#### Como usar o Dashboard:

1. **Visualizar período diferente**
   - Use os filtros de mês/ano no topo
   - Os dados serão atualizados automaticamente

2. **Comparar períodos**
   - Ative a opção "Comparar Período"
   - Selecione o mês/ano para comparar
   - Veja a diferença entre os períodos

3. **Buscar funcionário**
   - Use a barra de busca no ranking
   - Digite o nome do funcionário
   - A tabela será filtrada automaticamente

---

### 👥 Dados Funcionários {#dados-funcionários}

Esta seção permite cadastrar e gerenciar os dados pessoais completos dos funcionários.

#### Como cadastrar um novo funcionário:

1. **Acesse "Dados Funcionários" no menu**
2. **Clique no botão "Novo Funcionário"** (ícone de + no canto superior direito)
3. **Preencha o formulário:**
   - **Nome**: Nome do funcionário
   - **Sobrenome**: Sobrenome do funcionário
   - **CPF**: CPF do funcionário (será formatado automaticamente)
   - **Data de Nascimento**: Data completa de nascimento
   - **Data de Aniversário**: Data de aniversário (pode ser a mesma do nascimento)
   - **Sexo**: Masculino, Feminino ou Outro
   - **Função**: Selecione a função (Gerente, Caixa, Auxiliar de Loja, Fiscal, Estoque, Vendedor, Vendedora, Vendedor Online)
   - **Meta Individual**: Valor da meta mensal do funcionário (em R$)
   - **Telefone**: Número de telefone
   - **Email**: Email do funcionário
   - **Chave PIX**: Chave PIX para pagamentos
4. **Clique em "Salvar"**

#### Como editar um funcionário:

1. **Na lista de funcionários, clique no ícone de editar** (lápis) ao lado do nome
2. **Modifique os dados desejados**
3. **Clique em "Salvar"**

#### Como excluir um funcionário:

1. **Na lista de funcionários, clique no ícone de excluir** (lixeira) ao lado do nome
2. **Confirme a exclusão**
3. **O funcionário será removido do sistema**

#### Funcionalidades especiais:

**Imprimir dados de um funcionário:**
- Clique no ícone de impressora ao lado do funcionário
- Uma nova janela abrirá com os dados formatados para impressão

**Imprimir todos os funcionários:**
- Clique no botão "Imprimir Todos" no topo
- Todos os funcionários serão exibidos em uma página para impressão

**Baixar PDF com todos os funcionários:**
- Clique no botão "Baixar PDF" (ícone de download)
- Um arquivo PDF será gerado com:
  - Cabeçalho: FlowGest / Nome da Loja / Nome do Gerente
  - Tabela completa com todos os funcionários
  - Dados: Nome, Função, Sexo, Nascimento, CPF, Email, Telefone, Chave PIX

**Buscar funcionário:**
- Use a barra de busca no topo
- Digite o nome ou parte do nome
- A lista será filtrada automaticamente

---

### 💼 Funcionários {#funcionários}

Esta seção permite registrar e acompanhar as vendas individuais de cada funcionário.

#### Como registrar vendas de um funcionário:

1. **Acesse "Funcionários" no menu**
2. **Na lista, encontre o funcionário desejado**
3. **Clique no botão "Adicionar Venda"** (ícone de +) ao lado do nome
4. **Preencha os dados:**
   - **Mês**: Selecione o mês da venda
   - **Ano**: Selecione o ano da venda
   - **Valor**: Digite o valor total vendido no período
5. **Clique em "Salvar"**

#### Como registrar vendas diárias:

1. **Na seção do funcionário, clique em "Vendas Diárias"**
2. **Clique em "Adicionar Venda Diária"**
3. **Preencha:**
   - **Data**: Selecione a data da venda
   - **Valor**: Digite o valor vendido
   - **Observação**: (Opcional) Adicione uma observação
4. **Clique em "Salvar"**

#### Como visualizar desempenho:

- **Gráfico de Vendas**: Mostra a evolução das vendas ao longo do mês
- **Tabela de Vendas**: Lista todas as vendas registradas
- **Percentual da Meta**: Mostra quanto o funcionário atingiu da meta individual
- **Status**: Indicador visual (verde = meta batida, amarelo = em andamento, vermelho = abaixo)

#### Como editar função do funcionário:

1. **Clique no ícone de editar** (lápis) ao lado do nome
2. **Selecione a nova função** no dropdown
3. **Clique em "Salvar"**

**Funções disponíveis:**
- Gerente
- Caixa
- Auxiliar de Loja
- Fiscal
- Estoque
- Vendedor
- Vendedora
- Vendedor Online

---

### 🎯 Metas {#metas}

Esta seção permite definir e gerenciar as metas mensais da loja.

#### Como criar uma meta mensal:

1. **Acesse "Metas" no menu**
2. **Clique em "Nova Meta"**
3. **Preencha os dados:**
   - **Mês**: Selecione o mês
   - **Ano**: Selecione o ano
   - **Valor da Meta**: Digite o valor em R$
4. **Clique em "Salvar"**

**Importante:** Só pode haver uma meta por mês/ano. Se já existir uma meta para o período, você precisará editá-la.

#### Como editar uma meta:

1. **Na lista de metas, clique no ícone de editar** (lápis)
2. **Modifique o valor da meta**
3. **Clique em "Salvar"**

#### Como excluir uma meta:

1. **Na lista de metas, clique no ícone de excluir** (lixeira)
2. **Confirme a exclusão**

#### Visualização:

- **Cards de Resumo**: Mostra meta do mês, total vendido, faltando para meta
- **Gráfico Mensal**: Gráfico de linha mostrando vendas diárias
- **Status da Meta**: Indicador visual do progresso
- **Histórico**: Lista de todas as metas criadas

---

### 💰 Vendas Comerciais {#vendas-comerciais}

Esta seção permite registrar vendas que não são de funcionários específicos (vendas diretas da loja).

#### Como registrar uma venda comercial:

1. **Acesse "Vendas Comerciais" no menu**
2. **Clique em "Nova Venda"**
3. **Preencha os dados:**
   - **Data**: Selecione a data da venda
   - **Valor**: Digite o valor da venda
   - **Observação**: (Opcional) Adicione uma observação
4. **Clique em "Salvar"**

#### Como visualizar vendas:

- **Resumo do Mês**: Total de vendas comerciais do mês selecionado
- **Gráfico**: Gráfico de linha mostrando vendas diárias
- **Tabela**: Lista todas as vendas agrupadas por dia
- **Filtros**: Selecione mês e ano para visualizar períodos diferentes

#### Como editar uma venda:

1. **Na tabela, clique no dia desejado**
2. **Clique em "Editar"**
3. **Modifique os dados**
4. **Clique em "Salvar"**

#### Como excluir uma venda:

1. **Na tabela, clique no dia desejado**
2. **Clique em "Excluir"**
3. **Confirme a exclusão**

---

### 💬 Feedback {#feedback}

Esta seção permite avaliar e dar feedback sobre o desempenho dos funcionários.

#### Como dar feedback:

1. **Acesse "Feedback" no menu**
2. **Selecione o funcionário** no dropdown
3. **Selecione o mês e ano** do período
4. **Visualize os dados do funcionário:**
   - Total vendido
   - Média diária
   - Gráfico de vendas diárias
   - Tabela de vendas
5. **Adicione uma observação** (opcional)
6. **Clique em "Salvar Observação"**

#### Como visualizar feedbacks anteriores:

- **Lista de Observações**: Mostra todas as observações já registradas
- **Filtros**: Use os filtros para encontrar observações específicas

#### Como imprimir relatório:

1. **Selecione o funcionário e período**
2. **Clique em "Imprimir"**
3. **Uma nova janela abrirá com o relatório formatado**

---

### 📅 Agenda {#agenda}

Esta seção permite criar e gerenciar eventos e tarefas.

#### Como criar um evento:

1. **Acesse "Agenda" no menu**
2. **Clique em "Novo Evento"**
3. **Preencha os dados:**
   - **Data**: Selecione a data do evento
   - **Título**: Nome do evento
   - **Descrição**: Detalhes do evento (opcional)
   - **Tipo**: Tarefa, Reunião, Lembrete, Evento
   - **Prioridade**: Baixa, Média, Alta
   - **Notificação**: Ative para receber lembretes
   - **Dias de Antecedência**: Quantos dias antes avisar
   - **Horário**: Horário do lembrete
4. **Clique em "Salvar"**

#### Como visualizar eventos:

- **Calendário Mensal**: Visualize todos os eventos do mês
- **Filtros**: Filtre por tipo ou prioridade
- **Busca**: Busque eventos por título ou descrição

#### Como editar um evento:

1. **Clique no evento no calendário**
2. **Clique em "Editar"**
3. **Modifique os dados**
4. **Clique em "Salvar"**

#### Como excluir um evento:

1. **Clique no evento no calendário**
2. **Clique em "Excluir"**
3. **Confirme a exclusão**

#### Como marcar evento como concluído:

1. **Clique no evento**
2. **Clique em "Concluir"**
3. **O evento será marcado como concluído**

---

### 📦 Estoque {#estoque}

Esta seção permite controlar o estoque de produtos.

#### Como cadastrar um produto:

1. **Acesse "Estoque" no menu**
2. **Clique em "Novo Produto"**
3. **Preencha os dados:**
   - **Nome**: Nome do produto
   - **Categoria**: Categoria do produto
   - **Quantidade**: Quantidade em estoque
   - **Valor Unitário**: Preço do produto
   - **Descrição**: (Opcional) Descrição do produto
4. **Clique em "Salvar"**

#### Como atualizar estoque:

1. **Na lista de produtos, clique em "Editar"**
2. **Modifique a quantidade**
3. **Clique em "Salvar"**

#### Como registrar entrada/saída:

1. **Clique no produto**
2. **Clique em "Registrar Movimentação"**
3. **Selecione o tipo**: Entrada ou Saída
4. **Digite a quantidade**
5. **Adicione uma observação** (opcional)
6. **Clique em "Salvar"**

---

### 🧹 Limpeza {#limpeza}

Esta seção permite gerenciar a escala de limpeza da loja.

#### Como criar escala de limpeza:

1. **Acesse "Limpeza" no menu**
2. **Selecione o mês e ano**
3. **Clique em "Criar Escala"**
4. **Para cada dia do mês:**
   - Clique no dia
   - Selecione o funcionário responsável
   - Clique em "Salvar"
5. **A escala será salva automaticamente**

#### Como visualizar escala:

- **Calendário Mensal**: Mostra todos os dias do mês
- **Cada dia mostra**: Funcionário responsável pela limpeza
- **Cores diferentes**: Indicam diferentes funcionários

#### Como editar escala:

1. **Clique no dia desejado**
2. **Selecione outro funcionário**
3. **Clique em "Salvar"**

---

## 👑 Área do Dono {#área-do-dono}

### 🏢 Dashboard do Dono {#dashboard-do-dono}

O Dashboard do Dono mostra uma visão agregada de todas as lojas.

#### O que você vê:

**1. Cards de Resumo Geral**
- **Total de Lojas**: Quantidade de lojas cadastradas
- **Total de Funcionários**: Soma de todos os funcionários de todas as lojas
- **Meta Total**: Soma de todas as metas das lojas
- **Total Vendido**: Soma de todas as vendas de todas as lojas
- **Vendas Comerciais**: Total de vendas comerciais

**2. Filtros e Busca**
- **Buscar Loja**: Digite o nome da loja ou gerente
- **Filtro por Status**: Filtre por meta batida, em andamento ou abaixo
- **Ordenação**: Ordene por desempenho, vendas ou nome

**3. Lista de Lojas**
- Cada card mostra:
  - Nome da loja
  - Nome do gerente
  - Total de funcionários
  - Meta do mês
  - Total vendido
  - Percentual atingido
  - Status da meta
  - Top 3 vendedores
- **Clique no card** para ver detalhes completos da loja

**4. Gráficos**
- **Gráfico de Lojas**: Compara o desempenho de todas as lojas
- **Gráfico de Pizza**: Mostra a distribuição de vendas entre lojas
- **Gráfico de Evolução**: Mostra a evolução das vendas ao longo do tempo

**5. Funcionários por Função - Por Loja**
- Cada loja tem suas próprias tabelas
- Funcionários agrupados por função
- Mostra o nome de cada funcionário em sua função

**6. Métricas Avançadas**
- **Ticket Médio**: Valor médio por transação de cada loja
- **Vendas/Funcionário**: Média de vendas por funcionário de cada loja
- **Taxa de Conversão**: Percentual de atingimento da meta de cada loja

#### Como visualizar detalhes de uma loja:

1. **Clique no card da loja** desejada
2. **Um modal abrirá mostrando:**
   - Informações do gerente
   - Lista completa de funcionários
   - Gráfico de vendas diárias
   - Top vendedores
   - Feedback dos funcionários
   - Histórico de metas
3. **Clique em "Baixar PDF"** para gerar um PDF completo com todos os dados
4. **Feche o modal** clicando no X

#### Como baixar PDF dos detalhes:

1. **Abra os detalhes da loja**
2. **Clique no botão "Baixar PDF"** (ícone de download)
3. **O PDF será gerado automaticamente** contendo:
   - Informações da loja
   - Lista de funcionários
   - Top vendedores
   - Gráfico de vendas diárias
   - Tabela de vendas diárias
   - Feedback dos funcionários
   - Histórico de metas

#### Como ver funcionários por função:

- **Role a página até "Funcionários por Função - Por Loja"**
- **Cada loja mostra:**
  - Tabelas separadas para cada função
  - Nome de cada funcionário em sua função
- **Passe o mouse sobre o nome** para ver dados completos do funcionário

---

### 📊 Métricas Avançadas {#métricas-avançadas}

As métricas avançadas ajudam a comparar o desempenho entre lojas.

#### O que cada métrica significa:

**1. Ticket Médio**
- **O que é**: Valor médio de cada venda/transação
- **Como calcular**: Total de vendas ÷ Número de transações
- **Exemplo**: Se a loja vendeu R$ 100.000 em 30 vendas, o ticket médio é R$ 3.333,33
- **Quanto maior, melhor**: Indica que as vendas têm valores mais altos

**2. Vendas/Funcionário**
- **O que é**: Média de vendas geradas por cada funcionário
- **Como calcular**: Total de vendas ÷ Número de funcionários
- **Exemplo**: Se a loja vendeu R$ 100.000 e tem 5 funcionários, cada um gerou em média R$ 20.000
- **Quanto maior, melhor**: Indica maior produtividade da equipe

**3. Taxa de Conversão**
- **O que é**: Percentual de quanto a loja atingiu da meta
- **Como calcular**: (Total vendido ÷ Meta) × 100
- **Exemplo**: Se a meta é R$ 100.000 e foi vendido R$ 45.000, a taxa é 45%
- **100% ou mais**: Meta foi batida! 🎉

---

## 💡 Dicas e Informações Importantes {#dicas-e-informações-importantes}

### Dicas Gerais:

1. **Sempre salve seus dados**
   - Após preencher formulários, clique em "Salvar"
   - Aguarde a confirmação antes de fechar a página

2. **Use os filtros**
   - Os filtros de mês/ano ajudam a visualizar períodos diferentes
   - Use a busca para encontrar funcionários rapidamente

3. **Exporte dados regularmente**
   - Use a função de PDF para manter backup dos dados
   - Os PDFs podem ser salvos e compartilhados

4. **Mantenha dados atualizados**
   - Atualize vendas diariamente
   - Revise metas mensalmente
   - Mantenha dados dos funcionários atualizados

### Informações sobre Funções:

**Funções de Venda** (aparecem em gráficos e rankings):
- Vendedor
- Vendedora
- Vendedor Online

**Outras Funções** (não aparecem em gráficos de vendas):
- Gerente
- Caixa
- Auxiliar de Loja
- Fiscal
- Estoque

**Importante**: Apenas funcionários com funções de venda aparecem nos gráficos de vendas e rankings. Isso é proposital para manter as métricas focadas em vendedores.

### Sobre Aniversários:

- O sistema usa a **data de nascimento** para calcular aniversários
- Aniversários são mostrados no Dashboard
- Apenas funcionários do mês selecionado aparecem

### Sobre Metas:

- **Meta da Loja**: Meta geral mensal da loja
- **Meta Individual**: Meta mensal de cada funcionário
- As duas são independentes
- A meta da loja é usada para calcular o status geral
- A meta individual é usada para avaliar cada funcionário

### Sobre Vendas:

- **Vendas de Funcionários**: Vendas registradas na seção "Funcionários"
- **Vendas Comerciais**: Vendas registradas na seção "Vendas Comerciais"
- **Total Geral**: Soma das duas
- O total geral é usado para calcular se a meta foi batida

---

## ❓ Perguntas Frequentes {#perguntas-frequentes}

### Como faço para resetar minha senha?

Atualmente, não há função de recuperação de senha. Entre em contato com o administrador do sistema.

### Posso ter mais de uma meta por mês?

Não. Cada mês/ano pode ter apenas uma meta. Se precisar alterar, edite a meta existente.

### Por que alguns funcionários não aparecem nos gráficos?

Apenas funcionários com funções de venda (Vendedor, Vendedora, Vendedor Online) aparecem nos gráficos de vendas. Funcionários de outras funções (Caixa, Estoque, etc.) não aparecem porque não têm vendas.

### Como excluo uma loja?

Lojas não podem ser excluídas pelo sistema. Entre em contato com o administrador.

### Os dados são salvos automaticamente?

Não. Sempre clique em "Salvar" após fazer alterações. Se fechar a página sem salvar, as alterações serão perdidas.

### Posso usar o sistema no celular?

Sim! O sistema é totalmente responsivo e funciona em celulares, tablets e computadores.

### Como imprimo um relatório?

Muitas seções têm botões de "Imprimir" ou "Baixar PDF". Use essas funções para gerar relatórios.

### Os dados são seguros?

Sim. O sistema usa autenticação segura e cada gerente só vê os dados da sua loja. O dono vê dados de todas as lojas.

### Posso exportar todos os dados?

Sim. Use a função "Baixar PDF" na seção "Dados Funcionários" para exportar todos os funcionários. No Dashboard do Dono, use "Baixar PDF" nos detalhes da loja.

### Como vejo dados de meses anteriores?

Use os filtros de mês/ano no topo das páginas. Selecione o período desejado e os dados serão atualizados.

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. **Consulte este manual primeiro**
2. **Verifique se está usando a versão mais recente**
3. **Entre em contato com o administrador do sistema**

---

## 📝 Notas Finais

Este manual foi criado para ajudá-lo a usar o sistema FlowGest de forma eficiente. 

**Lembre-se:**
- Sempre salve suas alterações
- Use os filtros para encontrar informações rapidamente
- Exporte dados regularmente para backup
- Mantenha informações atualizadas

**Bom uso do sistema!** 🚀

---

*Última atualização: Dezembro 2024*

