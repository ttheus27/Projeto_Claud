# Cenários de testes unitários

Os testes automatizados do frontend usam Vitest e seguem a nomenclatura GIVEN/WHEN/THEN definida em `test-specs.md`.

- **DADO um orçamento com matéria-prima e usinagem, QUANDO o preço é calculado, ENTÃO compõe setup, operação, margem e impostos por peça.**
- **DADO uma operação marcada como custo zerado, QUANDO o orçamento é calculado, ENTÃO mantém os tempos da produção sem adicionar seu custo ao preço.**
- **DADO um orçamento novo, QUANDO ele é salvo, ENTÃO é incluído como pendente com datas de criação e atualização.**
- **DADO um orçamento já cadastrado, QUANDO ele é salvo após uma alteração, ENTÃO preserva sua criação e registra uma nova atualização.**
- **DADO um item sem identificação persistida, QUANDO a exclusão é solicitada, ENTÃO informa que ele não pode ser removido.**
- **DADO orçamentos de peças distintas, QUANDO a peça é pesquisada pelo código, ENTÃO exibe somente o orçamento correspondente.**

Execute a suíte uma vez com `npm test`, dentro de `Projeto/`.
