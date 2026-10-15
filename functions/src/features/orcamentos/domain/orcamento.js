class OrcamentoValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OrcamentoValidationError';
    this.statusCode = 400;
  }
}

function assertPayload(payload) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    throw new OrcamentoValidationError('Envie os dados do orçamento em formato JSON.');
  }

  if (payload.operacoes !== undefined && !Array.isArray(payload.operacoes)) {
    throw new OrcamentoValidationError('As operações do orçamento devem ser uma lista.');
  }
}

function sanitizeOrcamentoPayload(payload) {
  assertPayload(payload);
  const { _id, ...orcamento } = payload;
  return orcamento;
}

function gerarCodigoOrcamento(instant) {
  const ano = new Date(instant).getFullYear();
  const sufixo = Date.now().toString().slice(-6);
  return `ORC-${ano}-${sufixo}`;
}

function criarNovoOrcamento(payload, { instant, idGenerator = gerarCodigoOrcamento }) {
  const orcamento = sanitizeOrcamentoPayload(payload);

  return {
    ...orcamento,
    id: orcamento.id || idGenerator(instant),
    status: orcamento.status || 'Pendente',
    criadoEm: orcamento.criadoEm || instant,
    atualizadoEm: instant
  };
}

function prepararAtualizacaoOrcamento(payload, { instant }) {
  return {
    ...sanitizeOrcamentoPayload(payload),
    atualizadoEm: instant
  };
}

module.exports = {
  OrcamentoValidationError,
  criarNovoOrcamento,
  prepararAtualizacaoOrcamento
};
