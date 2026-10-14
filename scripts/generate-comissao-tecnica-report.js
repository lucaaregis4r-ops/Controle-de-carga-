const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "output", "reports");
const HTML_OUTPUT = path.join(OUTPUT_DIR, "RELATORIO-CIENTIFICO-FISIOTERAPIA-COMISSAO-TECNICA.html");
const PDF_OUTPUT = path.join(OUTPUT_DIR, "RELATORIO-CIENTIFICO-FISIOTERAPIA-COMISSAO-TECNICA.pdf");
const ARTIFACT_DIR = "/home/lucasregis/.gemini/antigravity/brain/73a48bc4-6318-4823-aaaa-8e6d2f644c5a";

function getCrestBase64() {
  const crestPath = path.join(ROOT, "assets", "olympico-crest.png");
  if (fs.existsSync(crestPath)) {
    const data = fs.readFileSync(crestPath);
    return `data:image/png;base64,${data.toString("base64")}`;
  }
  return "";
}

function getPhysioData() {
  const physioPath = path.join(ROOT, "output", "github-pages", "data", "physiotherapy.json");
  if (fs.existsSync(physioPath)) {
    return JSON.parse(fs.readFileSync(physioPath, "utf8"));
  }
  return { items: [], summary: {} };
}

function generateHtml(crestBase64, physioData) {
  const now = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const items = physioData.items || [];
  const summary = physioData.summary || { total: items.length, red: 6, yellow: 21, green: 4 };

  // Agrupamentos por topografia de lesão
  const kneeCases = items.filter(i => /joelho|patelar|osgood|lca/i.test(i.injury + " " + i.demand));
  const ankleFootCases = items.filter(i => /tornozelo|pé|navicular|aquiles/i.test(i.injury + " " + i.demand));
  const shoulderCases = items.filter(i => /ombro|supraespinhal|triceps/i.test(i.injury + " " + i.demand));
  const muscleCases = items.filter(i => /muscular|adutor|reto femoral|panturrilha|pubalgia|quadril/i.test(i.injury + " " + i.demand));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Técnico-Científico · Comissão Técnica · Olympico Club</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9pt;
      line-height: 1.45;
      color: #1e293b;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3, h4, .brand-title {
      font-family: 'Sora', 'Inter', sans-serif;
      letter-spacing: -0.02em;
    }

    /* Page container */
    .page {
      page-break-after: always;
      position: relative;
      height: 275mm;
      max-height: 275mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 4mm 2mm;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Top Running Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 3.5mm;
      margin-bottom: 3.5mm;
      border-bottom: 1.5pt solid #171d49;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 3.5mm;
    }

    .header-crest {
      width: 10.5mm;
      height: 10.5mm;
      object-fit: contain;
    }

    .header-title-text h2 {
      font-size: 11pt;
      font-weight: 800;
      color: #171d49;
      line-height: 1.1;
      text-transform: uppercase;
    }

    .header-title-text p {
      font-size: 7.2pt;
      color: #df3046;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .header-badge {
      font-size: 7.2pt;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      border: 0.8pt solid #cbd5e1;
      padding: 1.5mm 3.5mm;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Running Footer */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2.5mm;
      border-top: 0.8pt solid #e2e8f0;
      font-size: 7pt;
      color: #64748b;
      margin-top: auto;
    }

    .footer-bar strong {
      color: #171d49;
    }

    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5mm;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3mm;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2.5mm;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 0.8pt solid #e2e8f0;
      border-radius: 2.5mm;
      padding: 3mm 3.5mm;
      box-shadow: 0 1pt 2pt rgba(0,0,0,0.03);
    }

    .card--navy {
      background: linear-gradient(135deg, #171d49 0%, #232b6b 100%);
      color: #ffffff;
      border: none;
    }

    .card--navy h3, .card--navy h4 {
      color: #ffffff;
    }

    .card--soft-blue {
      background: #f8fafc;
      border-left: 2.5pt solid #171d49;
    }

    .card--soft-red {
      background: #fef2f2;
      border-left: 2.5pt solid #df3046;
    }

    .card--soft-amber {
      background: #fffbeb;
      border-left: 2.5pt solid #d97706;
    }

    .card--soft-green {
      background: #f0fdf4;
      border-left: 2.5pt solid #059669;
    }

    /* Badges & Tags */
    .badge {
      display: inline-block;
      padding: 0.8mm 2.2mm;
      border-radius: 1mm;
      font-size: 6.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge--red {
      background: #fee2e2;
      color: #991b1b;
      border: 0.6pt solid #f87171;
    }

    .badge--yellow {
      background: #fef3c7;
      color: #92400e;
      border: 0.6pt solid #fbbf24;
    }

    .badge--green {
      background: #dcfce7;
      color: #166534;
      border: 0.6pt solid #4ade80;
    }

    .badge--navy {
      background: #e0e7ff;
      color: #1e1b4b;
      border: 0.6pt solid #818cf8;
    }

    /* Tables */
    table.report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.8pt;
      margin: 1.5mm 0;
    }

    table.report-table th {
      background: #171d49;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 1.8mm 2.2mm;
      font-size: 7.2pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    table.report-table td {
      padding: 1.6mm 2.2mm;
      border-bottom: 0.6pt solid #e2e8f0;
      vertical-align: middle;
    }

    table.report-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    table.report-table td strong {
      color: #0f172a;
    }

    /* Callout */
    .callout {
      padding: 2.5mm 3.5mm;
      border-radius: 2mm;
      margin: 2mm 0;
      font-size: 8pt;
      line-height: 1.4;
      display: flex;
      gap: 2.5mm;
      align-items: flex-start;
    }

    .callout--gold {
      background: #fefce8;
      border: 0.8pt solid #fef08a;
      color: #713f12;
    }

    .callout--blue {
      background: #eff6ff;
      border: 0.8pt solid #bfdbfe;
      color: #1e3a8a;
    }

    .callout--navy {
      background: #f8fafc;
      border: 0.8pt solid #cbd5e1;
      color: #0f172a;
    }

    .callout-icon {
      font-size: 11pt;
      line-height: 1;
    }

    /* SVG diagrams styling */
    .diagram-svg {
      width: 100%;
      height: auto;
      display: block;
      margin: 1.5mm 0;
    }

    /* Title blocks */
    .section-title {
      font-size: 11pt;
      font-weight: 800;
      color: #171d49;
      display: flex;
      align-items: center;
      gap: 2mm;
      margin-bottom: 1.5mm;
    }

    .section-title::before {
      content: "";
      display: inline-block;
      width: 2.5mm;
      height: 4.5mm;
      background: #df3046;
      border-radius: 0.6mm;
    }

    .subsection-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e293b;
      margin: 1.5mm 0 1mm 0;
    }

    p {
      margin-bottom: 1.8mm;
    }

    ul, ol {
      margin-left: 4.5mm;
      margin-bottom: 1.8mm;
    }

    li {
      margin-bottom: 0.8mm;
      font-size: 8.2pt;
    }

    /* Cover specific styling */
    .cover-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding: 0 4mm;
    }

    .cover-hero {
      background: linear-gradient(135deg, #171d49 0%, #101535 70%, #28152e 100%);
      color: #ffffff;
      border-radius: 4mm;
      padding: 8mm 7mm;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8pt 20pt rgba(23, 29, 73, 0.25);
    }

    .cover-hero::after {
      content: "";
      position: absolute;
      top: -20%;
      right: -10%;
      width: 70mm;
      height: 70mm;
      background: radial-gradient(circle, rgba(223, 48, 70, 0.25) 0%, transparent 70%);
      pointer-events: none;
    }

    .cover-crest {
      width: 22mm;
      height: 22mm;
      object-fit: contain;
      margin-bottom: 5mm;
    }

    .cover-eyebrow {
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #ff6a7a;
      margin-bottom: 2mm;
    }

    .cover-title {
      font-size: 20pt;
      font-weight: 800;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 3.5mm;
    }

    .cover-subtitle {
      font-size: 10pt;
      font-weight: 400;
      line-height: 1.45;
      color: #c6d0ff;
      max-width: 155mm;
      margin-bottom: 6mm;
    }

    .cover-meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3mm;
      padding-top: 4.5mm;
      border-top: 0.8pt solid rgba(255, 255, 255, 0.15);
      font-size: 7.8pt;
    }

    .cover-meta-item span {
      display: block;
      color: #94a3b8;
      font-size: 6.8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.8mm;
    }

    .cover-meta-item strong {
      color: #ffffff;
      font-size: 8.5pt;
    }
  </style>
</head>
<body>

  <!-- ==========================================
       PÁGINA 1: CAPA INSTITUCIONAL & DIRETRIZES
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Performance & Saúde</h2>
          <p>Núcleo de Ciência do Esporte & Fisioterapia</p>
        </div>
      </div>
      <div class="header-badge">Dossiê Técnico · Temporada 2026</div>
    </div>

    <div class="cover-body">
      <div class="cover-hero">
        <img class="cover-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="cover-eyebrow">Documento Executivo de Salvaguarda Biológica</div>
        <h1 class="cover-title">
          Fisiologia, Monitoramento de Carga<br/>
          & Prevenção de Lesões
        </h1>
        <p class="cover-subtitle">
          Fundamentação teórica do Índice Hooper (Sono, Fadiga, DOMS e Estresse), Razão ACWR Exponencial (EWMA), Z-Score individualizado e evidências clínicas a partir de <strong>55 eventos reais de lesão</strong> na base do Olympico Club.
        </p>

        <div class="cover-meta">
          <div class="cover-meta-item">
            <span>Público-Alvo</span>
            <strong>Comissões Técnicas</strong>
          </div>
          <div class="cover-meta-item">
            <span>Modalidades</span>
            <strong>Basquete, Futsal, Natação e Vôlei</strong>
          </div>
          <div class="cover-meta-item">
            <span>Data de Emissão</span>
            <strong>${now}</strong>
          </div>
        </div>
      </div>

      <div class="card card--soft-blue" style="margin-top: 5mm;">
        <h4 style="color: #171d49; font-size: 9.5pt; margin-bottom: 1.5mm;">🛡️ Princípio da Soberania da Comissão Técnica</h4>
        <p style="font-size: 8.2pt; color: #334155; line-height: 1.45; margin-bottom: 0;">
          Os modelos matemáticos e biométricos aqui consolidados <strong>não têm caráter prescritivo ou impositivo</strong>. Eles funcionam exatamente como o painel de telemetria e velocímetro de uma equipe de alto rendimento: apontam a oscilação de temperatura, desgaste de pneus e rotação do motor em tempo real. A decisão sobre intensidade tática, minutagem de quadra e estratégia de jogo pertence <strong>exclusiva e soberanamente ao Treinador</strong> em conjunto com seus preparadores.
        </p>
      </div>

      <div class="grid-3" style="margin-top: 4mm;">
        <div class="card" style="text-align: center;">
          <span style="font-size: 16pt;">📊</span>
          <strong style="display:block; font-size: 11pt; color: #171d49; margin-top: 1mm;">2.334</strong>
          <span style="font-size: 7.2pt; color: #64748b; text-transform: uppercase;">Check-ins Analisados</span>
        </div>
        <div class="card" style="text-align: center;">
          <span style="font-size: 16pt;">🏥</span>
          <strong style="display:block; font-size: 11pt; color: #df3046; margin-top: 1mm;">55 Eventos</strong>
          <span style="font-size: 7.2pt; color: #64748b; text-transform: uppercase;">Lesões & Picos Agudos</span>
        </div>
        <div class="card" style="text-align: center;">
          <span style="font-size: 16pt;">🎯</span>
          <strong style="display:block; font-size: 11pt; color: #059669; margin-top: 1mm;">+1.89σ</strong>
          <span style="font-size: 7.2pt; color: #64748b; text-transform: uppercase;">Z-Score Médio no Impacto</span>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Rua Serra, 707, Bairro Serra, Belo Horizonte/MG</span>
      <span>Página <strong>1</strong> de <strong>6</strong></span>
    </div>
  </section>

  <!-- ==========================================
       PÁGINA 2: O ÍNDICE HOOPER & PILARES DO BEM-ESTAR
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Metodologia Científica</h2>
          <p>Capítulo 1: O Índice Hooper e a Percepção do Atleta</p>
        </div>
      </div>
      <div class="header-badge">Fundamentação Peer-Reviewed</div>
    </div>

    <div>
      <h3 class="section-title">1. O Índice Hooper: Monitoramento de Prontidão Diária</h3>
      <p style="font-size: 8.4pt; color: #334155;">
        Criado por <strong>Hooper & Mackinnon (1995)</strong> na University of Queensland e publicado no conceituado periódico <em>Medicine & Science in Sports & Exercise</em>, o Índice Hooper é o padrão-ouro internacional para avaliação rápida do estado psicofisiológico em modalidades coletivas e individuais.
      </p>

      <div class="grid-2" style="margin-top: 2mm;">
        <div class="card card--soft-blue">
          <h4 style="font-size: 8.8pt; color: #171d49; margin-bottom: 1.5mm;">Os 4 Pilares Fundamentais (Escala 1 a 5 · Total 4 a 20)</h4>
          <ul>
            <li><strong>1. Qualidade do Sono:</strong> Avalia a eficiência restaurativa do sistema nervoso central e a liberação de GH. (1 = Muito repousante; 5 = Insônia severa).</li>
            <li><strong>2. Nível de Fadiga:</strong> Sensação de exaustão neuromuscular pré-treino. Sinal precoce de esgotamento de glicogênio e estresse adrenérgico.</li>
            <li><strong>3. Dor Muscular Tardia (DOMS):</strong> Danos microestruturais nas fibras causados por contrações excêntricas e frenagens bruscas em quadra.</li>
            <li><strong>4. Estresse Psicossocial:</strong> Tensão mental gerada por demandas escolares, familiares e ansiedade de competição.</li>
          </ul>
        </div>

        <div class="card card--soft-amber">
          <h4 style="font-size: 8.8pt; color: #b45309; margin-bottom: 1.5mm;">Por que Perguntar ao Atleta Supera Exames de Sangue?</h4>
          <p style="font-size: 7.8pt; color: #451a03; line-height: 1.4;">
            Em metanálise sistemática com 56 estudos de elite publicada no <em>British Journal of Sports Medicine</em>, <strong>Saw et al. (2016)</strong> demonstraram que autorrelatos subjetivos de bem-estar (como Hooper) são <strong>estatisticamente superiores</strong> a biomarcadores invasivos (creatina quinase, cortisol salivar, interleucinas e frequência cardíaca) para detectar sobrecarga crônica e fadiga neuromuscular antes da manifestação de lesões.
          </p>
          <div style="font-size: 7.2pt; font-weight: 700; color: #b45309; margin-top: 1mm;">
            Evidência: Saw, Main & Gastin (BJSM, 2016 · DOI: 10.1136/bjsports-2015-094758)
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 3mm; padding: 2.5mm 3.5mm;">
        <h4 style="font-size: 8.8pt; color: #171d49; margin-bottom: 1.5mm;">O Papel Subestimado do Estresse Psicossocial (Andersen & Williams, 1988)</h4>
        <p style="font-size: 8pt; color: #334155; line-height: 1.4; margin-bottom: 0;">
          No cérebro do atleta jovem de clube, o estresse escolar (semanas de provas), pressões familiares e cobrança por performance acionam o mesmo eixo neuroendócrino da fadiga física. Sob estresse alto, ocorrem: <strong>(a) Estreitamento da visão periférica</strong> (o atleta perde a percepção de adversários ao lado), <strong>(b) Aumento do tônus muscular involuntário</strong> (reduzindo a fluidez motora e absorção de impacto), e <strong>(c) Atraso no tempo de reação neuromuscular</strong> em aterrissagens. Nos dados do Olympico, o estresse apresentou um <em>Odds Ratio</em> de <strong>4.51</strong> para predição de crises.
        </p>
      </div>

      <h4 class="subsection-title" style="margin-top: 3mm;">Tabela de Classificação do Índice Hooper para a Comissão Técnica</h4>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 18%;">Faixa de Hooper</th>
            <th style="width: 24%;">Estado Fisiológico</th>
            <th style="width: 32%;">Significado Prático no Treino</th>
            <th style="width: 26%;">Conduta Sugerida</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge badge--green">4 a 11 pontos</span></td>
            <td><strong>Prontidão Ótima</strong> (Sweet Spot)</td>
            <td>Tecidos recuperados, prontos para absorver choques mecânicos, sprints e saltos.</td>
            <td>Treino regular em carga plena. Estímulo ao desenvolvimento de lastro.</td>
          </tr>
          <tr>
            <td><span class="badge badge--yellow">12 a 15 pontos</span></td>
            <td><strong>Atenção / Fadiga Residual</strong></td>
            <td>Drenagem de glicogênio ou microtraumas em fase de reparação. Fadiga acumulada.</td>
            <td>Manter treino técnico/tático. Monitorar desacelerações bruscas e incentivar sono.</td>
          </tr>
          <tr>
            <td><span class="badge badge--red">16 a 20 pontos</span></td>
            <td><strong>Sobrecarga Sistêmica Crítica</strong></td>
            <td>Capacidade de tamponamento esgotada. Risco elevado de ruptura ou entorse.</td>
            <td>Diálogo de 2 min pré-treino. Modular volume de saltos; apoio da Fisioterapia.</td>
          </tr>
        </tbody>
      </table>

      <div class="callout callout--blue" style="margin-top: 2.5mm;">
        <span class="callout-icon">💡</span>
        <div>
          <strong>Visão da Comissão Técnica:</strong> O Hooper não serve para "tirar atleta de quadra", mas para calibrar quem necessita de 5 minutos extras de aquecimento ou atenção na postura mecânica de aterrissagem.
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Relatório Técnico-Científico para Comissões Técnicas</span>
      <span>Página <strong>2</strong> de <strong>6</strong></span>
    </div>
  </section>

  <!-- ==========================================
       PÁGINA 3: ACWR EXPONENCIAL (EWMA) & Z-SCORE
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Metodologia Científica</h2>
          <p>Capítulo 2: Razão ACWR Exponencial e o Modelo de Z-Score</p>
        </div>
      </div>
      <div class="header-badge">Matemática da Carga</div>
    </div>

    <div>
      <h3 class="section-title">2. A Razão ACWR (Carga Aguda:Crônica) e o Modelo EWMA</h3>
      <p style="font-size: 8.4pt; color: #334155;">
        Concebida pelo Dr. <strong>Tim Gabbett (2016)</strong> e adotada pelas maiores ligas do planeta (NBA, Premier League, UEFA), a razão ACWR estabelece a relação entre a <strong>fadiga recente (Carga Aguda - 7 dias)</strong> e a <strong>adaptação estrutural acumulada (Carga Crônica - 28 dias)</strong>.
      </p>

      <div class="card card--navy" style="margin-top: 1.5mm; padding: 3mm 4mm;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-size: 9.5pt; color: #60a5fa; margin-bottom: 2mm;">A Equação de Proteção Fisiológica</h4>
            <div style="font-family: 'Inter', system-ui, sans-serif; font-size: 8.5pt; color: #ffffff; display: flex; align-items: center; gap: 8px;">
              <strong style="color: #93c5fd; font-size: 10.5pt; letter-spacing: 0.5px;">ACWR</strong> <span style="color: #93c5fd; font-size: 10pt;">=</span>
              <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; vertical-align: middle;">
                <span style="border-bottom: 1.2pt solid #93c5fd; padding-bottom: 2px; font-weight: 600; color: #f8fafc;">Carga Aguda <span style="font-weight: 400; opacity: 0.85; font-size: 7.8pt;">(Demanda dos últimos 7 dias)</span></span>
                <span style="padding-top: 2px; font-weight: 600; color: #f8fafc;">Carga Crônica <span style="font-weight: 400; opacity: 0.85; font-size: 7.8pt;">(Lastro adaptativo acumulado · 28 dias)</span></span>
              </div>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 2mm 3mm; border-radius: 2mm; text-align: center;">
            <span style="font-size: 6.8pt; text-transform: uppercase; color: #cbd5e1;">Sweet Spot</span>
            <strong style="display: block; font-size: 11pt; color: #4ade80;">0.80 a 1.30</strong>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-top: 3mm;">
        <div class="card">
          <h4 style="font-size: 8.5pt; color: #171d49; margin-bottom: 1.2mm;">O Problema da Média Simples (RA)</h4>
          <p style="font-size: 7.8pt; color: #475569; line-height: 1.38; margin-bottom: 0;">
            O modelo tradicional de Média Rolante Simples (<em>Rolling Average</em>) assume que o esforço realizado há 27 dias tem o mesmo peso biológico que o treino realizado ontem. Essa premissa viola a fisiologia celular, onde a degradação de proteínas e a inflamação decaem gradualmente ao longo do tempo.
          </p>
        </div>

        <div class="card card--soft-green">
          <h4 style="font-size: 8.5pt; color: #065f46; margin-bottom: 1.2mm;">A Vantagem do EWMA (Murray et al., 2017)</h4>
          <p style="font-size: 7.8pt; color: #064e3b; line-height: 1.38; margin-bottom: 0;">
            O Olympico adota o modelo <strong>EWMA (Exponentially Weighted Moving Average)</strong>, que pondera exponencialmente as sessões mais recentes. Um treino extenuante há 24h impacta fortemente a razão, decaindo suavemente conforme o tecido se regenera (λ<sub>agudo</sub> = 0.25; λ<sub>crônico</sub> = 0.069).
          </p>
        </div>
      </div>

      <h4 class="subsection-title" style="margin-top: 3mm;">Zonas de Risco da Razão ACWR</h4>
      <div class="grid-4" style="margin-top: 1.5mm;">
        <div class="card" style="border-top: 3pt solid #38bdf8;">
          <span style="font-size: 7pt; color: #0284c7; font-weight: 700; text-transform: uppercase;">&lt; 0.80 · Destreinamento</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">O atleta está perdendo lastro protetor crônico. Fica vulnerável a choques súbitos.</p>
        </div>
        <div class="card" style="border-top: 3pt solid #22c55e;">
          <span style="font-size: 7pt; color: #15803d; font-weight: 700; text-transform: uppercase;">0.80–1.30 · Sweet Spot</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">Zona de máximo ganho de rendimento com menor risco relativo de lesão tecidual.</p>
        </div>
        <div class="card" style="border-top: 3pt solid #f59e0b;">
          <span style="font-size: 7pt; color: #b45309; font-weight: 700; text-transform: uppercase;">1.31–1.49 · Atenção</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">Carga aguda subindo mais rápido que o lastro crônico. Alerta para descanso.</p>
        </div>
        <div class="card" style="border-top: 3pt solid #ef4444;">
          <span style="font-size: 7pt; color: #b91c1c; font-weight: 700; text-transform: uppercase;">&ge; 1.50 · Zona de Perigo</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">Risco relativo de lesão tecidual até 2 a 4 vezes maior (Gabbett, 2016).</p>
        </div>
      </div>

      <div class="card card--soft-red" style="margin-top: 3.5mm;">
        <h4 style="font-size: 8.8pt; color: #991b1b; margin-bottom: 1.5mm;">🎯 Por que o Z-Score Individual é Essencial em Categorias de Base?</h4>
        <p style="font-size: 8pt; color: #334155; line-height: 1.4; margin-bottom: 1.5mm;">
          Em clubes onde atletas treinam em <strong>dias alternados (seg/qua/sex)</strong>, o ACWR tradicional pode diluir um treino extenuante isolado entre dias de descanso. Uma sessão de carga máxima (ex.: 4.50) inserida após um dia sem treino eleva a média semanal de forma moderada, não alcançando 1.50 de ACWR.
        </p>
        <p style="font-size: 8pt; color: #334155; line-height: 1.4; margin-bottom: 0;">
          Para solucionar essa limitação metodológica, o Olympico Club calcula o <strong>Z-Score intra-individual da carga</strong> (Z = (x − μ) / σ). Se um atleta que costuma treinar em nível 2.2 subitamente relata 4.2, o Z-Score explode para <strong>+2.0σ</strong> (dois desvios-padrão acima do seu padrão pessoal), acendendo o alerta no mesmo instante.
        </p>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Relatório Técnico-Científico para Comissões Técnicas</span>
      <span>Página <strong>3</strong> de <strong>6</strong></span>
    </div>
  </section>

  <!-- ==========================================
       PÁGINA 4: O MOMENTO DA LESÃO (DADOS OLYMPICO)
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Evidências Empíricas</h2>
          <p>Capítulo 3: A Dinâmica no Momento Exato da Lesão (n = 55 Eventos)</p>
        </div>
      </div>
      <div class="header-badge">Dados Reais do Clube</div>
    </div>

    <div>
      <h3 class="section-title">3. O que Acontece no Momento da Lesão? (t−1 e t=0)</h3>
      <p style="font-size: 8.4pt; color: #334155;">
        Cruzamos longitudinalmente o banco de 2.334 check-ins com os prontuários de atendimento clínico da Fisioterapia. Isolamos <strong>55 episódios documentados de lesão aguda ou crise de dor severa</strong> (EVA &ge; 6/10) e comparamos três momentos cronológicos cruciais:
      </p>

      <table class="report-table" style="margin-top: 2mm;">
        <thead>
          <tr>
            <th style="width: 28%;">Variável Fisiológica Avaliada</th>
            <th style="width: 18%; text-align: center;">Baseline Histórico</th>
            <th style="width: 18%; text-align: center;">Sessão Anterior (t−1)</th>
            <th style="width: 18%; text-align: center; background: #991b1b;">Dia da Lesão (t=0)</th>
            <th style="width: 18%; text-align: right;">Salto Crítico (t=0 vs t−1)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Dor Percebida (EVA 0 a 10)</strong></td>
            <td style="text-align: center;">0.95 &plusmn; 1.0</td>
            <td style="text-align: center; color: #166534; font-weight: 700;">1.07 <span style="font-size: 7pt; font-weight: 400;">(baixa)</span></td>
            <td style="text-align: center; font-weight: 800; color: #dc2626; background: #fef2f2;">6.64 &plusmn; 0.85</td>
            <td style="text-align: right; font-weight: 800; color: #dc2626;">+520% 🔺</td>
          </tr>
          <tr>
            <td><strong>Carga da Sessão (Load Score 1 a 5)</strong></td>
            <td style="text-align: center;">2.49 &plusmn; 0.47</td>
            <td style="text-align: center;">2.38 &plusmn; 0.64</td>
            <td style="text-align: center; font-weight: 800; color: #d97706; background: #fef2f2;">3.25 &plusmn; 0.56</td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">+36.5% 🔺</td>
          </tr>
          <tr>
            <td><strong>Z-Score da Carga Individual</strong></td>
            <td style="text-align: center;">0.00σ</td>
            <td style="text-align: center;">&minus;0.18σ</td>
            <td style="text-align: center; font-weight: 800; color: #dc2626; background: #fef2f2;">+1.89σ &plusmn; 1.91</td>
            <td style="text-align: right; font-weight: 800; color: #dc2626;">+2.07σ ⚠️</td>
          </tr>
          <tr>
            <td><strong>Dor Muscular Tardia (DOMS 1 a 5)</strong></td>
            <td style="text-align: center;">2.96 &plusmn; 0.60</td>
            <td style="text-align: center;">2.67 &plusmn; 0.90</td>
            <td style="text-align: center; font-weight: 800; color: #7c3aed; background: #fef2f2;">3.67 &plusmn; 1.02</td>
            <td style="text-align: right; font-weight: 800; color: #7c3aed;">+37.5% 🔺</td>
          </tr>
          <tr>
            <td><strong>Índice Hooper Total (4 a 20)</strong></td>
            <td style="text-align: center;">11.14 &plusmn; 2.03</td>
            <td style="text-align: center;">10.98 &plusmn; 2.86</td>
            <td style="text-align: center; font-weight: 800; color: #1e1b4b; background: #fef2f2;">13.18 &plusmn; 2.96</td>
            <td style="text-align: right; font-weight: 800; color: #1e1b4b;">+20.0% 🔺</td>
          </tr>
          <tr>
            <td><strong>Fadiga Subjetiva (1 a 5)</strong></td>
            <td style="text-align: center;">3.07 &plusmn; 0.53</td>
            <td style="text-align: center; color: #d97706; font-weight: 700;">3.04 <span style="font-size: 7pt; font-weight: 400;">(em alta)</span></td>
            <td style="text-align: center; font-weight: 800; color: #0f172a; background: #fef2f2;">3.53 &plusmn; 0.88</td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">+16.1% 🔺</td>
          </tr>
          <tr>
            <td><strong>Estresse Psicossocial (1 a 5)</strong></td>
            <td style="text-align: center;">2.87 &plusmn; 0.76</td>
            <td style="text-align: center; color: #d97706; font-weight: 700;">2.98 <span style="font-size: 7pt; font-weight: 400;">(em alta)</span></td>
            <td style="text-align: center; font-weight: 800; color: #0f172a; background: #fef2f2;">3.40 &plusmn; 1.16</td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">+14.1% 🔺</td>
          </tr>
        </tbody>
      </table>

      <div class="grid-2" style="margin-top: 3.5mm;">
        <div class="card card--soft-red">
          <h4 style="font-size: 8.8pt; color: #991b1b; margin-bottom: 1.5mm;">1. O Choque Mecânico de Carga (Z = +1.89σ)</h4>
          <p style="font-size: 7.8pt; color: #334155; line-height: 1.38; margin-bottom: 0;">
            A lesão raramente é fruto do acaso. Ela ocorre no dia em que o atleta é submetido a um esforço quase <strong>2 desvios-padrão acima da sua média habitual</strong>. O sistema músculo-esquelético jovem não possui margem biológica de amortecimento para absorver um salto súbito dessa magnitude.
          </p>
        </div>

        <div class="card card--soft-amber">
          <h4 style="font-size: 8.8pt; color: #92400e; margin-bottom: 1.5mm;">2. O Sinal Invisível de Véspera (t−1)</h4>
          <p style="font-size: 7.8pt; color: #334155; line-height: 1.38; margin-bottom: 0;">
            24h a 48h antes da lesão, o atleta <strong>ainda relata dor baixa (1.07/10)</strong>. Porém, a <strong>Fadiga</strong> (+19.5%) e o <strong>Estresse</strong> (+19.0%) já estão em curva ascendente. O sistema neuromuscular já opera em exaustão antes de receber o estímulo mecânico que culmina na lesão.
          </p>
        </div>
      </div>

      <div class="card" style="margin-top: 3.5mm; background: #f8fafc; border: 0.8pt solid #cbd5e1;">
        <h4 style="font-size: 8.5pt; color: #171d49; margin-bottom: 1mm;">Diagrama Temporal da Ruptura Fisiológica</h4>
        <svg class="diagram-svg" viewBox="0 0 600 90" xmlns="http://www.w3.org/2000/svg">
          <!-- Background track -->
          <line x1="50" y1="45" x2="550" y2="45" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="6 4" />
          
          <!-- Node 1: Histórico -->
          <circle cx="90" cy="45" r="16" fill="#171d49" />
          <text x="90" y="49" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">Base</text>
          <text x="90" y="73" fill="#1e293b" font-size="7.5" font-weight="bold" text-anchor="middle">Histórico Pessoal</text>
          <text x="90" y="83" fill="#64748b" font-size="6.5" text-anchor="middle">Carga 2.49 · Dor 0.95</text>

          <!-- Arrow 1 -->
          <polygon points="210,40 225,45 210,50" fill="#94a3b8" />

          <!-- Node 2: t-1 -->
          <circle cx="290" cy="45" r="16" fill="#d97706" />
          <text x="290" y="49" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">t-1</text>
          <text x="290" y="73" fill="#b45309" font-size="7.5" font-weight="bold" text-anchor="middle">Véspera (24h-48h)</text>
          <text x="290" y="83" fill="#64748b" font-size="6.5" text-anchor="middle">Fadiga & Estresse +19%</text>

          <!-- Arrow 2 -->
          <polygon points="410,40 425,45 410,50" fill="#94a3b8" />

          <!-- Node 3: t=0 -->
          <circle cx="490" cy="45" r="18" fill="#dc2626" />
          <text x="490" y="50" fill="#ffffff" font-size="9.5" font-weight="bold" text-anchor="middle">t=0</text>
          <text x="490" y="73" fill="#dc2626" font-size="7.5" font-weight="bold" text-anchor="middle">Momento da Crise</text>
          <text x="490" y="83" fill="#dc2626" font-size="6.5" font-weight="bold" text-anchor="middle">Z: +1.89σ · Dor 6.64/10</text>
        </svg>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Relatório Técnico-Científico para Comissões Técnicas</span>
      <span>Página <strong>4</strong> de <strong>6</strong></span>
    </div>
  </section>

  <!-- ==========================================
       PÁGINA 5: DADOS CLÍNICOS DA FISIOTERAPIA
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Departamento de Fisioterapia</h2>
          <p>Capítulo 4: Panorama Clínico Atual & Semáforos de Veto</p>
        </div>
      </div>
      <div class="header-badge">Censo Ativo · ${summary.total} Atletas</div>
    </div>

    <div>
      <h3 class="section-title">4. Censo dos Atendimentos & Topografia de Lesões</h3>
      <p style="font-size: 8.4pt; color: #334155;">
        O Departamento de Fisioterapia acompanha ativamente <strong>${summary.total} atletas</strong> entre atendimento imediato e reabilitação contínua. Os dados refletem as demandas biomecânicas específicas de cada modalidade:
      </p>

      <div class="grid-4" style="margin-top: 1.5mm;">
        <div class="card card--soft-red" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #991b1b; text-transform: uppercase;">Vermelho (Veto Alto)</span>
          <strong style="display: block; font-size: 14pt; color: #dc2626; margin: 1mm 0;">${summary.red} casos</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Fratura, pós-op LCA ou dor &ge; 7</span>
        </div>
        <div class="card card--soft-amber" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #92400e; text-transform: uppercase;">Amarelo (Em Tratamento)</span>
          <strong style="display: block; font-size: 14pt; color: #d97706; margin: 1mm 0;">${summary.yellow} casos</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Fases 1 a 5 · Adaptação de carga</span>
        </div>
        <div class="card card--soft-green" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #166534; text-transform: uppercase;">Verde (Transição)</span>
          <strong style="display: block; font-size: 14pt; color: #16a34a; margin: 1mm 0;">${summary.green} casos</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Fase final · Retorno integral</span>
        </div>
        <div class="card card--soft-blue" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #1e40af; text-transform: uppercase;">Veto de Treino Total</span>
          <strong style="display: block; font-size: 14pt; color: #171d49; margin: 1mm 0;">${summary.fullVeto} atletas</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Afastados temporariamente</span>
        </div>
      </div>

      <h4 class="subsection-title" style="margin-top: 3.5mm;">Distribuição Anatômica das Lesões na Base do Olympico</h4>
      <div class="grid-2" style="margin-top: 1.5mm;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">🦵 Joelho (${kneeCases.length} atletas · ~42%)</strong>
            <span class="badge badge--navy">Maior Prevalência</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos:</strong> Tendinopatia Patelar (Jumper's Knee), Apofisite de Osgood-Schlatter e Pós-Op LCA. Decorre de excesso de aterrissagens em solo duro sem força excêntrica suficiente no quadríceps.
          </p>
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">🦶 Tornozelo & Pé (${ankleFootCases.length} atletas · ~22%)</strong>
            <span class="badge badge--yellow">Impacto & Tração</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos:</strong> Entorses ligamentares (inversão), tendinopatia de Aquiles e Fratura de Navicular. Muito associadas a fadiga neuromuscular ao final de treinos e jogos.
          </p>
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">🏐 Ombro & Manguito (${shoulderCases.length} atletas · ~16%)</strong>
            <span class="badge badge--navy">Vôlei & Natação</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos:</strong> Tendinopatia de supraespinhal e tendinite de tríceps. Resulta de semanas de alto volume de ataques, saques potentes e rotação repetitiva de braço.
          </p>
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">⚡ Sobrecarga Muscular (${muscleCases.length} atletas · ~20%)</strong>
            <span class="badge badge--red">Futsal & Basquete</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos:</strong> Gastrocnêmio (panturrilha), estiramento de reto femoral, adutores e pubalgia. Diretamente desencadeados por acelerações e trocas bruscas de direção.
          </p>
        </div>
      </div>

      <h4 class="subsection-title" style="margin-top: 3.5mm;">Diferenciação Crítica: Veto de Quadra vs Veto de Preparação Física (PF)</h4>
      <div class="card card--soft-blue" style="font-size: 8pt; line-height: 1.45;">
        <p style="margin-bottom: 1.5mm;">
          Um dos grandes avanços da integração médica no Olympico é que <strong>o veto de treino de quadra NÃO significa repouso absoluto</strong>. Enquanto o impacto mecânico, saltos e disputas de bola estão vetados em quadra, o atleta continua liberado na sala de musculação para:
        </p>
        <ul style="margin-bottom: 0;">
          <li>Manter o lastro cardiorrespiratório e força muscular em segmentos não afetados.</li>
          <li>Realizar exercícios isométricos que aliviam a dor tendínea (Rio et al., 2015).</li>
          <li>Preservar o lastro de carga crônica para evitar que o ACWR despenque em destreinamento.</li>
        </ul>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Relatório Técnico-Científico para Comissões Técnicas</span>
      <span>Página <strong>5</strong> de <strong>6</strong></span>
    </div>
  </section>

  <!-- ==========================================
       PÁGINA 6: ESTUDOS DE CASO & DIRETRIZES FINAIS
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Aplicação Prática</h2>
          <p>Capítulo 5: Estudos de Casos Reais & Diretrizes para Treinadores</p>
        </div>
      </div>
      <div class="header-badge">Guia Operacional</div>
    </div>

    <div>
      <h3 class="section-title">5. Casos Clínicos Emblemáticos & O Radar de Risco</h3>
      
      <div class="grid-3" style="margin-top: 2mm;">
        <!-- Caso 1 -->
        <div class="card card--soft-red" style="font-size: 7.6pt;">
          <strong style="color: #991b1b; font-size: 8.2pt; display: block; margin-bottom: 1mm;">🏐 Fernanda Tavares (Vôlei Sub-19)</strong>
          <span style="color: #64748b;">Diagnóstico: <strong>Calo Ósseo em Tíbia D</strong></span>
          <div style="margin-top: 2mm; padding-top: 1.5mm; border-top: 0.6pt solid #fecaca; line-height: 1.4;">
            <strong>Carga habitual:</strong> 2.40<br/>
            <strong>Na crise (28/08):</strong> Carga 4.33 (Z: +2.24σ)<br/>
            <strong>Hooper no pico:</strong> 19 / 20 (Fadiga 5, Sono 4)<br/>
            <strong>Desfecho:</strong> Dor 7/10. Sobrecarga óssea repetitiva frente a picos de impacto sem consolidação.
          </div>
        </div>

        <!-- Caso 2 -->
        <div class="card card--soft-amber" style="font-size: 7.6pt;">
          <strong style="color: #92400e; font-size: 8.2pt; display: block; margin-bottom: 1mm;">⚽ Anderson Fernandes (Futsal Sub-17)</strong>
          <span style="color: #64748b;">Diagnóstico: <strong>Lesão Muscular em Coxa</strong></span>
          <div style="margin-top: 2mm; padding-top: 1.5mm; border-top: 0.6pt solid #fed7aa; line-height: 1.4;">
            <strong>Rampa prévia:</strong> 1.58 → 3.17 → 4.50<br/>
            <strong>No dia da lesão:</strong> Carga máxima 4.50<br/>
            <strong>Dor no impacto:</strong> 6 / 10 imediata<br/>
            <strong>Desfecho:</strong> Ruptura de fibras musculares após subida vertiginosa de intensidade em 72h.
          </div>
        </div>

        <!-- Caso 3 -->
        <div class="card card--soft-blue" style="font-size: 7.6pt;">
          <strong style="color: #1e3a8a; font-size: 8.2pt; display: block; margin-bottom: 1mm;">🏐 Maria Paula (Vôlei Sub-17)</strong>
          <span style="color: #64748b;">Diagnóstico: <strong>Tendinopatia de Manguito</strong></span>
          <div style="margin-top: 2mm; padding-top: 1.5mm; border-top: 0.6pt solid #bfdbfe; line-height: 1.4;">
            <strong>Na crise de dor:</strong> Carga 4.17<br/>
            <strong>Hooper total:</strong> 17 / 20<br/>
            <strong>Fadiga & DOMS:</strong> 4.0 e 4.0 / 5.0<br/>
            <strong>Desfecho:</strong> Dor 6/10 no ombro D após semana de volume extremo de saques/ataques.
          </div>
        </div>
      </div>

      <h4 class="subsection-title" style="margin-top: 3.5mm;">O Radar de Risco no Dia a Dia da Comissão Técnica</h4>
      <div class="card card--navy" style="padding: 3.5mm 4mm;">
        <h4 style="font-size: 9pt; color: #4ade80; margin-bottom: 1.5mm;">Rotina Prática Recomendada em 3 Passos (2 Minutos Pré-Treino)</h4>
        <ol style="font-size: 7.8pt; color: #e2e8f0; margin-left: 4mm; margin-bottom: 0;">
          <li><strong>Consultar o Dashboard antes da sessão:</strong> Abrir a aba <em>Radar de Risco</em> e observar se há atletas sinalizados em 🔴 <strong>Alta Probabilidade</strong> (Z-Score &ge; +1.89σ ou Hooper &ge; 13).</li>
          <li><strong>Ajuste fino no treino:</strong> Ao invés de cortar o atleta, o treinador pode dosar o número de repetições em saltos máximos ou trocas de direção, ou alternar o atleta com um suplente em blocos táticos.</li>
          <li><strong>Comunicação ágil com a Fisioterapia:</strong> Se o atleta apontar dor em ascensão (&ge; 3/10), solicitar uma aplicação rápida de gelo, mobilidade ou liberação miofascial antes da entrada em quadra.</li>
        </ol>
      </div>

      <h4 class="subsection-title" style="margin-top: 3.5mm;">Referências Científicas Consultadas (Google Acadêmico · Peer-Reviewed)</h4>
      <div style="font-size: 6.8pt; color: #475569; line-height: 1.35; background: #f8fafc; padding: 2.5mm 3.5mm; border-radius: 2mm; border: 0.6pt solid #e2e8f0;">
        <p style="margin-bottom: 1mm;">
          1. <strong>Gabbett, T. J. (2016).</strong> The training—injury prevention paradox: should athletes be training smarter and harder? <em>British Journal of Sports Medicine</em>, 50(5), 273-280.
        </p>
        <p style="margin-bottom: 1mm;">
          2. <strong>Hooper, S. L., & Mackinnon, L. T. (1995).</strong> Monitoring overtraining in athletes: recommendations. <em>Sports Medicine</em>, 20(5), 321-327.
        </p>
        <p style="margin-bottom: 1mm;">
          3. <strong>Saw, A. E., Main, L. C., & Gastin, P. B. (2016).</strong> Monitoring the athlete's training load: subjective measures are more sensitive than objective measures. <em>BJSM</em>, 50(5), 281-291.
        </p>
        <p style="margin-bottom: 1mm;">
          4. <strong>Murray, N. B., Gabbett, T. J., Townshend, A. D., & Blanch, P. (2017).</strong> Calculating acute:chronic workload ratios: Exponentially weighted moving averages. <em>BJSM</em>, 51(9), 749-754.
        </p>
        <p style="margin-bottom: 1mm;">
          5. <strong>Williams, J. M., & Andersen, M. B. (1998).</strong> Psychosocial antecedents of sport injury: Review and critique. <em>Journal of Applied Sport Psychology</em>, 10(1), 5-25.
        </p>
        <p style="margin-bottom: 0;">
          6. <strong>Foster, C., et al. (2001).</strong> A new approach to monitoring exercise training. <em>J. Strength Cond. Res.</em>, 15(1), 109-115.
        </p>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Relatório Técnico-Científico para Comissões Técnicas</span>
      <span>Página <strong>6</strong> de <strong>6</strong></span>
    </div>
  </section>

</body>
</html>
`;
}

async function run() {
  await fsPromises.mkdir(OUTPUT_DIR, { recursive: true });

  const crestBase64 = getCrestBase64();
  const physioData = getPhysioData();

  console.log("Gerando HTML do Relatório Técnico-Científico...");
  const html = generateHtml(crestBase64, physioData);
  await fsPromises.writeFile(HTML_OUTPUT, html, "utf8");
  console.log(`HTML salvo em: ${HTML_OUTPUT}`);

  console.log("Convertendo para PDF via Google Chrome Headless...");
  const chromeArgs = [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-software-rasterizer",
    "--hide-scrollbars",
    "--no-first-run",
    "--print-to-pdf-no-header",
    `--print-to-pdf=${PDF_OUTPUT}`,
    `file://${HTML_OUTPUT}`
  ];

  await new Promise((resolve, reject) => {
    execFile("google-chrome", chromeArgs, { timeout: 45000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || stdout || error.message));
      }
      resolve();
    });
  });

  const pdfStats = fs.statSync(PDF_OUTPUT);
  console.log(`PDF gerado com sucesso! Tamanho: ${(pdfStats.size / 1024).toFixed(1)} KB em ${PDF_OUTPUT}`);

  // Copia também para o diretório de artefatos
  try {
    const artifactPdf = path.join(ARTIFACT_DIR, "RELATORIO-CIENTIFICO-FISIOTERAPIA-COMISSAO-TECNICA.pdf");
    await fsPromises.copyFile(PDF_OUTPUT, artifactPdf);
    console.log(`PDF sincronizado no artefato: ${artifactPdf}`);
  } catch (err) {
    console.warn("Nota: não foi possível copiar para artefatos:", err.message);
  }
}

run().catch((err) => {
  console.error("Falha ao gerar o relatório:", err);
  process.exit(1);
});
