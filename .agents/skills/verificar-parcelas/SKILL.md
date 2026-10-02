---
name: verificar-parcelas
description: >-
  Esta skill deve ser usada toda vez que for necessário implementar, testar ou debugar lógicas de cálculo de parcelas da venda.
  Ela garante a aplicação correta das Regras de Negócio RN-01, RN-02 e RN-03.
---

# Skill: Verificação de Cálculo de Parcelas

Siga rigorosamente os passos abaixo ao implementar ou testar a lógica de parcelamento do Revenda Fast:

1. **Leia a Spec**: Verifique em `docs/specs/001-venda-parcelada-e-cobranca.md` as regras específicas (RN-01, RN-02 e RN-03).
2. **Implemente a Divisão**: Garanta que o valor total seja dividido pelo número de parcelas e arredondado em duas casas decimais.
3. **Atribua os Centavos**: A diferença de centavos (devida ao truncamento) deve ser somada **apenas na primeira parcela** (RN-01).
4. **Verifique Calendário Mensal (RN-02)**: Se o intervalo for mensal, verifique se o dia alvo não existe no mês seguinte e mova o vencimento para o último dia válido do mês.
5. **Verifique Calendário Quinzenal (RN-03)**: Se for quinzenal, some exatamente 15 dias corridos por parcela.
6. **Passo de Prova**: Antes de concluir a tarefa, execute a suíte de testes (`npm run test`) para validar o TC-01 e TC-02. O sistema deverá apresentar os resultados idênticos aos listados na especificação. Em caso de sucesso, apresente os prints da execução.
