# Dashboard Olympico · Controle de Carga e Monitoramento

Plataforma unificada para monitoramento esportivo do Olympico Club. Centraliza o acompanhamento e conciliação de check-ins diários de atletas (bem-estar, fadiga, recuperação), presença na preparação física e registros clínicos interdepartamentais de fisioterapia e psicologia.

---

## 🚀 Ambiente e Execução

Projetado para operar em ambiente Linux e multiplataforma.
**Requisito Mínimo:** Node.js 18+ (Recomendado: Node.js 22+).

### Iniciar Servidor Local:
```bash
./ABRIR-DASHBOARD.sh
```
> *Alternativa:* `npm start` inicia o servidor silenciosamente (sem abrir automaticamente o navegador).

Para geração de relatórios em PDF com fidelidade de impressão, o Chromium/Google Chrome é utilizado em modo headless. Dispositivos na mesma rede Wi-Fi podem acessar o painel pelo IP exibido no terminal e instalar como PWA.

---

## 🛠️ Scripts e Utilitários

- `./GERAR-KIT-RELATORIOS.sh` — Renderiza e compila os relatórios das 16 categorias em `output/reports/`.
- `./PREPARAR-ENVIO-RELATORIOS.sh <pasta>` — Organiza arquivos e controle de envio para as comissões.
- `./CONFIGURAR-GOOGLE-DRIVE.sh <credencial.json>` — Configura autorização OAuth com o Google Drive.
- `./GERAR-KIT-E-ENVIAR-DRIVE.sh` — Pipeline unificado que gera os kits e sincroniza com pasta privada do Drive.
- `./COMPILAR-EXECUTAVEL.sh` — Empacota a aplicação autônoma para distribuição em `dist-linux/`.

---

## 📊 Arquitetura Científica e Metodologia

O painel integra métricas consagradas da ciência do esporte de alto rendimento:

1. **Questionário de Bem-Estar (PSR/PSE):** Coleta autorrelatos de Fadiga, Sono, Dores Musculares, Estresse, Humor e Dor Específica (0–10).
2. **Índice Hooper (Hooper & Mackinnon, 1995):** Soma padronizada dos 4 pilares psicofisiológicos (Fadiga + Sono + Dor Muscular + Estresse), variando de 4 a 20 (ou média 1 a 5).
3. **Razão Aguda:Crônica (ACWR) & EWMA (Williams et al., 2017):**
   - Modela a relação entre a carga/desgaste recente (janela aguda ~7 dias) e a tolerância crônica (~28 dias).
   - Classificação em zonas de risco: **Destreinamento** (< 0.80), **Faixa Ideal / Sweet Spot** (0.80–1.30), **Atenção Moderada** (1.31–1.49) e **Zona de Sobrecarga/Risco** (≥ 1.50).
   - Janelas adaptativas para categorias de base (requer mínimo de 5 check-ins).
4. **Z-Score Individual:** Compara o estado atual do atleta com sua própria distribuição histórica, identificando elevações abruptas ($Z \ge +1.8\sigma$).
5. **Quadro de Atenção Clínica:** Heurística multicritério que prioriza atletas com dores agudas ($\ge 6/10$), queda severa de recuperação, desvios no Z-score ou picos de ACWR.

---

## 🌐 Publicação no GitHub Pages

O projeto publica uma edição estática otimizada para o GitHub Pages:
- **Pipeline:** Gerenciado via GitHub Actions em `.github/workflows/deploy-pages.yml`.
- **Geração local:** `npm run build:pages` compila a versão estática e os dados sincronizados em `output/github-pages/`.
- **Auditoria de integridade:** `npm run verify:pages` valida todos os arquivos, dados e integridade das fontes obrigatórias.

---

## 🤖 Suporte e Convenções para Agentes de IA

Para orientar a atuação de assistentes e agentes autônomos no repositório, consulte a pasta [`agents/`](agents/):
- [`agents/README.md`](agents/README.md) — Arquitetura de código, papéis e regras mandatórias.
- [`agents/domain-knowledge.md`](agents/domain-knowledge.md) — Fórmulas matemáticas e convenções esportivas.
- [`agents/tasks.md`](agents/tasks.md) — Roteiros padronizados de teste, validação e deploy.

---

## ✅ Validação e Testes Automatizados

```bash
# Executa a suíte de testes unitários (64 testes)
npm test

# Valida conexão e formatação das planilhas Google Sheets
npm run sources:validate
```
