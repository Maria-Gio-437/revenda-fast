# Relatório Better Harness (Relatório 1)

## Achado Escolhido
Foi identificado que o agente (Antigravity/Claude Code) não possuía contexto restrito suficiente, sendo capaz de acessar variáveis de ambiente de produção e apagar arquivos livremente se instruído pelo usuário, além de não executar validação automática no código gerado.

## Reparo Aplicado
1. Criação do script de permissões e do arquivo `hooks.json` bloqueando manipulações em arquivos sensíveis (ex: `.env`) e impedindo comandos destrutivos (ex: `rm -rf`).
2. Configuração de um hook `PostToolUse` para forçar a execução do lint/test a cada alteração feita pelo agente.
3. Configuração de uma skill com descrição clara (`verificar-parcelas`) ensinando o agente os passos lógicos de cálculo.

*Commit do reparo:* `git commit -m "chore: configure antigravity harness with hooks and skills"`
