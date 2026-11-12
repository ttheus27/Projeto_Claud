import { ObjectId } from "mongodb";
import { getCollection } from "./mongo.client.js";

function filter(id) {
  return ObjectId.isValid(id) ? { $or: [{ id }, { _id: new ObjectId(id) }] } : { id };
}
function present(doc) {
  return doc ? { ...doc, _id: doc._id.toString(), id: doc.id || doc._id.toString() } : null;
}
export const orcamentoRepository = {
  async listar() {
    return (await (await getCollection()).find({}).sort({ atualizadoEm: -1, criadoEm: -1 }).toArray()).map(present);
  },
  async buscarPorId(id) { return present(await (await getCollection()).findOne(filter(id))); },
  async criar(orcamento) {
    const collection = await getCollection();
    const result = await collection.insertOne({ ...orcamento });
    return present(await collection.findOne({ _id: result.insertedId }));
  },
  async atualizar(id, orcamento) {
    const { _id, criadoEm, ...changes } = orcamento;
    return present(await (await getCollection()).findOneAndUpdate(filter(id),
      { $set: { ...changes, atualizadoEm: new Date().toISOString() } }, { returnDocument: "after" }));
  },
  async excluir(id) { return (await (await getCollection()).deleteOne(filter(id))).deletedCount > 0; },
};
