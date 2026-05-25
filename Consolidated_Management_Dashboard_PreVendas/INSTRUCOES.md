# Ferramenta de Consolidação de Dados de Gestão

Esta aplicação consolida dados de gestão por área (time) com filtros por mês e ano.

## Como Usar

### 1. Preparar o Arquivo

A aplicação aceita arquivos **TXT** (separado por TAB) ou **CSV** (separado por vírgula ou ponto e vírgula).

**Formato TXT (separado por TAB):**

```
cliente	projeto	colaborador	empresa	email	time	qtdehoras	mes	ano	horas_apontadas	valor_final_empresa	valor_hora	custo_projeto	tipo	prevenda
Cliente A	Alpha	João Silva	Empresa A	joao@email.com	TI	160	Janeiro	2024	160	24000	150	24000	Faturado	Sim
Interno	Interno	João Silva	Empresa A	joao@email.com	TI	30	Janeiro	2024	30	4500	150	4500	Desalocação	Não
```

**Formato CSV (separado por vírgula):**

```
cliente,projeto,colaborador,empresa,email,time,qtdehoras,mes,ano,horas_apontadas,valor_final_empresa,valor_hora,custo_projeto,tipo,prevenda
Cliente A,Alpha,João Silva,Empresa A,joao@email.com,TI,160,Janeiro,2024,160,24000,150,24000,Faturado,Sim
Interno,Interno,João Silva,Empresa A,joao@email.com,TI,30,Janeiro,2024,30,4500,150,4500,Desalocação,Não
```

**Formato CSV (separado por ponto e vírgula):**

```
cliente;projeto;colaborador;empresa;email;time;qtdehoras;mes;ano;horas_apontadas;valor_final_empresa;valor_hora;custo_projeto;tipo;prevenda
Cliente A;Alpha;João Silva;Empresa A;joao@email.com;TI;160;Janeiro;2024;160;24000;150;24000;Faturado;Sim
Interno;Interno;João Silva;Empresa A;joao@email.com;TI;30;Janeiro;2024;30;4500;150;4500;Desalocação;Não
```

**Colunas obrigatórias (15 colunas):**
- **cliente**: Nome do cliente
- **projeto**: Nome do projeto
- **colaborador**: Nome do colaborador
- **empresa**: Nome da empresa
- **email**: E-mail do colaborador
- **time**: Nome do time/área (TI, RH, Financeiro, etc.)
- **qtdehoras**: Quantidade de horas
- **mes**: Nome do mês (Janeiro, Fevereiro, etc.)
- **ano**: Ano (2024, 2025, etc.)
- **horas_apontadas**: Horas efetivamente apontadas
- **valor_final_empresa**: Valor final para a empresa
- **valor_hora**: Valor por hora
- **custo_projeto**: Custo do projeto
- **tipo**: Tipo de apontamento (Faturado, Desalocação, Overhead, Débito BH, Férias)
- **prevenda**: Indicador de pré-venda (Sim/Não)

### 2. Carregar os Dados

1. Clique no botão "Selecionar Arquivo TXT/CSV"
2. Escolha seu arquivo .txt ou .csv com os dados
3. Os dados serão processados automaticamente
   - O separador é detectado automaticamente (TAB, vírgula ou ponto e vírgula)
   - Abra o console do navegador (F12) para ver detalhes do processamento

### 3. Configurar Sistema

Clique no botão "Configurações" para acessar o menu de configurações do sistema.

#### 3.1. Filtro de Áreas (Áreas Visíveis)

1. Acesse a aba "Áreas Visíveis"
2. Use a barra de busca para encontrar áreas específicas
3. Marque/desmarque as áreas que deseja exibir no relatório
4. Use "Selecionar Todas" ou "Desmarcar Todas" para facilitar
5. Clique em "Aplicar Filtro"

**Observação**: Apenas as áreas selecionadas terão seus dados consolidados e exibidos nos relatórios.

#### 3.2. Metas de Desalocação (Metas por Área)

1. Acesse a aba "Metas por Área"
2. Defina a meta (%) de desalocação para cada área
3. Use "Resetar Todas" para zerar todas as metas
4. Clique em "Salvar Metas"

A variação entre a desalocação real e a meta será calculada automaticamente.

### 4. Visualizar Consolidações

**Consolidação Mensal:**
- Selecione o mês e ano desejados nos filtros
- Visualize os dados consolidados por área para aquele mês

**Consolidação Anual:**
- Selecione o ano desejado
- Visualize os dados consolidados de todo o ano

## Indicador de Filtro

Na parte superior da página, você verá:
- **Total de áreas disponíveis**: Quantas áreas existem nos dados carregados
- **Áreas visíveis**: Quantas áreas estão selecionadas para exibição
- Exemplo: "5 de 10 áreas visíveis" indica que apenas 5 áreas estão sendo mostradas

## Colunas da Consolidação

A tabela de consolidação apresenta:

- **Área**: Nome da área
- **Custo Total**: Custo total da área
- **% Custo**: Percentual em relação ao custo total
- **Colaboradores**: Total de colaboradores
- **% Colab.**: Percentual de colaboradores em relação ao total
- **Débito BH**: Custo, percentual e horas
- **Desalocação**: Custo, percentual e horas
- **Faturado**: Custo, percentual e horas
- **Overhead**: Custo, percentual e horas
- **Férias**: Custo, percentual e horas
- **% Desaloc. (-Férias)**: Percentual de desalocação sem férias
- **% Desaloc. (+Férias)**: Percentual de desalocação com férias
- **Meta**: Meta configurada para a área
- **Variação Meta**: Diferença entre % Desaloc. (+Férias) e Meta
  - Verde: Abaixo da meta (bom)
  - Vermelho: Acima da meta (atenção)
- **Custo Médio FTE**: Custo médio por colaborador
- **Ociosidade R$**: Custo de desalocação
- **Ociosidade FTE**: FTE ociosos (Desalocação / Custo Médio FTE)

## Tipos de Apontamento

O campo **tipo** classifica cada registro e é usado para calcular as métricas:

- **Faturado**: Horas e custos faturados para clientes
- **Desalocação**: Horas e custos sem alocação/projeto
- **Overhead**: Horas e custos administrativos
- **Débito BH**: Débitos de banco de horas
- **Férias**: Horas e custos de férias

## Arquivos de Exemplo

- **exemplo-dados-novo.txt**: Arquivo de exemplo no formato TXT (separado por TAB)
- **exemplo-dados-novo.csv**: Arquivo de exemplo no formato CSV (separado por vírgula)
- **exemplo-dados-novo-semicolon.csv**: Arquivo de exemplo no formato CSV (separado por ponto e vírgula)

Use qualquer um deles como referência para o formato correto dos dados.
