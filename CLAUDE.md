# Configurações do Antigravity (Harness)

Este projeto utiliza o Antigravity como harness. O comportamento do agente é ditado primariamente pelo documento raiz de governança:

Leia primeiro as regras fundamentais do projeto no [AGENTS.md](./AGENTS.md).

## Regras Específicas do Harness

- O Antigravity deve respeitar os hooks configurados em `.agents/hooks.json`.
- A manipulação de arquivos sensíveis como `.env` e chaves de API é terminantemente proibida (gerida pelo `PreToolUse` hook).
- Todos os comandos de shell devem respeitar os limites operacionais estipulados no script de permissões.
- A skill `verificar-parcelas` deve ser ativada e seguida antes de qualquer implementação de cálculo financeiro que envolva parcelas, conferindo a divisão de centavos conforme a RN-01.