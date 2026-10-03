const test = require('node:test');
const assert = require('node:assert');
const {
  calcularParcelas,
  atualizarEstadoParcelas,
  confirmarPagamentoParcela,
  gerarMensagemCobranca,
  gerarLinkWhatsApp
} = require('../src/parcelas');

console.log('\n======================================================');
console.log('EXECUTANDO BATERIA DE TESTES - SPEC-001 (Revenda Fast)');
console.log('======================================================\n');

test('TC-01: Caso Feliz (R$ 150,00 em 3 parcelas mensais)', () => {
  const resultado = calcularParcelas({
    valorTotal: 150.00,
    quantidadeParcelas: 3,
    primeiroVencimento: '10/10/2026',
    intervalo: 'Mensal',
    dataReferencia: '02/10/2026'
  });

  console.log('[TC-01] Resultado:');
  resultado.parcelas.forEach(p => {
    console.log(`  P${p.numero}: ${p.valorFormatado} (${p.dataVencimento})`);
  });

  assert.strictEqual(resultado.parcelas.length, 3);
  assert.strictEqual(resultado.parcelas[0].valor, 50.00);
  assert.strictEqual(resultado.parcelas[0].dataVencimento, '10/10/2026');
  assert.strictEqual(resultado.parcelas[1].valor, 50.00);
  assert.strictEqual(resultado.parcelas[1].dataVencimento, '10/11/2026');
  assert.strictEqual(resultado.parcelas[2].valor, 50.00);
  assert.strictEqual(resultado.parcelas[2].dataVencimento, '10/12/2026');
  assert.strictEqual(resultado.saldoDevedor, 150.00);
});

test('TC-02: Caso de Borda - Dízima/Centavos na 1ª parcela (R$ 100,00 em 3 parcelas)', () => {
  const resultado = calcularParcelas({
    valorTotal: 100.00,
    quantidadeParcelas: 3,
    primeiroVencimento: '15/10/2026',
    intervalo: 'Mensal',
    dataReferencia: '02/10/2026'
  });

  console.log('[TC-02] Resultado:');
  resultado.parcelas.forEach(p => {
    console.log(`  P${p.numero}: ${p.valorFormatado} (${p.dataVencimento})`);
  });

  assert.strictEqual(resultado.parcelas.length, 3);
  assert.strictEqual(resultado.parcelas[0].valor, 33.34);
  assert.strictEqual(resultado.parcelas[0].dataVencimento, '15/10/2026');
  assert.strictEqual(resultado.parcelas[1].valor, 33.33);
  assert.strictEqual(resultado.parcelas[1].dataVencimento, '15/11/2026');
  assert.strictEqual(resultado.parcelas[2].valor, 33.33);
  assert.strictEqual(resultado.parcelas[2].dataVencimento, '15/12/2026');
  assert.strictEqual(resultado.saldoDevedor, 100.00);
});

test('TC-03: Caso de Borda - Fim de Mês em dia inexistente (R$ 200,00 em 2 parcelas a partir de 31/01/2027)', () => {
  const resultado = calcularParcelas({
    valorTotal: 200.00,
    quantidadeParcelas: 2,
    primeiroVencimento: '31/01/2027',
    intervalo: 'Mensal',
    dataReferencia: '02/10/2026'
  });

  console.log('[TC-03] Resultado:');
  resultado.parcelas.forEach(p => {
    console.log(`  P${p.numero}: ${p.valorFormatado} (${p.dataVencimento})`);
  });

  assert.strictEqual(resultado.parcelas.length, 2);
  assert.strictEqual(resultado.parcelas[0].valor, 100.00);
  assert.strictEqual(resultado.parcelas[0].dataVencimento, '31/01/2027');
  assert.strictEqual(resultado.parcelas[1].valor, 100.00);
  assert.strictEqual(resultado.parcelas[1].dataVencimento, '28/02/2027');
});

test('TC-04: Caso de Borda - Intervalo Quinzenal (R$ 100,00 em 2 parcelas)', () => {
  const resultado = calcularParcelas({
    valorTotal: 100.00,
    quantidadeParcelas: 2,
    primeiroVencimento: '10/10/2026',
    intervalo: 'Quinzenal',
    dataReferencia: '02/10/2026'
  });

  console.log('[TC-04] Resultado:');
  resultado.parcelas.forEach(p => {
    console.log(`  P${p.numero}: ${p.valorFormatado} (${p.dataVencimento})`);
  });

  assert.strictEqual(resultado.parcelas.length, 2);
  assert.strictEqual(resultado.parcelas[0].valor, 50.00);
  assert.strictEqual(resultado.parcelas[0].dataVencimento, '10/10/2026');
  assert.strictEqual(resultado.parcelas[1].valor, 50.00);
  assert.strictEqual(resultado.parcelas[1].dataVencimento, '25/10/2026');
});

test('TC-05: Caso de Erro - Valor Inválido menor que R$ 1,00', () => {
  assert.throws(
    () => {
      calcularParcelas({
        valorTotal: 0.00,
        quantidadeParcelas: 3,
        primeiroVencimento: '10/10/2026',
        intervalo: 'Mensal',
        dataReferencia: '02/10/2026'
      });
    },
    {
      message: 'O valor total deve ser maior ou igual a R$ 1,00.'
    }
  );
  console.log('[TC-05] Passou: Bloqueio correto com "O valor total deve ser maior ou igual a R$ 1,00."');
});

test('TC-06: Caso de Erro - Quantidade de parcelas inválida (0 parcelas)', () => {
  assert.throws(
    () => {
      calcularParcelas({
        valorTotal: 120.00,
        quantidadeParcelas: 0,
        primeiroVencimento: '10/10/2026',
        intervalo: 'Mensal',
        dataReferencia: '02/10/2026'
      });
    },
    {
      message: 'A quantidade de parcelas deve ser entre 1 e 12.'
    }
  );
  console.log('[TC-06] Passou: Bloqueio correto com "A quantidade de parcelas deve ser entre 1 e 12."');
});

test('TC-07: Caso de Erro - Data retroativa anterior à data atual', () => {
  assert.throws(
    () => {
      calcularParcelas({
        valorTotal: 100.00,
        quantidadeParcelas: 2,
        primeiroVencimento: '01/01/2025',
        intervalo: 'Mensal',
        dataReferencia: '02/10/2026'
      });
    },
    {
      message: 'A data do primeiro vencimento não pode ser anterior à data atual.'
    }
  );
  console.log('[TC-07] Passou: Bloqueio correto com "A data do primeiro vencimento não pode ser anterior à data atual."');
});

test('Critério de Aceite - Cenário 1: Registro de venda com divisão desigual de centavos', () => {
  const venda = calcularParcelas({
    valorTotal: 100.00,
    quantidadeParcelas: 3,
    primeiroVencimento: '15/10/2026',
    intervalo: 'Mensal',
    dataReferencia: '02/10/2026'
  });

  assert.strictEqual(venda.parcelas[0].valor, 33.34);
  assert.strictEqual(venda.parcelas[0].dataVencimento, '15/10/2026');
  assert.strictEqual(venda.parcelas[0].estado, 'Pendente');

  assert.strictEqual(venda.parcelas[1].valor, 33.33);
  assert.strictEqual(venda.parcelas[1].dataVencimento, '15/11/2026');
  assert.strictEqual(venda.parcelas[1].estado, 'Pendente');

  assert.strictEqual(venda.parcelas[2].valor, 33.33);
  assert.strictEqual(venda.parcelas[2].dataVencimento, '15/12/2026');
  assert.strictEqual(venda.parcelas[2].estado, 'Pendente');

  assert.strictEqual(venda.saldoDevedor, 100.00);
  console.log('[Cenário 1] Passou: Venda de R$ 100,00 dividida em 33,34 + 33,33 + 33,33, todas Pendentes.');
});

test('Critério de Aceite - Cenário 2: Atualização do estado de parcela por vencimento', () => {
  // Dado que existe uma parcela no estado "Pendente" com vencimento em 01/10/2026 registrada em 01/10/2026
  const venda = calcularParcelas({
    valorTotal: 50.00,
    quantidadeParcelas: 1,
    primeiroVencimento: '01/10/2026',
    intervalo: 'Mensal',
    dataRegistro: '01/10/2026',
    dataReferencia: '01/10/2026'
  });
  assert.strictEqual(venda.parcelas[0].estado, 'Pendente');

  // Quando a revendedora acessa a visualização da venda em 02/10/2026
  atualizarEstadoParcelas(venda, '02/10/2026');

  // Então o sistema exibe o estado dessa parcela como "Atrasada"
  assert.strictEqual(venda.parcelas[0].estado, 'Atrasada');
  console.log('[Cenário 2] Passou: Parcela vencida em 01/10/2026 transita para "Atrasada" em 02/10/2026.');
});

test('Critério de Aceite - Cenário 3: Confirmação de pagamento de parcela', () => {
  // Dado que uma parcela de R$ 50,00 com vencimento em 10/10/2026 está com o estado "Atrasada"
  const venda = calcularParcelas({
    valorTotal: 50.00,
    quantidadeParcelas: 1,
    primeiroVencimento: '10/10/2026',
    intervalo: 'Mensal',
    dataRegistro: '10/10/2026',
    dataReferencia: '11/10/2026'
  });
  assert.strictEqual(venda.parcelas[0].estado, 'Atrasada');
  assert.strictEqual(venda.saldoDevedor, 50.00);

  // Quando a revendedora seleciona a ação de confirmar o pagamento dessa parcela
  confirmarPagamentoParcela(venda, 1);

  // Então o sistema altera o estado da parcela para "Paga" e subtrai R$ 50,00 do saldo devedor
  assert.strictEqual(venda.parcelas[0].estado, 'Paga');
  assert.strictEqual(venda.saldoDevedor, 0.00);
  console.log('[Cenário 3] Passou: Parcela marcada como "Paga" e saldo devedor reduzido para R$ 0,00.');
});

test('Critério de Aceite - Cenário 4: Geração e acionamento da mensagem de cobrança', () => {
  const mensagem = gerarMensagemCobranca({
    nomeCliente: 'Carla Dias',
    numeroParcela: 2,
    totalParcelas: 3,
    descricaoItens: 'Batom Matte',
    valorParcela: 33.33,
    dataVencimento: '15/11/2026'
  });

  const esperado = 'Olá, Carla Dias! Passando para lembrar da parcela 2/3 da sua compra (Batom Matte), no valor de R$ 33,33, com vencimento em 15/11/2026. Posso te enviar a chave PIX?';
  assert.strictEqual(mensagem, esperado);

  const link = gerarLinkWhatsApp('64999991111', mensagem);
  const linkEsperado = `https://wa.me/5564999991111?text=${encodeURIComponent(esperado)}`;
  assert.strictEqual(link, linkEsperado);

  console.log('[Cenário 4] Passou: Link wa.me e mensagem padronizada gerados conforme RN-06 e RN-07.');
});
