# Protocolo Ares — Documento Mestre

## 1. Visão do Projeto
O **Protocolo Ares** é um sistema de orientação fisiológica para acompanhamento de hidratação, nutrição, treino e recuperação.

O objetivo do projeto não é apenas registrar dados, mas **orientar decisões** com base no contexto do usuário.

## 2. Identidade do Projeto
- O Ares não é apenas um contador de água.
- O Ares não é apenas um diário alimentar.
- O Ares é um **protocolo integrado**.
- O sistema deve agir como um **orientador**, não como um fiscal.

## 3. Princípios Fundamentais
### 3.1 O sistema orienta, não impõe
O usuário mantém autonomia total. O aplicativo sugere estratégias, mas não força condutas.

### 3.2 Meta vs. sugestão
A meta diária de água é definida no cadastro inicial e **não muda automaticamente** ao longo do dia.

Treino, calor e creatina geram **recomendações extras**, e não uma nova obrigação.

### 3.3 Transparência fisiológica
Toda sugestão deve explicar o motivo:
- reidratação ao acordar;
- pré-treino;
- pós-treino;
- calor elevado;
- atenção à hidratação com creatina.

### 3.4 Integração entre módulos
Os módulos de hidratação, treino, nutrição e sono devem conversar entre si por meio de um motor central de regras.

## 4. Arquitetura Geral
### 4.1 Stack atual
- Frontend: React + Vite
- Estilo: Tailwind CSS v4
- Ícones: Lucide React
- Banco e autenticação: Supabase
- Persistência local complementar: LocalStorage

### 4.2 Motor central
Arquivo principal de inteligência:
- `protocolEngine.ts`

Função do motor:
- ler perfil do usuário;
- calcular metas base;
- gerar cronogramas;
- aplicar recomendações extras;
- servir de base para WaterTracker, Nutrição e Treino.

## 5. Módulos do Projeto
### 5.1 WaterTracker / Hidratação Inteligente
Estado atual da v1.0:
- meta fixa de hidratação;
- recomendações extras por treino, calor e creatina;
- cronograma fisiológico estratégico fixo;
- botões rápidos de consumo;
- botão personalizado para consumo manual.

### 5.2 Workout / Agenda de treino
Conceito aprovado:
- o sistema deve evoluir de horário único para múltiplos eventos por dia;
- deve suportar musculação e LISS em horários independentes ou sequenciais.

### 5.3 Nutrição
Planejado para v1.0:
- integração com horário de treino;
- distribuição de refeições com base no protocolo;
- exibição de macros;
- registro simplificado de refeições.

### 5.4 Dashboard
Planejado para v1.0:
- visão consolidada de água, treino, nutrição e progresso diário.

## 6. Regras de Negócio já Definidas
### Hidratação
- A meta não será recalculada automaticamente durante o dia.
- O clima gera sugestão, não obrigação.
- A creatina gera atenção especial à hidratação, mas não redefine meta.
- O treino influencia a estratégia de distribuição, sem alterar a meta obrigatória.
- O cronograma da v1.0 será estratégico e fixo.
- O cronograma adaptativo ficará para a v2.0.

### Treino
- O usuário pode fazer musculação e LISS em horários diferentes.
- O usuário pode fazer musculação e LISS em sequência.
- O sistema deve futuramente trabalhar por eventos, e não apenas por um horário fixo.

## 7. Roadmap
### v1.0
- estabilizar WaterTracker;
- integrar treino e nutrição;
- criar dashboard consolidado;
- consolidar persistência com Supabase + LocalStorage;
- exportação de dados.

### v2.0
- cronograma adaptativo de hidratação;
- distribuição por eventos do dia;
- maior inteligência contextual entre módulos.

## 8. Diretriz de Continuidade
Em novas conversas, este documento deve ser usado como base estratégica principal do projeto.
