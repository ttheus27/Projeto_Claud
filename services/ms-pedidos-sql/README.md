# Microserviço 2 — Gestão de Pedidos (Azure SQL / Relacional)

> Componente da Arquitetura Distribuída do Projeto PJBL — Schulz S/A (SKA Automação).

## Tecnologias
- **Node.js 20 & Express**
- **Motor SQL Relacional** (`TB_PEDIDOS`) com auto-migração de schema
- **Swagger UI** (OpenAPI 3.0)
- **Docker**

## Executar Localmente
```bash
npm install
npm start
```
A API será iniciada na porta `3002`:
- Swagger UI: `http://localhost:3002/api-docs`
- Health Check: `http://localhost:3002/health`
- Listar Pedidos: `GET http://localhost:3002/api/pedidos`

## Alunos Integrantes
- Alexandre Filho
- Ana Julia
- Felipe Nathan
- Matheus Silva
