# Dashboard Olympico

Versao estatica do Dashboard Olympico pronta para GitHub Pages.

## Login

- Usuario: `olympico`
- Senha: `olympico80`

## Como publicar no GitHub Pages

1. Crie um repositorio no GitHub.
2. Envie todos os arquivos desta pasta para a raiz do repositorio.
3. No GitHub, abra `Settings` > `Pages`.
4. Em `Build and deployment`, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Salve e aguarde o GitHub gerar o link da pagina.

## Arquivos principais

- `index.html`: estrutura da pagina e tela de login.
- `styles.css`: estilos do dashboard.
- `app.js`: logica do dashboard e leitura da planilha publica.
- `manifest.webmanifest`: metadados do app.
- `Olímpico_Clube_escudo.png`: escudo usado na interface.

## Regra de atletas ativos

Atletas sem check-in nos ultimos 30 dias, contando da data mais recente da planilha principal, nao entram nas medias, listas e alertas. Se voltarem a responder, aparecem automaticamente de novo.

## Observacao

Esta versao foi preparada para hospedagem estatica. Ela nao usa `node_modules`, servidor Node, executaveis ou scripts Windows.

A exportacao detalhada de PDF que dependia do servidor local nao roda no GitHub Pages. Para salvar uma visualizacao em PDF, use a impressao do navegador.
