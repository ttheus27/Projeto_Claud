# BFF (Backend for Frontend) — Integrador Schulz S/A

> Componente Central da Arquitetura Distribuída do Projeto PJBL — Schulz S/A (SKA Automação).

## Tecnologias
- **Node.js 20 & Express**
- **Agregação Concorrente assíncrona** (`Promise.allSettled`)
- **Swagger UI** (OpenAPI 3.0)
- **Docker**

## Executar Localmente
```bash
npm install
npm start
```
O BFF será iniciado na porta `8080`:
- Swagger UI: `http://localhost:8080/api-docs`
- Endpoint Mandatório PJBL: `GET http://localhost:8080/api/aggregated-data`
- Health Check: `http://localhost:8080/health`

## Alunos Integrantes
- Alexandre Filho
- Ana Julia
- Felipe Nathan
- Matheus Silva
