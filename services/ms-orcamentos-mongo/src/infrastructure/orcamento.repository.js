import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getMongoClient } from "./mongo.client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_STORAGE_DIR = path.resolve(__dirname, "../../data");
const LOCAL_STORAGE_FILE = path.join(LOCAL_STORAGE_DIR, "orcamentos.json");

const SEED_DATA = [
  {
    id: "ORC-2026-0891",
    cliente: "Schulz Compressores S/A",
    unidade: "Unidade Joinville - SC",
    codigoPeca: "SCH-CMP-4420",
    descricaoPeca: "Virabrequim Monobloco Forjado 2 Cilindros",
    material: "Aço Forjado SAE 4140 Beneficiado",
    dureza: "28-32 HRC",
    pesoKg: 14.85,
    lotePadrao: 500,
    status: "Aprovado",
    responsavel: "Carlos Eduardo Mendes",
    criadoEm: "2026-08-15T14:30:00Z",
    atualizadoEm: "2026-08-26T10:15:00Z",
    centroCusto: "CC-310 (Usinagem Pesada CNC)",
    custoMateriaPrima: 185.50,
    margemLucroPercentual: 22.0,
    impostosPercentual: 14.25,
    desenhoTecnico: {
      numero: "DWG-SCH-4420-REV-D",
      revisao: "Rev. D",
      toleranciaGeral: "ISO 2768-mK",
      rugosidade: "Ra 0.8 um (Colos de Biela e Mancais)",
      dimensoes: "Comprimento: 480mm | Diâmetro Principal: 65mm",
      svgTipo: "virabrequim"
    },
    operacoes: [
      {
        id: "OP-10",
        ordem: 1,
        codigo: "USIN-TOR-01",
        descricao: "Torneamento de Desbaste e Faceamento CNC",
        centroTrabalho: "Torno CNC Mazak Quick Turn 350",
        tempoSetupMin: 45,
        tempoCicloMin: 14.5,
        custoHoraMaquina: 195.0,
        custoHoraHomem: 45.0,
        custoFerramentalItem: 18.2,
        zerarCusto: false,
        observacao: "Inserto CNMG 120408 com refrigeração de alta pressão"
      },
      {
        id: "OP-50",
        ordem: 2,
        codigo: "QUAL-MET-05",
        descricao: "Inspeção Metrológica Tridimensional CMM (Bonificada)",
        centroTrabalho: "Máquina CMM Zeiss Prismo Ultra",
        tempoSetupMin: 20,
        tempoCicloMin: 12.0,
        custoHoraMaquina: 240.0,
        custoHoraHomem: 65.0,
        custoFerramentalItem: 0.0,
        zerarCusto: true,
        observacao: "Inspeção de qualidade conforme norma Schulz (custo bonificado ao cliente)"
      }
    ]
  },
  {
    id: "ORC-2026-0912",
    cliente: "Schulz Automotiva S/A",
    unidade: "Unidade Fundição e Autopeças",
    codigoPeca: "SCH-AUT-7810",
    descricaoPeca: "Suporte de Pinça de Freio Dianteiro (Ferro Nodular)",
    material: "Ferro Fundido Nodular GGG-50",
    dureza: "170-220 HB",
    pesoKg: 6.42,
    lotePadrao: 1200,
    status: "Em Análise",
    responsavel: "Mariana Siqueira",
    criadoEm: "2026-09-02T09:00:00Z",
    atualizadoEm: "2026-09-08T16:45:00Z",
    centroCusto: "CC-220 (Usinagem Média 4 Eixos)",
    custoMateriaPrima: 74.20,
    margemLucroPercentual: 18.5,
    impostosPercentual: 14.25,
    desenhoTecnico: {
      numero: "DWG-SCH-7810-REV-B",
      revisao: "Rev. B",
      toleranciaGeral: "ISO 2768-mK",
      rugosidade: "Ra 1.6 um (Superfícies de Encaixe e Guias)",
      dimensoes: "Dimensões: 240x165x95mm | Furos Guias M12x1.5",
      svgTipo: "suporte"
    },
    operacoes: [
      {
        id: "OP-10",
        ordem: 1,
        codigo: "USIN-FRE-01",
        descricao: "Fresamento das Faces de Apoio da Pastilha",
        centroTrabalho: "Centro de Usinagem Horizontal Mazak HCN-5000",
        tempoSetupMin: 40,
        tempoCicloMin: 6.8,
        custoHoraMaquina: 180.0,
        custoHoraHomem: 45.0,
        custoFerramentalItem: 8.5,
        zerarCusto: false,
        observacao: "Fresa de topo inteiriça metal duro Ø50mm"
      }
    ]
  }
];

function initLocalStorage() {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(SEED_DATA, null, 2), "utf-8");
  }
}

function readLocalData() {
  initLocalStorage();
  try {
    const raw = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [...SEED_DATA];
  }
}

function writeLocalData(data) {
  initLocalStorage();
  fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const orcamentoRepository = {
  async listar() {
    const client = await getMongoClient();
    if (client) {
      const db = client.db(process.env.MONGO_DB_NAME || "schulz");
      const collection = db.collection(process.env.MONGO_ORCAMENTOS_COLLECTION || "orcamentos");
      const items = await collection.find({}).sort({ atualizadoEm: -1 }).toArray();
      if (items && items.length > 0) {
        return items.map(doc => {
          const { _id, ...resto } = doc;
          return { id: doc.id || _id.toString(), ...resto };
        });
      }
    }
    return readLocalData();
  },

  async buscarPorId(id) {
    const client = await getMongoClient();
    if (client) {
      const db = client.db(process.env.MONGO_DB_NAME || "schulz");
      const collection = db.collection(process.env.MONGO_ORCAMENTOS_COLLECTION || "orcamentos");
      const item = await collection.findOne({ $or: [{ id }, { _id: id }] });
      if (item) {
        const { _id, ...resto } = item;
        return { id: item.id || _id.toString(), ...resto };
      }
    }
    const local = readLocalData();
    return local.find(item => item.id === id) || null;
  },

  async criar(orcamento) {
    const client = await getMongoClient();
    if (client) {
      const db = client.db(process.env.MONGO_DB_NAME || "schulz");
      const collection = db.collection(process.env.MONGO_ORCAMENTOS_COLLECTION || "orcamentos");
      await collection.insertOne({ ...orcamento });
    }
    const local = readLocalData();
    local.unshift(orcamento);
    writeLocalData(local);
    return orcamento;
  },

  async atualizar(id, orcamento) {
    const client = await getMongoClient();
    if (client) {
      const db = client.db(process.env.MONGO_DB_NAME || "schulz");
      const collection = db.collection(process.env.MONGO_ORCAMENTOS_COLLECTION || "orcamentos");
      await collection.updateOne(
        { $or: [{ id }, { _id: id }] },
        { $set: { ...orcamento, atualizadoEm: new Date().toISOString() } }
      );
    }
    const local = readLocalData();
    const index = local.findIndex(item => item.id === id);
    if (index !== -1) {
      local[index] = { ...local[index], ...orcamento, atualizadoEm: new Date().toISOString() };
      writeLocalData(local);
      return local[index];
    }
    return null;
  },

  async excluir(id) {
    const client = await getMongoClient();
    if (client) {
      const db = client.db(process.env.MONGO_DB_NAME || "schulz");
      const collection = db.collection(process.env.MONGO_ORCAMENTOS_COLLECTION || "orcamentos");
      await collection.deleteOne({ $or: [{ id }, { _id: id }] });
    }
    const local = readLocalData();
    const filtered = local.filter(item => item.id !== id);
    writeLocalData(filtered);
    return true;
  }
};
