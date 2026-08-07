# Dashboard Olympico

Projeto reiniciado do zero com foco inicial na pagina de atletas.

## Documentacao do projeto

- `docs/CONTEXTO.md`: contexto vivo, arquitetura atual, fontes de dados e decisoes vigentes.
- `docs/PLANO-IMPLEMENTACAO.md`: plano faseado, status, criterios de aceite e estrutura de pastas-alvo.
- `docs/VALIDACAO-FINAL.md`: checklist final, resultados dos testes e limites da validacao.
- `docs/PUBLICACAO-GITHUB-PAGES.md`: build estatico, sincronizacao e publicacao no GitHub Pages.

Antes de alterar o codigo, consulte os dois arquivos. Ao concluir cada etapa, atualize o status do plano e a secao `Estado atual` do contexto.

## Estrutura principal

- `src/client/`: interface, estilos e arquivos PWA.
- `src/server/`: servidor, regras de negocio, integracoes e relatorios.
- `assets/`: identidade visual compartilhada.
- `data/reference/`: cadastros consolidados usados pelos scripts.
- `data/templates/`: modelos de fisioterapia e psicologia.
- `docs/`: contexto, plano e guias operacionais.
- `scripts/`: automacoes de exportacao, relatorios e distribuicao.
- `output/reports/`: relatorios gerados; nao e codigo-fonte.
- `output/releases/`: pacotes preparados para entrega.
- `dist/`: build portatil recriavel.
- `output/github-pages/`: edicao estatica pronta para publicacao, sem PDF.


```
