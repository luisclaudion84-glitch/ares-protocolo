# Protocolo Ares — Registro de Decisões (ADR)

## ADR-001 — Meta de hidratação fixa
**Contexto:** surgiu a dúvida se calor, treino e creatina deveriam aumentar automaticamente a meta do dia.

**Decisão:** a meta diária de água é definida no cadastro inicial e permanece fixa durante o dia.

**Justificativa:** isso preserva o conceito clínico do protocolo e evita transformar recomendações em obrigação.

## ADR-002 — Calor, treino e creatina geram recomendações extras
**Contexto:** o sistema precisava considerar variáveis do dia sem descaracterizar a meta principal.

**Decisão:** calor, treino e creatina geram recomendações adicionais de consumo, mas não alteram a meta obrigatória.

**Justificativa:** o Ares orienta o usuário; não impõe consumo além da meta base.

## ADR-003 — O Ares orienta, não impõe
**Contexto:** definição da filosofia central do produto.

**Decisão:** o sistema deve apresentar estratégias e justificativas, preservando a autonomia do usuário.

**Justificativa:** essa abordagem se aproxima mais da prática clínica e da adesão real do usuário.

## ADR-004 — Protocol Engine como cérebro do sistema
**Contexto:** havia risco de espalhar cálculos em vários componentes.

**Decisão:** a inteligência do sistema deve ficar centralizada em `protocolEngine.ts`.

**Justificativa:** evita duplicação de regra, melhora manutenção e cria consistência entre módulos.

## ADR-005 — WaterTracker v1.0 com cronograma estratégico fixo
**Contexto:** o cronograma adaptativo era interessante, mas aumentaria a complexidade da primeira versão.

**Decisão:** a v1.0 usará um cronograma fixo, porém fisiologicamente distribuído.

**Justificativa:** primeiro estabilizamos a base; depois evoluímos para adaptação dinâmica.

## ADR-006 — Cronograma adaptativo fica para v2.0
**Contexto:** houve aprovação conceitual para uma hidratação baseada em eventos do dia.

**Decisão:** a v2.0 deverá redistribuir água com base em treino, LISS, rotina diária e resposta do usuário.

**Justificativa:** isso exige uma base de dados e integração entre módulos mais maduras.

## ADR-007 — Estrutura futura por eventos de treino
**Contexto:** um único campo `workoutTime` não comporta musculação e LISS separados ou em sequência.

**Decisão:** o projeto deve evoluir para agenda de eventos/sessões de treino.

**Justificativa:** essa estrutura será necessária para hidratação, nutrição e recomendações contextuais.
