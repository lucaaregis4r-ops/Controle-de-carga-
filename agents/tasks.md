# Playbook de Tarefas para Agentes · Olympico Club

Roteiros operacionais padronizados para execução de manutenção, deploy e testes.

---

## 1. Como Rodar Testes e Validação Completa

```bash
# Executa a suíte de testes unitários
npm test

# Valida conexão e formatação das planilhas Google Sheets
npm run sources:validate

# Gera e valida a build estática para GitHub Pages
npm run build:pages
npm run verify:pages
```

---

## 2. Como Fazer Deploy no GitHub Pages

O GitHub Pages do projeto é alimentado pelo repositório `lucaaregis4r-ops/Controle-de-carga-` (remoto `upstream-carga`) via GitHub Actions no branch `main`.

Passos para deploy:
1. Validar que todos os testes passam: `npm test`
2. Testar build local: `npm run build:pages && npm run verify:pages`
3. Commitar as mudanças com mensagens semânticas (ex: `feat:`, `fix:`, `refactor:`)
4. Enviar para o remoto:
   ```bash
   git push upstream-carga main
   ```
   *(E sincronizar com `git push origin main` se aplicável).*

---

## 3. Estrutura das Rotas da API Local (`src/server/routes/api.js`)

Ao adicionar ou modificar endpoints HTTP, utilize o roteador modular:
- `GET /api/athletes`: Lista consolidada de atletas, histórico e últimas respostas.
- `GET /api/physiotherapy`: Registros clínicos de tratamento, veto e observações da fisioterapia.
- `GET /api/attendance`: Presença da preparação física e conciliações de nomes.
- `POST /api/export-pdf`: Geração de relatório PDF individual ou de equipe via Chromium headless.
- `POST /api/export-weekly-kit`: Geração em lote do kit semanal das 16 categorias.
