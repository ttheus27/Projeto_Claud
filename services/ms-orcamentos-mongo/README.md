# Microserviço 1 — Gestão de Orçamentos (MongoDB)

> Componente da Arquitetura Distribuída do Projeto PJBL — Schulz S/A (SKA Automação).

## Tecnologias
- **Node.js 20 & Express**
- **MongoDB Atlas** (com persistência local resiliente de fallback)
- **Swagger UI** (OpenAPI 3.0)
- **Docker**

## Executar Localmente
```bash
npm install
npm start
```
A API será iniciada na porta `3001`:
- Swagger UI: `http://localhost:3001/api-docs`
- Health Check: `http://localhost:3001/health`
- Listar Orçamentos: `GET http://localhost:3001/api/orcamentos`

## Alunos Integrantes
- Alexandre Filho
- Ana Julia
- Felipe Nathan
- Matheus Silva
