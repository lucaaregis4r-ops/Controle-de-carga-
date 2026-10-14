# Arquitetura de Agentes · Dashboard Olympico

Este diretório contém a base de conhecimento, convenções operacionais e documentação de domínio para orientar agentes de IA (Antigravity, Codex, Jules, Claude, etc.) trabalhando neste repositório.

---

## 🗺️ Mapa de Diretórios e Papéis

- **`src/client/`**: Código do frontend (Vanilla JS moderno, CSS modular, HTML semântico).
  - `analysis.js`: Motor analítico de cálculo esportivo (Hooper Index, ACWR, EWMA, Z-Score, Linhas de Base Pessoais, Triagem de Atenção). Deve ser agnóstico de ambiente (roda no Node e no Navegador via UMD/CommonJS).
  - `app.js`: Controlador principal da interface, renderização de cards, gráficos (Chart.js), tabelas de presença e fisioterapia.
  - `styles.css`: Design system institucional Olympico (cores institucionais, hierarquia tipográfica, contraste AA).
  - `theme-flat.css`: Tema refinado e semáforos com alto contraste.
  - `index.html`: Shell da aplicação PWA.
- **`src/server/`**: Servidor Node.js nativo (sem frameworks pesados).
  - `index.js`: Ponto de entrada do servidor HTTP e launchers.
  - `routes/api.js`: Roteamento modular de endpoints REST (`/api/athletes`, `/api/physiotherapy`, `/api/attendance`, `/api/export-pdf`, `/api/export-weekly-kit`).
  - `config/data-sources.js`: Configuração das 16 categorias, IDs de planilhas e abas PSR/PSE.
  - `integrations/`: Conectores com o Google Sheets (Wellness e Presença).
  - `domain/`: Regras de negócio de reconciliação de identidade e presença.
- **`scripts/`**: Utilitários de build, empacotamento e exportação.
  - `create-github-pages.js`: Gera o bundle estático em `output/github-pages/`.
  - `verify-github-pages.js`: Valida integridade das fontes estáticas.
- **`tests/`**: Suíte de testes automatizados com Node.js test runner (`node --test`).
- **`output/`**: Artefatos gerados (`github-pages/`, relatórios em PDF, etc.). Ignorado no git principal.

---

## ⚙️ Regras Mandatórias para Agentes

1. **Integridade de Testes:** Sempre execute `npm test` antes e após qualquer modificação. Toda nova métrica ou regra analítica deve possuir testes unitários correspondentes em `tests/`.
2. **Ambiente Híbrido (Server + GitHub Pages):**
   - O dashboard opera tanto como servidor local completo (com geração de PDF via Chromium) quanto como aplicação estática no GitHub Pages.
   - Qualquer dado novo consumido pelo frontend deve ser exportado estaticamente em `scripts/create-github-pages.js` se for necessário no Pages.
3. **Métricas Esportivas:**
   - Nunca invente escalas arbitrárias. Respeite as referências da ciência do esporte (Hooper & Mackinnon, Gabbett, Williams EWMA).
   - O volume de check-ins varia por atleta (média de 7 a 20 check-ins). Cálculos que exigem janelas estritas (como 28 dias rígidos) devem sempre possuir tratamento adaptativo para não quebrar a exibição de atletas com menor histórico.
4. **Design e Acessibilidade:**
   - Respeite as cores institucionais do Olympico Club (Azul Marinho, Vermelho Olympico e Branco).
   - Mantenha conformidade WCAG AA de contraste para números e textos sobre fundos escuros.
   - Preserve a responsividade para smartphones (uso comum da comissão à beira da quadra/piscina).
