# AGENTS.md - Revenda Fast

## Stack e Comandos de Execução
- **Linguagem / Runtime:** 
- **Instalação de Dependências:** 
- **Execução Local:** 
- **Execução de Testes:** 

## Estrutura de Pastas
- `docs/specs/`: Especificações executáveis (fonte da verdade).
- `src/`: Código-fonte da aplicação.
- `tests/`: Baterias de testes automatizados derivados dos critérios de aceite.

## Regras de Governança
1. Toda nova funcionalidade nasce a partir de uma especificação em `docs/specs/`.
2. Nunca altere arquivos em `docs/specs/` sem aviso ou alinhamento prévio: a spec é a fonte da verdade.
3. Não escreva código sem antes possuir critérios de aceite verificáveis (Dado/Quando/Então).

## Como Você Deve Trabalhar (Princípios de Karpathy)
1. **Pense antes de programar:** Declare suas suposições. Se um critério admitir duas leituras diferentes, pergunte antes de escrever código.
2. **Simplicidade primeiro:** Escreva o mínimo de código estritamente necessário para fazer os testes passarem. Sem abstrações especulativas.
3. **Mudanças cirúrgicas:** Toque apenas nos arquivos pertinentes à tarefa solicitada. Mantenha os padrões e estilos já adotados no repositório.
4. **Execução guiada por objetivo:** Todo critério de aceite deve ser convertido em um teste automatizado antes da entrega da tarefa.