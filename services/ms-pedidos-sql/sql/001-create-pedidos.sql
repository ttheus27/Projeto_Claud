IF OBJECT_ID(N'dbo.TB_PEDIDOS', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.TB_PEDIDOS (
        id_pedido NVARCHAR(64) NOT NULL CONSTRAINT PK_TB_PEDIDOS PRIMARY KEY,
        codigo_orcamento NVARCHAR(64) NOT NULL,
        cliente NVARCHAR(150) NOT NULL,
        descricao_peca NVARCHAR(300) NOT NULL,
        lote_producao INT NOT NULL CONSTRAINT CK_PEDIDOS_LOTE CHECK (lote_producao > 0),
        valor_total DECIMAL(18, 2) NOT NULL CONSTRAINT CK_PEDIDOS_VALOR CHECK (valor_total >= 0),
        status_producao NVARCHAR(32) NOT NULL CONSTRAINT CK_PEDIDOS_STATUS CHECK
          (status_producao IN (N'Em Planejamento', N'Em Usinagem CNC', N'Aguardando Expedição', N'Concluído')),
        data_entrega_prevista DATE NOT NULL,
        criado_em DATETIME2(3) NOT NULL CONSTRAINT DF_PEDIDOS_CRIADO DEFAULT SYSUTCDATETIME(),
        atualizado_em DATETIME2(3) NOT NULL CONSTRAINT DF_PEDIDOS_ATUALIZADO DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_PEDIDOS_ORCAMENTO ON dbo.TB_PEDIDOS(codigo_orcamento);
END;
