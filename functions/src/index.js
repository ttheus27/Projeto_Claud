const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

require('./features/orcamentos/create/create-orcamento.function');
require('./features/orcamentos/list/list-orcamentos.function');
require('./features/orcamentos/update/update-orcamento.function');
require('./features/orcamentos/delete/delete-orcamento.function');
