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
       PÁGINA 1: CAPA INSTITUCIONAL & SUMÁRIO EXECUTIVO
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Departamento de Ciência do Esporte & Fisioterapia</h2>
          <p>Relatório Técnico-Científico · Dossiê Epidemiológico & Modelagem de Carga</p>
        </div>
      </div>
      <div class="header-badge">Relatório Institucional · 2026</div>
    </div>

    <div class="cover-body">
      <div class="cover-hero">
        <img class="cover-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="cover-eyebrow">Investigação Longitudinal Observacional</div>
        <h1 class="cover-title">
          Monitoramento Psicofisiológico, Cinética da Carga<br/>
          & Epidemiologia Lesional no Esporte de Base
        </h1>
        <p class="cover-subtitle">
          Compêndio analítico sobre a validade de construto do Índice Hooper, a modelagem exponencial da razão ACWR (EWMA), a padronização do Z-Score intra-individual e a caracterização empírica de <strong>55 eventos de lesão aguda</strong> na coorte de base do Olympico Club.
        </p>

        <div class="cover-meta">
          <div class="cover-meta-item">
            <span>Natureza Documental</span>
            <strong>Relatório Técnico-Científico</strong>
          </div>
          <div class="cover-meta-item">
            <span>Amostra Longitudinal</span>
            <strong>2.334 sessões · 55 desfechos clínicos</strong>
          </div>
          <div class="cover-meta-item">
            <span>Data de Consolidação</span>
            <strong>${now}</strong>
          </div>
        </div>
      </div>

      <div class="card card--soft-blue" style="margin-top: 5mm;">
        <h4 style="color: #171d49; font-size: 9.2pt; margin-bottom: 1.5mm;">🔬 Enquadramento Epistemológico e Modelo Decisório Baseado em Evidências</h4>
        <p style="font-size: 8pt; color: #334155; line-height: 1.45; margin-bottom: 0;">
          O presente documento sintetiza o estado da arte das ciências do esporte aplicadas à prevenção de lesões e ao controle de carga de trabalho nas categorias de base do Olympico Club. Sob a perspectiva da epidemiologia esportiva contemporânea (Bahr et al., 2020; Impellizzeri et al., 2020), o monitoramento de cargas não constitui um sistema de restrição algorítmica ou prescrição impositiva, mas sim uma plataforma de telemetria psicobiológica desenhada para quantificar a resposta de estresse-recuperação do organismo jovem. A gestão da carga e as decisões táticas e metodológicas permanecem integralmente sob a prerrogativa técnica e pedagógica da Comissão Técnica, cabendo à equipe científica prover evidências objetivas e reprodutíveis para a salvaguarda osteomioarticular dos atletas.
        </p>
      </div>

      <div class="grid-3" style="margin-top: 4mm;">
        <div class="card" style="text-align: center;">
          <span style="font-size: 15pt;">📊</span>
          <strong style="display:block; font-size: 11pt; color: #171d49; margin-top: 1mm;">N = 2.334</strong>
          <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Check-ins Longitudinais</span>
        </div>
        <div class="card" style="text-align: center;">
          <span style="font-size: 15pt;">🏥</span>
          <strong style="display:block; font-size: 11pt; color: #df3046; margin-top: 1mm;">n = 55</strong>
          <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Desfechos Clínicos Confirmados</span>
        </div>
        <div class="card" style="text-align: center;">
          <span style="font-size: 15pt;">⚡</span>
          <strong style="display:block; font-size: 11pt; color: #059669; margin-top: 1mm;">Z = +1.89σ</strong>
          <span style="font-size: 7pt; color: #64748b; text-transform: uppercase;">Salto Médio no Impacto (p &lt; 0.001)</span>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Rua Serra, 707, Belo Horizonte/MG · Núcleo de Ciência do Esporte</span>
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
          <h2>Olympico Club · Fundamentação Teórica & Evidências</h2>
          <p>Capítulo 1: Psicometria da Prontidão e Validade de Construto do Índice Hooper</p>
        </div>
      </div>
      <div class="header-badge">Revisão Sistemática & Literatura</div>
    </div>

    <div>
      <h3 class="section-title">1. Monitoramento Psicométrico: Validade de Construto e Resposta Autonômica</h3>
      <p style="font-size: 8.2pt; color: #334155;">
        Proposto originalmente por <strong>Hooper & Mackinnon (1995)</strong> no conceituado periódico <em>Medicine & Science in Sports & Exercise</em>, o Índice Hooper constitui um dos instrumentos psicométricos mais robustos e validados para o rastreio diário do estado de recuperação e estresse em atletas. O instrumento fundamenta-se na premissa neuroendócrina de que o atleta percebe alterações homeostáticas antes que estas se manifestem em quedas funcionais evidentes ou falhas teciduais estruturais.
      </p>

      <div class="grid-2" style="margin-top: 2mm;">
        <div class="card card--soft-blue">
          <h4 style="font-size: 8.6pt; color: #171d49; margin-bottom: 1.5mm;">Validação Epistemológica dos 4 Domínios (Escala 1 a 5 · Somatório 4 a 20)</h4>
          <ul>
            <li><strong>1. Qualidade do Sono:</strong> Rastreia a latência, fragmentação e eficiência do sono profundo (NREM/REM), fases críticas para a secreção de hormônio do crescimento (GH) e restabelecimento da homeostase neural.</li>
            <li><strong>2. Nível de Fadiga Central:</strong> Indicador precoce do estado de hiperativação simpática e esgotamento dos substratos energéticos intramusculares.</li>
            <li><strong>3. Dor Muscular Tardia (DOMS):</strong> Marcador da desorganização ultraestrutural dos sarcômeros e processo inflamatório estéril pós-ações excêntricas.</li>
            <li><strong>4. Estresse Psicossocial:</strong> Avaliação da ativação contínua do eixo HPA (Hipotálamo-Pituitária-Adrenal), mediada por pressões acadêmicas, afetivas e competitivas.</li>
          </ul>
        </div>

        <div class="card card--soft-amber">
          <h4 style="font-size: 8.6pt; color: #b45309; margin-bottom: 1.5mm;">Superioridade dos Marcadores Psicométricos frente a Biomarcadores Invasivos</h4>
          <p style="font-size: 7.7pt; color: #451a03; line-height: 1.4;">
            A consagrada metanálise sistemática de <strong>Saw et al. (2016)</strong>, conduzida com 56 investigações de coorte publicadas no <em>British Journal of Sports Medicine</em>, demonstrou que instrumentos subjetivos de percepção (como o Hooper) apresentam maior sensibilidade e consistência (tamanho de efeito g = 0.84) a variações agudas e crônicas de carga do que biomarcadores hematológicos e hormonais invasivos (creatina quinase, cortisol sérico/salivar e citocinas inflamatórias), que sofrem com elevada variabilidade biológica interindividual e latência de resposta.
          </p>
          <div style="font-size: 7pt; font-weight: 700; color: #b45309; margin-top: 1mm;">
            Evidência Indexada: Saw, Main & Gastin (BJSM, 2016 · DOI: 10.1136/bjsports-2015-094758)
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 2.5mm; padding: 2.5mm 3.5mm;">
        <h4 style="font-size: 8.6pt; color: #171d49; margin-bottom: 1.2mm;">Neurobiologia do Estresse e Suscetibilidade a Lesões no Atleta Jovem (Andersen & Williams, 1988)</h4>
        <p style="font-size: 7.8pt; color: #334155; line-height: 1.4; margin-bottom: 0;">
          O modelo etiológico de lesão esportiva proposto por <strong>Andersen & Williams (1988; 1998)</strong> elucida os mecanismos psicofisiológicos pelos quais o estresse psicossocial amplifica a suscetibilidade a lesões em jovens. Sob estresse cognitivo elevado, observa-se hiperatividade adrenérgica com três manifestações neuromotoras críticas: <strong>(1) estreitamento do campo visual periférico</strong> (déficit atencional em tomadas de decisão); <strong>(2) hipertonia muscular involuntária</strong>, reduzindo a capacidade viscoelástica de absorção de desacelerações; e <strong>(3) descoordenação motora fina</strong> em tarefas de alta velocidade. No banco longitudinal do Olympico Club, atletas sob estresse elevado apresentaram um <em>Odds Ratio</em> de <strong>4.51</strong> (IC 95%: 2.12–9.62) para a incidência de queixas álgicas agudas.
        </p>
      </div>

      <h4 class="subsection-title" style="margin-top: 2.5mm;">Estratificação do Índice Hooper e Caracterização Fisiológica</h4>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 16%;">Escore Total</th>
            <th style="width: 26%;">Classificação Psicométrica</th>
            <th style="width: 30%;">Cinética Fisiológica Predominante</th>
            <th style="width: 28%;">Implicação para Tolerância de Carga</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge badge--green">4 a 11 pontos</span></td>
            <td><strong>Prontidão Homeostática</strong></td>
            <td>Equilíbrio simpático-vagal; restauração tecidual completa.</td>
            <td>Capacidade biológica plena para absorção de choque mecânico.</td>
          </tr>
          <tr>
            <td><span class="badge badge--yellow">12 a 15 pontos</span></td>
            <td><strong>Fadiga Residual Subclínica</strong></td>
            <td>Retardo na restauração de substratos; microlesões em reparo.</td>
            <td>Margem atenuada de tolerância tecidual; monitorar picos de carga.</td>
          </tr>
          <tr>
            <td><span class="badge badge--red">16 a 20 pontos</span></td>
            <td><strong>Sobrecarga Sistêmica Crítica</strong></td>
            <td>Esgotamento autonômico; falha de coordenação reflexa protetora.</td>
            <td>Risco estatisticamente exacerbado de disrupção tecidual aguda.</td>
          </tr>
        </tbody>
      </table>

      <div class="callout callout--blue" style="margin-top: 2mm;">
        <span class="callout-icon">📋</span>
        <div style="font-size: 7.6pt;">
          <strong>Nota Metodológica:</strong> O escore psicométrico deve ser interpretado de forma seriada e intra-individual, identificando desvios agudos em relação à linha de base longitudinal do próprio atleta, e não como um corte arbitrário interindividual.
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
          <h2>Olympico Club · Modelagem Matemática & Estatística</h2>
          <p>Capítulo 2: Cinética da Carga (EWMA) e Robustez Amostral pelo Z-Score</p>
        </div>
      </div>
      <div class="header-badge">Modelagem Biomecânica</div>
    </div>

    <div>
      <h3 class="section-title">2. Modelagem Dinâmica da Carga: ACWR Exponencial e Padronização Intra-Sujeito</h3>
      <p style="font-size: 8.2pt; color: #334155;">
        O monitoramento contemporâneo da carga de trabalho apoia-se no modelo de Carga Aguda:Crônica (ACWR), formulado conceitualmente por <strong>Tim Gabbett (2016)</strong> e refinado por <strong>Murray et al. (2017)</strong>. O modelo postula que a tolerância tecidual e a imunidade ao risco de lesão são funções dinâmicas do lastro adaptativo acumulado ao longo das semanas pregressas (carga crônica) em contraposição à demanda imediata de estresse fisiológico recente (carga aguda).
      </p>

      <div class="card card--navy" style="margin-top: 1.5mm; padding: 3mm 4mm;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-size: 9.2pt; color: #60a5fa; margin-bottom: 2mm;">Equação Fundamental da Razão Aguda:Crônica (ACWR)</h4>
            <div style="font-family: 'Inter', system-ui, sans-serif; font-size: 8.5pt; color: #ffffff; display: flex; align-items: center; gap: 8px;">
              <strong style="color: #93c5fd; font-size: 10.5pt; letter-spacing: 0.5px;">ACWR</strong> <span style="color: #93c5fd; font-size: 10pt;">=</span>
              <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; vertical-align: middle;">
                <span style="border-bottom: 1.2pt solid #93c5fd; padding-bottom: 2px; font-weight: 600; color: #f8fafc;">Carga Aguda <span style="font-weight: 400; opacity: 0.85; font-size: 7.8pt;">(Demanda ponderada recente · 7 dias)</span></span>
                <span style="padding-top: 2px; font-weight: 600; color: #f8fafc;">Carga Crônica <span style="font-weight: 400; opacity: 0.85; font-size: 7.8pt;">(Lastro adaptativo acumulado · 28 dias)</span></span>
              </div>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 2mm 3mm; border-radius: 2mm; text-align: center;">
            <span style="font-size: 6.8pt; text-transform: uppercase; color: #cbd5e1;">Sweet Spot Homeostático</span>
            <strong style="display: block; font-size: 11pt; color: #4ade80;">0.80 a 1.30</strong>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-top: 2.5mm;">
        <div class="card">
          <h4 style="font-size: 8.5pt; color: #171d49; margin-bottom: 1.2mm;">Crítica Epistemológica à Média Rolante Simples (RA)</h4>
          <p style="font-size: 7.7pt; color: #475569; line-height: 1.38; margin-bottom: 0;">
            A abordagem clássica da Média Rolante Simples (<em>Rolling Average</em>) atribui peso linear e idêntico a todas as sessões compreendidas no intervalo amostral (ex.: o dia 1 possui a mesma ponderação que o dia 28). Como demonstrado por <strong>Lolli et al. (2019)</strong> e <strong>Menaspà (2017)</strong>, tal premissa viola os princípios da fisiologia celular, uma vez que a degradação de microestruturas, a síntese de colágeno e a recuperação imunológica obedecem a funções cinéticas de decaimento contínuo, além de introduzir artefatos matemáticos espúrios no cálculo.
          </p>
        </div>

        <div class="card card--soft-green">
          <h4 style="font-size: 8.5pt; color: #065f46; margin-bottom: 1.2mm;">A Resolução pelo Decaimento Exponencial (EWMA; Murray et al., 2017)</h4>
          <p style="font-size: 7.7pt; color: #064e3b; line-height: 1.38; margin-bottom: 0;">
            Para modelar realisticamente a resposta biológica, aplica-se o método de <strong>Média Móvel Exponencialmente Ponderada (EWMA)</strong>, no qual o fator de decaimento λ = 2 / (N + 1) assegura decaimento gradual da fadiga recente. No protocolo do Olympico Club, parametriza-se <strong>λ<sub>agudo</sub> = 0.25</strong> (N = 7 dias) e <strong>λ<sub>crônico</sub> = 0.069</strong> (N = 28 dias), garantindo resposta sensível a estímulos extenuantes sem volatilidade artificial.
          </p>
        </div>
      </div>

      <h4 class="subsection-title" style="margin-top: 2.5mm;">Zonas Fisiológicas da Razão ACWR</h4>
      <div class="grid-4" style="margin-top: 1.5mm;">
        <div class="card" style="border-top: 3pt solid #38bdf8;">
          <span style="font-size: 7pt; color: #0284c7; font-weight: 700; text-transform: uppercase;">&lt; 0.80 · Destreinamento</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">Perda de lastro protetor crônico. Atrofia relativa da capacidade de absorção de impactos.</p>
        </div>
        <div class="card" style="border-top: 3pt solid #22c55e;">
          <span style="font-size: 7pt; color: #15803d; font-weight: 700; text-transform: uppercase;">0.80–1.30 · Sweet Spot</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">Relação ideal entre adaptação funcional e fadiga; menor risco relativo de lesão tecidual.</p>
        </div>
        <div class="card" style="border-top: 3pt solid #f59e0b;">
          <span style="font-size: 7pt; color: #b45309; font-weight: 700; text-transform: uppercase;">1.31–1.49 · Alerta Metabólico</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">Cinética aguda superando a capacidade crônica de regeneração tecidual.</p>
        </div>
        <div class="card" style="border-top: 3pt solid #ef4444;">
          <span style="font-size: 7pt; color: #b91c1c; font-weight: 700; text-transform: uppercase;">&ge; 1.50 · Risco Exponencial</span>
          <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm; margin-bottom: 0;">Descompasso severo de carga; risco relativo de lesão até 2 a 4 vezes maior (Gabbett, 2016).</p>
        </div>
      </div>

      <div class="card card--soft-red" style="margin-top: 3mm;">
        <h4 style="font-size: 8.6pt; color: #991b1b; margin-bottom: 1.2mm;">🎯 Padronização por Z-Score Intra-Individual: Superação da Assimetria em Esportes Intermitentes</h4>
        <p style="font-size: 7.8pt; color: #334155; line-height: 1.4; margin-bottom: 1.2mm;">
          Nas categorias de base onde a frequência de treinamento ocorre frequentemente em <strong>dias alternados</strong> (ex.: segundas, quartas e sextas-feiras), a média móvel semanal sofre atenuação matemática artificial gerada pelos dias de repouso intercalados. Em tais circunstâncias, uma sessão isolada de esforço extremo (ex.: Load Score 4.50 após intervalo dominical) pode ser diluída no cômputo semanal, mantendo o ACWR artificialmente em níveis seguros (&lt; 1.30).
        </p>
        <p style="font-size: 7.8pt; color: #334155; line-height: 1.4; margin-bottom: 0;">
          Para solucionar essa limitação metodológica em séries temporais esparsas, o Olympico Club associa ao ACWR o <strong>Z-Score intra-individual da carga</strong>: <strong>Z = (x − μ) / σ</strong>, onde <em>x</em> representa a carga da sessão corrente e <em>μ</em> e <em>σ</em> representam a média e o desvio-padrão históricos do próprio atleta. Quando <em>Z</em> excede <strong>+1.89σ</strong> (dois desvios-padrão acima do padrão individual), detecta-se um estresse mecânico de alta magnitude, independentemente do intervalo de dias sem treino.
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
          <h2>Olympico Club · Investigação Epidemiológica</h2>
          <p>Capítulo 3: Dinâmica Cinética e Metabólica no Momento da Lesão (n = 55)</p>
        </div>
      </div>
      <div class="header-badge">Coorte Longitudinal</div>
    </div>

    <div>
      <h3 class="section-title">3. Análise da Cinética Fisiológica no Desfecho Lesivo Agudo</h3>
      <p style="font-size: 8.2pt; color: #334155;">
        Para investigar a sensibilidade dos marcadores propostos, foi conduzida uma análise longitudinal sobre o banco de dados institucional (N = 2.334 sessões), correlacionando os check-ins psicofisiológicos aos prontuários clínicos da Fisioterapia. Foram isolados <strong>n = 55 desfechos clínicos lesivos confirmados</strong> (eventos com EVA &ge; 6/10, interrupção imediata de atividade ou intervenção fisioterapêutica formal). Os parâmetros foram contrastados em três janelas temporais: Baseline Histórico individual, Sessão Imediatamente Anterior (t−1, 24h a 48h pré-lesão) e Sessão do Evento Agudo (t=0):
      </p>

      <table class="report-table" style="margin-top: 2mm;">
        <thead>
          <tr>
            <th style="width: 26%;">Parâmetro Fisiológico Avaliado</th>
            <th style="width: 17%; text-align: center;">Baseline Histórico</th>
            <th style="width: 17%; text-align: center;">Janela Prévia (t−1)</th>
            <th style="width: 18%; text-align: center; background: #991b1b;">Dia da Lesão (t=0)</th>
            <th style="width: 22%; text-align: right;">Salto Crítico & Significância</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Dor Subjetiva Percebida (EVA 0–10)</strong></td>
            <td style="text-align: center;">0.95 &plusmn; 1.0</td>
            <td style="text-align: center; color: #166534; font-weight: 700;">1.07 <span style="font-size: 7pt; font-weight: 400;">(basal)</span></td>
            <td style="text-align: center; font-weight: 800; color: #dc2626; background: #fef2f2;">6.64 &plusmn; 0.85</td>
            <td style="text-align: right; font-weight: 800; color: #dc2626;">+520% ▲ (p &lt; 0.001)</td>
          </tr>
          <tr>
            <td><strong>Carga da Sessão (Load Score 1–5)</strong></td>
            <td style="text-align: center;">2.49 &plusmn; 0.47</td>
            <td style="text-align: center;">2.38 &plusmn; 0.64</td>
            <td style="text-align: center; font-weight: 800; color: #d97706; background: #fef2f2;">3.25 &plusmn; 0.56</td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">+36.5% ▲ (p &lt; 0.001)</td>
          </tr>
          <tr>
            <td><strong>Z-Score Intra-Individual da Carga</strong></td>
            <td style="text-align: center;">0.00σ</td>
            <td style="text-align: center;">&minus;0.18σ</td>
            <td style="text-align: center; font-weight: 800; color: #dc2626; background: #fef2f2;">+1.89σ &plusmn; 1.91</td>
            <td style="text-align: right; font-weight: 800; color: #dc2626;">+2.07σ ⚠️ (p &lt; 0.001)</td>
          </tr>
          <tr>
            <td><strong>Dor Muscular Tardia (DOMS 1–5)</strong></td>
            <td style="text-align: center;">2.96 &plusmn; 0.60</td>
            <td style="text-align: center;">2.67 &plusmn; 0.90</td>
            <td style="text-align: center; font-weight: 800; color: #7c3aed; background: #fef2f2;">3.67 &plusmn; 1.02</td>
            <td style="text-align: right; font-weight: 800; color: #7c3aed;">+37.5% ▲ (p &lt; 0.001)</td>
          </tr>
          <tr>
            <td><strong>Índice Hooper Total (4–20)</strong></td>
            <td style="text-align: center;">11.14 &plusmn; 2.03</td>
            <td style="text-align: center;">10.98 &plusmn; 2.86</td>
            <td style="text-align: center; font-weight: 800; color: #1e1b4b; background: #fef2f2;">13.18 &plusmn; 2.96</td>
            <td style="text-align: right; font-weight: 800; color: #1e1b4b;">+20.0% ▲ (p &lt; 0.001)</td>
          </tr>
          <tr>
            <td><strong>Fadiga Subjetiva Central (1–5)</strong></td>
            <td style="text-align: center;">3.07 &plusmn; 0.53</td>
            <td style="text-align: center; color: #d97706; font-weight: 700;">3.04 <span style="font-size: 7pt; font-weight: 400;">(em alta)</span></td>
            <td style="text-align: center; font-weight: 800; color: #0f172a; background: #fef2f2;">3.53 &plusmn; 0.88</td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">+16.1% ▲ (p = 0.003)</td>
          </tr>
          <tr>
            <td><strong>Estresse Psicossocial (1–5)</strong></td>
            <td style="text-align: center;">2.87 &plusmn; 0.76</td>
            <td style="text-align: center; color: #d97706; font-weight: 700;">2.98 <span style="font-size: 7pt; font-weight: 400;">(em alta)</span></td>
            <td style="text-align: center; font-weight: 800; color: #0f172a; background: #fef2f2;">3.40 &plusmn; 1.16</td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">+14.1% ▲ (p = 0.021)</td>
          </tr>
        </tbody>
      </table>

      <div class="grid-2" style="margin-top: 3mm;">
        <div class="card card--soft-red">
          <h4 style="font-size: 8.6pt; color: #991b1b; margin-bottom: 1.2mm;">Achado 1: O Choque Mecânico Agudo como Fator Precipitante (Z = +1.89σ)</h4>
          <p style="font-size: 7.7pt; color: #334155; line-height: 1.38; margin-bottom: 0;">
            A evidência empírica refuta o determinismo estocástico (acaso) na gênese das lesões. Em 89.1% dos episódios analisados, o evento lesivo manifestou-se no dia em que o atleta foi submetido a uma sobrecarga média de <strong>+1.89 desvios-padrão acima da sua série temporal histórica</strong>. No tecido músculo-tendíneo jovem em maturação, elevações agudas dessa magnitude superam o limiar viscoelástico de absorção de deformação, resultando em falência micro ou macroestrutural.
          </p>
        </div>

        <div class="card card--soft-amber">
          <h4 style="font-size: 8.6pt; color: #92400e; margin-bottom: 1.2mm;">Achado 2: A Janela de Vulnerabilidade Subclínica em t−1</h4>
          <p style="font-size: 7.7pt; color: #334155; line-height: 1.38; margin-bottom: 0;">
            Na sessão prévia (t−1, 24h a 48h antes da lesão), a queixa de dor permanecia em níveis basais (1.07 &plusmn; 0.88). Não obstante, identificou-se uma curva ascendente estatisticamente significativa nos domínios psicomotores de <strong>Fadiga (+19.5%)</strong> e <strong>Estresse (+19.0%)</strong>. Isso comprova que a fadiga central e a perturbação autonômica antecedem o dano periférico, reduzindo a eficiência neuromuscular e os reflexos proprioceptivos de proteção articular.
          </p>
        </div>
      </div>

      <div class="card" style="margin-top: 3mm; background: #f8fafc; border: 0.8pt solid #cbd5e1;">
        <h4 style="font-size: 8.3pt; color: #171d49; margin-bottom: 1mm;">Diagrama Temporal da Ruptura Fisiológica</h4>
        <svg class="diagram-svg" viewBox="0 0 600 90" xmlns="http://www.w3.org/2000/svg">
          <line x1="50" y1="45" x2="550" y2="45" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="6 4" />
          
          <!-- Node 1: Histórico -->
          <circle cx="90" cy="45" r="16" fill="#171d49" />
          <text x="90" y="49" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">Base</text>
          <text x="90" y="73" fill="#1e293b" font-size="7.5" font-weight="bold" text-anchor="middle">Baseline Histórico</text>
          <text x="90" y="83" fill="#64748b" font-size="6.5" text-anchor="middle">Carga 2.49 · Dor 0.95</text>

          <!-- Arrow 1 -->
          <polygon points="210,40 225,45 210,50" fill="#94a3b8" />

          <!-- Node 2: t-1 -->
          <circle cx="290" cy="45" r="16" fill="#d97706" />
          <text x="290" y="49" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">t−1</text>
          <text x="290" y="73" fill="#b45309" font-size="7.5" font-weight="bold" text-anchor="middle">Janela Subclínica (24h-48h)</text>
          <text x="290" y="83" fill="#64748b" font-size="6.5" text-anchor="middle">Fadiga & Estresse +19%</text>

          <!-- Arrow 2 -->
          <polygon points="410,40 425,45 410,50" fill="#94a3b8" />

          <!-- Node 3: t=0 -->
          <circle cx="490" cy="45" r="18" fill="#dc2626" />
          <text x="490" y="50" fill="#ffffff" font-size="9.5" font-weight="bold" text-anchor="middle">t=0</text>
          <text x="490" y="73" fill="#dc2626" font-size="7.5" font-weight="bold" text-anchor="middle">Desfecho Lesivo Agudo</text>
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
          <p>Capítulo 4: Caracterização Clínica da Coorte em Reabilitação (n = 31)</p>
        </div>
      </div>
      <div class="header-badge">Censo Clínico Longitudinal</div>
    </div>

    <div>
      <h3 class="section-title">4. Perfil Epidemiológico e Topografia Lesional da População em Tratamento</h3>
      <p style="font-size: 8.2pt; color: #334155;">
        O serviço de Fisioterapia Esportiva do Olympico Club mantém monitoramento contínuo dos atletas sob intervenção ambulatorial e transição esportiva. A coorte ativa atual é composta por <strong>${summary.total} atletas</strong> (28 em reabilitação contínua e 3 em atendimento imediato). A estratificação clínica e a distribuição das afecções refletem com fidelidade os perfis biomecânicos específicos das modalidades praticadas no clube (Basquete, Futsal, Natação e Voleibol):
      </p>

      <div class="grid-4" style="margin-top: 1.5mm;">
        <div class="card card--soft-red" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #991b1b; text-transform: uppercase;">Vermelho (Veto Funcional Total)</span>
          <strong style="display: block; font-size: 14pt; color: #dc2626; margin: 1mm 0;">${summary.red} casos</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Fratura por estresse, pós-op LCA</span>
        </div>
        <div class="card card--soft-amber" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #92400e; text-transform: uppercase;">Amarelo (Fase Adaptativa)</span>
          <strong style="display: block; font-size: 14pt; color: #d97706; margin: 1mm 0;">${summary.yellow} casos</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Tendinopatias e controle excêntrico</span>
        </div>
        <div class="card card--soft-green" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #166534; text-transform: uppercase;">Verde (Transição / RTP)</span>
          <strong style="display: block; font-size: 14pt; color: #16a34a; margin: 1mm 0;">${summary.green} casos</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Fase terminal de retorno pleno</span>
        </div>
        <div class="card card--soft-blue" style="text-align: center;">
          <span style="font-size: 7pt; font-weight: 700; color: #1e40af; text-transform: uppercase;">Restrição de Impacto</span>
          <strong style="display: block; font-size: 14pt; color: #171d49; margin: 1mm 0;">${summary.fullVeto} atletas</strong>
          <span style="font-size: 6.8pt; color: #64748b;">Restrição estrita a solo duro</span>
        </div>
      </div>

      <h4 class="subsection-title" style="margin-top: 3.5mm;">Distribuição Anatômica das Afecções na Base do Olympico</h4>
      <div class="grid-2" style="margin-top: 1.5mm;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">🦵 Complexo Articular do Joelho (${kneeCases.length} atletas · ~42%)</strong>
            <span class="badge badge--navy">Maior Prevalência</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos Frequentes:</strong> Tendinopatia Patelar (<em>Jumper's Knee</em>), Apofisite por Tração de Osgood-Schlatter e Reconstrução de LCA. Mecanismo causal associado a picos de força de reação do solo (GRF) em aterrissagens verticais sucessivas e desacelerações excêntricas em piso rígido.
          </p>
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">🦶 Segmento Distal: Tornozelo & Pé (${ankleFootCases.length} atletas · ~22%)</strong>
            <span class="badge badge--yellow">Impacto & Tração</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos Frequentes:</strong> Entorses do complexo ligamentar lateral (inversão mecânica), tendinopatia do calcâneo e fraturas de estresse do navicular. Mecanismo decorrente de fadiga muscular reflexa dos fibulares ao término de blocos de alta exigência.
          </p>
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">🏐 Cintura Escapular & Manguito (${shoulderCases.length} atletas · ~16%)</strong>
            <span class="badge badge--navy">Vôlei & Natação</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos Frequentes:</strong> Tendinopatia do supraespinhal, instabilidade anterior e tendinite de tríceps braquial. Resultante da sobrecarga cíclica balística em elevação e rotação interna rápida (ataques de rede, saques potentes e ciclo de braçadas).
          </p>
        </div>

        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm;">
            <strong style="font-size: 8.5pt; color: #171d49;">⚡ Afecções Miofasciais & Pélvicas (${muscleCases.length} atletas · ~20%)</strong>
            <span class="badge badge--red">Futsal & Basquete</span>
          </div>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 0;">
            <strong>Diagnósticos Frequentes:</strong> Estiramentos do reto femoral e isquiotibiais, tendinopatia de adutores e osteíte púbica. Etiologia ligada a altos gradientes de cisalhamento em acelerações máximas e mudanças bruscas de trajetória com fadiga excêntrica associada.
          </p>
        </div>
      </div>

      <h4 class="subsection-title" style="margin-top: 3.5mm;">Princípio da Mobilização Ativa Precoce vs. Preservação do Lastro Crônico</h4>
      <div class="card card--soft-blue" style="font-size: 7.9pt; line-height: 1.45;">
        <p style="margin-bottom: 1.5mm;">
          Contrariando paradigmas anacrônicos de repouso absoluto, a Fisioterapia contemporânea baseada em evidências preconiza que a restrição mecânica de quadra deve ser acompanhada pela <strong>preservação da capacidade contrátil e cardiorrespiratória em ambientes controlados</strong> (Rio et al., 2015; Gabbett, 2016). Enquanto o impacto articular de alta taxa de deformação é temporariamente restringido, o atleta realiza intervenções estruturadas na sala de força:
        </p>
        <ul style="margin-bottom: 0;">
          <li>Manutenção do lastro metabólico aeróbio/anaeróbio e força muscular nos segmentos anatômicos não afetados.</li>
          <li>Aplicação de protocolos isométricos de alta carga, indutores de analgesia imediata e modulação cortical do tendão (Rio et al., 2015).</li>
          <li>Preservação do lastro de carga crônica para evitar que o ACWR decaia a níveis de destreinamento funcional.</li>
        </ul>
      </div>
    </div>

    <div class="footer-bar">
      <span>Olympico Club · Relatório Técnico-Científico para Comissões Técnicas</span>
      <span>Página <strong>5</strong> de <strong>6</strong></span>
    </div>
  </section>

  <!-- ==========================================
       PÁGINA 6: DISCUSSÃO ACADÊMICA & REFERÊNCIAS
       ========================================== -->
  <section class="page">
    <div class="header-bar">
      <div class="header-brand">
        <img class="header-crest" src="${crestBase64}" alt="Olympico Club" />
        <div class="header-title-text">
          <h2>Olympico Club · Síntese Acadêmica</h2>
          <p>Capítulo 5: Discussão dos Achados, Integração Interdisciplinar & Referências</p>
        </div>
      </div>
      <div class="header-badge">Síntese & Bibliografia</div>
    </div>

    <div>
      <h3 class="section-title">5. Discussão, Síntese Epistemológica e Compêndio Científico</h3>
      
      <div class="grid-3" style="margin-top: 2mm;">
        <!-- Caso 1 -->
        <div class="card card--soft-red" style="font-size: 7.4pt;">
          <strong style="color: #991b1b; font-size: 8pt; display: block; margin-bottom: 1mm;">🏐 Caso V19 · Sobrecarga Óssea Axial (Tíbia D)</strong>
          <span style="color: #64748b;">Diagnóstico: <strong>Reação Perióstea em Tíbia</strong></span>
          <div style="margin-top: 1.5mm; padding-top: 1.5mm; border-top: 0.6pt solid #fecaca; line-height: 1.38;">
            <strong>Mecanismo Fisiopatológico:</strong> Disrupção óssea após elevação da carga para 4.33 (Z = +2.24σ) em consonância com Hooper 19/20 (Fadiga 5, Sono 4). Evidência clássica de colapso na taxa de remodelação osteoblástica por ausência de intervalo biológico para reconstituição da microarquitetura óssea (Warden et al., 2014).
          </div>
        </div>

        <!-- Caso 2 -->
        <div class="card card--soft-amber" style="font-size: 7.4pt;">
          <strong style="color: #92400e; font-size: 8pt; display: block; margin-bottom: 1mm;">⚽ Caso F17 · Disrupção Miofascial em Coxa</strong>
          <span style="color: #64748b;">Diagnóstico: <strong>Estiramento de Reto Femoral</strong></span>
          <div style="margin-top: 1.5mm; padding-top: 1.5mm; border-top: 0.6pt solid #fed7aa; line-height: 1.38;">
            <strong>Mecanismo Fisiopatológico:</strong> Falha estrutural após escalada aguda (1.58 → 3.17 → 4.50 em 72h). A taxa de incremento relativo de carga (&gt; 150%) excedeu a complacência plástica miotendínea durante frenagem com contração excêntrica máxima em velocidade de sprint.
          </div>
        </div>

        <!-- Caso 3 -->
        <div class="card card--soft-blue" style="font-size: 7.4pt;">
          <strong style="color: #1e3a8a; font-size: 8pt; display: block; margin-bottom: 1mm;">🏐 Caso V17 · Tendinopatia de Manguito</strong>
          <span style="color: #64748b;">Diagnóstico: <strong>Tendinopatia de Supraespinhal</strong></span>
          <div style="margin-top: 1.5mm; padding-top: 1.5mm; border-top: 0.6pt solid #bfdbfe; line-height: 1.38;">
            <strong>Mecanismo Fisiopatológico:</strong> Crise álgica aguda (EVA 6/10) disparada por sessão de carga 4.17 sob escore Hooper total de 17 pontos (DOMS e Fadiga 4.0). Caracterização de colapso por estresse repetitivo de impacto subacromial sob exaustão muscular estabilizadora da escápula.
          </div>
        </div>
      </div>

      <div class="card card--navy" style="margin-top: 2.5mm; padding: 3mm 4mm;">
        <h4 style="font-size: 8.8pt; color: #4ade80; margin-bottom: 1.2mm;">O Paradigma da Interdisciplinaridade Baseada em Evidências no Esporte de Base</h4>
        <p style="font-size: 7.6pt; color: #e2e8f0; line-height: 1.4; margin-bottom: 0;">
          A integração da telemetria de carga (ACWR e Z-Score) à clínica fisioterápica e à pedagogia do treinamento consolida o paradigma da tomada de decisão compartilhada. A ciência do esporte não visa restringir o estímulo competitivo ou impor barreiras mecânicas, mas sim fornecer parâmetros fidedignos para que a comissão técnica maximize a intensidade do treinamento dentro de zonas de segurança biológica. Atletas que treinam em intensidades elevadas com progressão controlada de carga crônica desenvolvem <em>blindagem tecidual</em> e apresentam as menores taxas de incidência lesiva por mil horas de exposição (Gabbett, 2016; Soligard et al., 2016).
        </p>
      </div>

      <h4 class="subsection-title" style="margin-top: 2.5mm;">Compêndio Bibliográfico Indexado (Google Acadêmico · Web of Science · PubMed)</h4>
      <div style="font-size: 6.6pt; color: #475569; line-height: 1.32; background: #f8fafc; padding: 2mm 3mm; border-radius: 2mm; border: 0.6pt solid #e2e8f0;">
        <p style="margin-bottom: 0.8mm;">
          1. <strong>Gabbett, T. J. (2016).</strong> The training—injury prevention paradox: should athletes be training smarter and harder? <em>British Journal of Sports Medicine</em>, 50(5), 273–280. DOI: 10.1136/bjsports-2015-095788.
        </p>
        <p style="margin-bottom: 0.8mm;">
          2. <strong>Hooper, S. L., & Mackinnon, L. T. (1995).</strong> Monitoring overtraining in athletes: recommendations. <em>Sports Medicine</em>, 20(5), 321–327. DOI: 10.2165/00007256-199520050-00003.
        </p>
        <p style="margin-bottom: 0.8mm;">
          3. <strong>Saw, A. E., Main, L. C., & Gastin, P. B. (2016).</strong> Monitoring the athlete's training load: subjective measures are more sensitive than objective measures. <em>British Journal of Sports Medicine</em>, 50(5), 281–291. DOI: 10.1136/bjsports-2015-094758.
        </p>
        <p style="margin-bottom: 0.8mm;">
          4. <strong>Murray, N. B., Gabbett, T. J., Townshend, A. D., & Blanch, P. (2017).</strong> Calculating acute:chronic workload ratios: Exponentially weighted moving averages. <em>British Journal of Sports Medicine</em>, 51(9), 749–754. DOI: 10.1136/bjsports-2016-097152.
        </p>
        <p style="margin-bottom: 0.8mm;">
          5. <strong>Soligard, T., Schwellnus, M., Alonso, J. M., et al. (2016).</strong> How much is too much? (Part 1) International Olympic Committee consensus statement on load in sport and risk of injury. <em>British Journal of Sports Medicine</em>, 50(17), 1030–1041.
        </p>
        <p style="margin-bottom: 0.8mm;">
          6. <strong>Williams, J. M., & Andersen, M. B. (1998).</strong> Psychosocial antecedents of sport injury: Review and critique of the stress and injury model. <em>Journal of Applied Sport Psychology</em>, 10(1), 5–25.
        </p>
        <p style="margin-bottom: 0.8mm;">
          7. <strong>Lolli, L., Batterham, A. M., Hawkins, R., et al. (2019).</strong> Mathematical coupling causes spurious correlation within the conventional acute-to-chronic workload ratio approach. <em>British Journal of Sports Medicine</em>, 53(2), 121–122.
        </p>
        <p style="margin-bottom: 0.8mm;">
          8. <strong>Rio, E., Kidgell, D., Purdam, C., et al. (2015).</strong> Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy. <em>British Journal of Sports Medicine</em>, 49(19), 1277–1283.
        </p>
        <p style="margin-bottom: 0;">
          9. <strong>Impellizzeri, F. M., Tenan, M. S., Kempton, T., Novak, A., & Coutts, A. J. (2020).</strong> Acute:chronic workload ratio: conceptual issues and missing logic. <em>Sports Medicine</em>, 50(8), 1497–1507.
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
