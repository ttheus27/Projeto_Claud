const { app } = require('@azure/functions');
app.setup({ enableHttpStream: true });
require('./features/enriquecimento/presentation/enriquecimento.function');
