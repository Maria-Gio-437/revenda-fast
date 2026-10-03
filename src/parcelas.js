/**
 * Módulo de Cálculo de Parcelas e Regras Financeiras
 * Especificação: docs/specs/001-venda-parcelada-e-cobranca.md.txt
 * Regras implementadas: RN-01, RN-02, RN-03, RN-04, RN-05, RN-06, RN-07
 */

/**
 * Converte data de entrada em objeto Date zerado nas horas (00:00:00).
 * Suporta instâncias de Date e strings nos formatos DD/MM/YYYY ou YYYY-MM-DD.
 * @param {Date|string} dateInput
 * @returns {Date}
 */
function parseDate(dateInput) {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    } else if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
  }

  const parsed = new Date(dateInput);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Formata um objeto Date para o padrão DD/MM/YYYY
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata valor numérico para padrão BRL decimal com vírgula (ex: 33,34)
 * @param {number} valor
 * @returns {string}
 */
function formatarValorDecimal(valor) {
  return valor.toFixed(2).replace('.', ',');
}

/**
 * Calcula o cronograma de parcelas segundo as regras de negócio da SPEC-001.
 *
 * @param {Object} params
 * @param {number} params.valorTotal - Valor total da venda em BRL (1.00 <= valorTotal <= 50000.00)
 * @param {number} params.quantidadeParcelas - Quantidade de parcelas (1 a 12)
 * @param {string|Date} params.primeiroVencimento - Data do primeiro vencimento (DD/MM/YYYY ou Date)
 * @param {'Mensal'|'Quinzenal'|string} [params.intervalo='Mensal'] - Intervalo entre parcelas
 * @param {string|Date} [params.dataReferencia] - Data atual/referência para validação e status de atraso
 * @returns {Object} Dados do cálculo contendo lista de parcelas, saldo devedor e total
 */
function calcularParcelas({
  valorTotal,
  quantidadeParcelas,
  primeiroVencimento,
  intervalo = 'Mensal',
  dataRegistro,
  dataReferencia = new Date()
}) {
  // Validação: TC-05 - Valor Total
  if (typeof valorTotal !== 'number' || Number.isNaN(valorTotal) || valorTotal < 1.00) {
    throw new Error('O valor total deve ser maior ou igual a R$ 1,00.');
  }

  if (valorTotal > 50000.00) {
    throw new Error('O valor total deve ser menor ou igual a R$ 50.000,00.');
  }

  // Validação: TC-06 - Quantidade de Parcelas
  if (
    typeof quantidadeParcelas !== 'number' ||
    !Number.isInteger(quantidadeParcelas) ||
    quantidadeParcelas < 1 ||
    quantidadeParcelas > 12
  ) {
    throw new Error('A quantidade de parcelas deve ser entre 1 e 12.');
  }

  // Normalização do intervalo
  const intervaloNormalizado = String(intervalo).trim().toLowerCase();
  if (intervaloNormalizado !== 'mensal' && intervaloNormalizado !== 'quinzenal') {
    throw new Error("Intervalo inválido. Deve ser 'Mensal' ou 'Quinzenal'.");
  }

  const isMensal = intervaloNormalizado === 'mensal';

  const refDate = parseDate(dataReferencia);
  const data1 = parseDate(primeiroVencimento);

  if (Number.isNaN(data1.getTime())) {
    throw new Error('Data do primeiro vencimento inválida.');
  }

  // Validação: TC-07 - Data retroativa em relação à data de registro / data atual
  const dataValidacao = dataRegistro ? parseDate(dataRegistro) : refDate;
  if (data1.getTime() < dataValidacao.getTime()) {
    throw new Error('A data do primeiro vencimento não pode ser anterior à data atual.');
  }

  // RN-01: Divisão e Distribuição de Centavos
  // Trabalhamos em centavos inteiros para evitar imprecisão de ponto flutuante
  const totalCentavos = Math.round(valorTotal * 100);
  const baseCentavos = Math.floor(totalCentavos / quantidadeParcelas);
  const sobraCentavos = totalCentavos - (baseCentavos * quantidadeParcelas);

  const targetDay = data1.getDate();
  const parcelas = [];
  let previousDate = null;

  for (let i = 0; i < quantidadeParcelas; i++) {
    const numero = i + 1;
    // Sobra de centavos atribuída integralmente na 1ª parcela
    const centavosParcela = i === 0 ? (baseCentavos + sobraCentavos) : baseCentavos;
    const valorParcela = centavosParcela / 100;

    let vencimentoDate;

    if (i === 0) {
      vencimentoDate = new Date(data1.getFullYear(), data1.getMonth(), data1.getDate());
    } else if (isMensal) {
      // RN-02: Intervalo Mensal com ajuste para último dia corrido se o dia não existir
      const targetYear = data1.getFullYear();
      const targetMonth = data1.getMonth() + i;
      // new Date(ano, mes + 1, 0).getDate() retorna o último dia do mês desejado
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const actualDay = Math.min(targetDay, daysInMonth);
      vencimentoDate = new Date(targetYear, targetMonth, actualDay);
    } else {
      // RN-03: Intervalo Quinzenal - exatamente 15 dias corridos após a parcela anterior
      vencimentoDate = new Date(
        previousDate.getFullYear(),
        previousDate.getMonth(),
        previousDate.getDate() + 15
      );
    }

    previousDate = vencimentoDate;

    // RN-04: Transição de estado: se hoje > vencimento e não paga, está Atrasada; senão Pendente
    const estado = refDate.getTime() > vencimentoDate.getTime() ? 'Atrasada' : 'Pendente';

    parcelas.push({
      numero,
      ordem: `${numero} de ${quantidadeParcelas}`,
      dataVencimento: formatDate(vencimentoDate),
      dataVencimentoDate: vencimentoDate,
      valor: valorParcela,
      valorFormatado: `R$ ${formatarValorDecimal(valorParcela)}`,
      estado
    });
  }

  const saldoDevedor = parcelas
    .filter(p => p.estado !== 'Paga')
    .reduce((acc, p) => acc + Math.round(p.valor * 100), 0) / 100;

  return {
    valorTotal,
    valorTotalFormatado: `R$ ${formatarValorDecimal(valorTotal)}`,
    quantidadeParcelas,
    intervalo: isMensal ? 'Mensal' : 'Quinzenal',
    saldoDevedor,
    saldoDevedorFormatado: `R$ ${formatarValorDecimal(saldoDevedor)}`,
    parcelas
  };
}

/**
 * RN-06: Gera o texto da mensagem padronizada de cobrança
 */
function gerarMensagemCobranca({
  nomeCliente,
  numeroParcela,
  totalParcelas,
  descricaoItens,
  valorParcela,
  dataVencimento
}) {
  const valorStr = typeof valorParcela === 'number'
    ? formatarValorDecimal(valorParcela)
    : valorParcela;

  return `Olá, ${nomeCliente}! Passando para lembrar da parcela ${numeroParcela}/${totalParcelas} da sua compra (${descricaoItens}), no valor de R$ ${valorStr}, com vencimento em ${dataVencimento}. Posso te enviar a chave PIX?`;
}

/**
 * RN-07: Sanitiza o telefone e gera o link direto do WhatsApp wa.me
 */
function gerarLinkWhatsApp(telefone, mensagem) {
  const digits = String(telefone).replace(/\D/g, '');
  const phoneFormatted = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * RN-04: Atualiza os estados das parcelas baseado em uma data de referência
 */
function atualizarEstadoParcelas(venda, dataReferencia = new Date()) {
  const refDate = parseDate(dataReferencia);
  venda.parcelas.forEach(p => {
    // RN-05: Parcela Paga é irreversível pelo fluxo normal
    if (p.estado !== 'Paga') {
      p.estado = refDate.getTime() > p.dataVencimentoDate.getTime() ? 'Atrasada' : 'Pendente';
    }
  });

  venda.saldoDevedor = venda.parcelas
    .filter(p => p.estado !== 'Paga')
    .reduce((acc, p) => acc + Math.round(p.valor * 100), 0) / 100;
  venda.saldoDevedorFormatado = `R$ ${formatarValorDecimal(venda.saldoDevedor)}`;
  return venda;
}

/**
 * RN-05: Confirma o pagamento de uma parcela e reduz o saldo devedor
 */
function confirmarPagamentoParcela(venda, numeroParcela) {
  const parcela = venda.parcelas.find(p => p.numero === numeroParcela);
  if (!parcela) {
    throw new Error(`Parcela ${numeroParcela} não encontrada.`);
  }

  if (parcela.estado === 'Paga') {
    return venda;
  }

  parcela.estado = 'Paga';
  venda.saldoDevedor = venda.parcelas
    .filter(p => p.estado !== 'Paga')
    .reduce((acc, p) => acc + Math.round(p.valor * 100), 0) / 100;
  venda.saldoDevedorFormatado = `R$ ${formatarValorDecimal(venda.saldoDevedor)}`;
  return venda;
}

module.exports = {
  calcularParcelas,
  atualizarEstadoParcelas,
  confirmarPagamentoParcela,
  gerarMensagemCobranca,
  gerarLinkWhatsApp,
  parseDate,
  formatDate,
  formatarValorDecimal
};
