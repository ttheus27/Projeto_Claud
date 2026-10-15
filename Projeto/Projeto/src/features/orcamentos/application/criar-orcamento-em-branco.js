export function criarOrcamentoEmBranco() {
  return {
    cliente: 'Schulz Compressores S/A',
    unidade: 'Planta Principal Joinville',
    codigoPeca: 'SCH-NOVA-001',
    descricaoPeca: 'Novo Componente Usinado de Alta Precisão',
    material: 'Aço ABNT 1045',
    dureza: '180 HB',
    pesoKg: 3.5,
    lotePadrao: 500,
    status: 'Pendente',
    responsavel: 'Engenharia Schulz',
    centroCusto: 'CC-310 (Usinagem Pesada CNC)',
    custoMateriaPrima: 50,
    margemLucroPercentual: 20,
    impostosPercentual: 14.25,
    desenhoTecnico: {
      numero: 'DWG-SCH-NOVO',
      revisao: 'Rev. 0',
      toleranciaGeral: 'ISO 2768-mK',
      rugosidade: 'Ra 1.6 um',
      dimensoes: '150mm x 100mm',
      svgTipo: 'carcaca'
    },
    operacoes: [{
      id: 'OP-10',
      ordem: 1,
      codigo: 'USIN-TOR-01',
      descricao: 'Torneamento e Faceamento Inicial',
      centroTrabalho: 'Torno CNC',
      tempoSetupMin: 30,
      tempoCicloMin: 6,
      custoHoraMaquina: 180,
      custoHoraHomem: 40,
      custoFerramentalItem: 8,
      zerarCusto: false,
      observacao: 'Primeira operação'
    }]
  };
}
