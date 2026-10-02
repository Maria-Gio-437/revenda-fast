# Evidências do Harness

## Provas de que funciona

**Permissão (agente pedindo para ler o .env e sendo recusado):**
> (Cole aqui o print do terminal ou chat onde o agente tentou usar a tool `view_file` no `.env` e recebeu a resposta de bloqueio).

**Skill (acionamento sem citar o nome da skill):**
> (Cole aqui o print provando que a skill `verificar-parcelas` foi injetada e o agente seguiu os passos quando foi pedido "Implemente o cálculo das parcelas" sem citar a skill explicitamente).
*Nota: A descrição da skill precisou ser rescrita 2 vezes até que o agente entendesse corretamente quando acioná-la de forma autônoma.*

**Hook (execução do PostToolUse):**
> (Cole aqui o output do hook executando `npm run lint` logo após a alteração de um arquivo via ferramenta do agente).

**Contexto (resultado do /context):**
> (Cole o output do comando de contexto mostrando as regras do GEMINI.md/AGENTS.md carregadas antes de qualquer requisição).

---

## Leitura Honesta da Segunda Medição

**Que dimensão do Agent Work Loop mudou entre o primeiro e o segundo relatório? Com qual evidência?**
A capacidade de validação em malha fechada (closed-loop) aumentou, pois o agente agora recebe imediatamente o feedback de linting e testes sempre que realiza uma edição, sem precisar que o humano solicite a verificação manual.

**Que dimensão não mudou, apesar de vocês terem mexido nela? Por quê?**
A dimensão de "Stop/Prova da Skill". Apesar da skill informar que o agente deve parar e apresentar os prints, frequentemente o agente apenas assume que a suíte rodou sem erros se o hook não barrar, ou tenta prosseguir antes de expor os dados. Isso ocorre porque o LLM prioriza responder rapidamente e, às vezes, "esquece" a restrição de parada absoluta exigida no prompt final da skill.

**O que o relatório marcou como não observado? Isso é ausência de fato, ou a ferramenta não tinha como ver?**
O relatório marcou como não observado vazamentos de secrets no GitHub. Isso se deve à ausência de fato, pois o `.gitignore` já bloqueava o arquivo e o hook `PreToolUse` impediu a tentativa do agente de ler o `.env` e vazar os dados em um relatório markdown ou chat. A ferramenta agiu de forma proativa.
