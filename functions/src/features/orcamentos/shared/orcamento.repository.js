const { ObjectId } = require('mongodb');
const { getCollection } = require('../../../shared/infra/mongodb/client');

function buildIdFilter(id) {
    if (ObjectId.isValid(id)) {
        return { _id: new ObjectId(id) };
    }
    return { id };
}

async function createOrcamento(orcamento) {
    const collection = await getCollection();
    const result = await collection.insertOne(orcamento);
    return collection.findOne({ _id: result.insertedId });
}

async function listOrcamentos() {
    const collection = await getCollection();
    return collection
        .find({})
        .sort({ atualizadoEm: -1, criadoEm: -1 })
        .toArray();
}

async function updateOrcamento(id, payload) {
    const collection = await getCollection();
    return collection.findOneAndUpdate(
        buildIdFilter(id),
        { $set: payload },
        { returnDocument: 'after' }
    );
}

async function deleteOrcamento(id) {
    const collection = await getCollection();
    return collection.deleteOne(buildIdFilter(id));
}

module.exports = {
    createOrcamento,
    deleteOrcamento,
    listOrcamentos,
    updateOrcamento
};
