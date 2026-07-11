# Protocolo Ares — Catálogo de Módulos

## 1. Hidratação / WaterTracker
**Objetivo:** gerenciar o protocolo diário de hidratação.

**Arquivos principais:**
- `WaterTracker.tsx`
- `protocolEngine.ts`

**Dependências:**
- perfil do usuário;
- ajustes do dia;
- Supabase;
- LocalStorage.

**Status:** em desenvolvimento funcional.

**Funcionalidades v1.0:**
- meta fixa;
- recomendações extras;
- cronograma fisiológico fixo;
- botões rápidos;
- botão personalizado.

**Evolução planejada:**
- cronograma adaptativo por eventos.

## 2. Protocol Engine
**Objetivo:** centralizar regras de negócio e cálculos do sistema.

**Arquivo principal:**
- `protocolEngine.ts`

**Responsabilidades:**
- processar perfil;
- calcular meta base;
- gerar cronogramas;
- aplicar recomendações extras.

**Status:** ativo.

## 3. Perfil do Usuário
**Objetivo:** armazenar os dados-base para gerar o protocolo.

**Arquivos associados:**
- `profileStorage.ts`
- componentes de perfil

**Responsabilidades:**
- armazenar peso, composição corporal, objetivo e preferências do protocolo;
- servir de base para cálculos do motor.

**Status:** funcional.

## 4. Treino / Workout
**Objetivo:** registrar a sessão diária e alimentar os outros módulos.

**Estado atual:** precisa evoluir de horário único para agenda de eventos.

**Função estratégica:**
- influenciar água;
- influenciar nutrição;
- influenciar sugestões contextuais.

## 5. Nutrição
**Objetivo:** organizar refeições e macros com base no protocolo.

**Status:** planejado.

**Requisitos principais:**
- integração com treino;
- visualização de macros;
- registro simplificado.

## 6. Dashboard
**Objetivo:** consolidar a visão diária do usuário.

**Status:** planejado.

**Itens esperados:**
- hidratação;
- treino;
- nutrição;
- progresso geral.
