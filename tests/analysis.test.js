const test = require("node:test");
const assert = require("node:assert/strict");
const Analysis = require("../src/client/analysis");
const { buildTeamReportSection, buildPrintReportHtml } = require("../src/server");

const now = "2026-09-25T12:00:00.000Z";
function entry(day, data = {}) {
  return { timestampIso: `2026-09-${day}T12:00:00.000Z`, painLevel: 0, fatigueScore: 2,
    sleepScore: 2, muscleScore: 2, stressScore: 2, moodScore: 2,
    loadScore: 2, recoveryScore: 4, ...data };
}
function athlete(name, entries, category = "BASQUETE SUB14") {
  return { id: name, name, category, latest: entries[0], entries, totalEntries: entries.length };
}

test("recuperação segue os rótulos reais de sono e humor e fica na escala", () => {
  const good = Analysis.computeRecoveryScore(entry("25", { painLevel: 0, fatigueScore: 1, stressScore: 1,
    muscleScore: 1, sleepScore: 1, moodScore: 1 }));
  const bad = Analysis.computeRecoveryScore(entry("25", { painLevel: 10, fatigueScore: 5, stressScore: 5,
    muscleScore: 5, sleepScore: 5, moodScore: 5 }));
  assert.equal(good, 5);
  assert.equal(bad, 0.83);
  assert.ok(good > bad && good <= 5);
  assert.equal(Analysis.computeRecoveryScore({ sleepScore: 1 }), 5);
  assert.equal(Analysis.computeRecoveryScore({ moodScore: 5 }), 1);
});

test("elegibilidade usa check-in primário e preserva elenco histórico", () => {
  const recent = athlete("Recente", [entry("25")]);
  const old = athlete("Inativo", [entry("01", { painLevel: 10 })]);
  const roster = [recent, old];
  assert.equal(Analysis.getAnalysisEligibleAthletes(roster, now).length, 1);
  assert.equal(roster.length, 2);
  assert.equal(Analysis.buildAttentionItems(roster, now).length, 0);
});

test("percentil pessoal exclui janela atual e requer seis janelas anteriores", () => {
  const values = [5, 5, 5, 1, 1, 1, 1, 1, 1].map((value, index) => entry(String(25 - index).padStart(2, "0"), { loadScore: value }));
  const base = Analysis.personalBaseline(athlete("Pessoa", values), "loadScore");
  assert.equal(base.baselineCount, 6);
  assert.equal(base.current, 5);
  assert.equal(base.percentile, 100);
  assert.equal(Analysis.personalBaseline(athlete("Curto", values.slice(0, 8)), "loadScore").percentile, null);
});

test("percentil de equipe não gera alerta, persistência gera uma entrada e sinal forte prevalece", () => {
  const stable = Array.from({ length: 6 }, (_, index) => athlete(`Estável ${index}`, [entry("25", { loadScore: index === 5 ? 5 : 2 }), entry("24"), entry("23")]));
  assert.equal(Analysis.buildAttentionItems(stable, now).length, 0);
  const longStable = Array.from({ length: 6 }, (_, index) => athlete(`Longo ${index}`, Array.from({ length: 9 }, (_, offset) => entry(String(25 - offset).padStart(2, "0"), { loadScore: index === 5 ? 5 : 2 }))));
  assert.equal(Analysis.buildAttentionItems(longStable, now).length, 0);
  const stressed = athlete("Estresse", [entry("25", { stressScore: 4 }), entry("24", { stressScore: 4 }), entry("23")]);
  const severe = athlete("Dor", [entry("25", { painLevel: 7, recoveryScore: 2 }), entry("24", { stressScore: 4 }), entry("23", { stressScore: 4 })]);
  const items = Analysis.buildAttentionItems([...stable, stressed, severe], now);
  assert.equal(items.filter((item) => item.athlete.name === "Dor").length, 1);
  assert.equal(items.find((item) => item.athlete.name === "Dor").level, "Atenção alta");
  assert.match(items.find((item) => item.athlete.name === "Dor").primaryReason, /Dor 7/);
  assert.equal(items.find((item) => item.athlete.name === "Estresse").level, "Atenção");
});

test("relatório semanal usa sete dias e apresenta duas páginas institucionais", () => {
  const team = "BASQUETE SUB14";
  const athletes = [athlete("Atual", [entry("25", { loadScore: 4, recoveryScore: 2, painLevel: 6 })]),
    athlete("Antigo", [entry("18", { loadScore: 1 })])];
  const html = buildTeamReportSection(athletes, [team], now, { id: "basquete", label: "Basquete" }, team, "");
  assert.equal((html.match(/class="report-page report-page--team/g) || []).length, 2);
  for (const label of ["Panorama da semana", "Indicadores principais", "Evolução da equipe", "Leitura da semana", "Atletas em atenção", "Fisioterapia", "Psicologia", "Contexto histórico da equipe", "Cobertura dos dados", "Nota metodológica", "Desgaste percebido"]) assert.ok(html.includes(label), label);
  assert.ok(!html.includes("Encaminhamentos sugeridos"));
  assert.match(html, /<span>Desgaste percebido<\/span><strong>4\/5<\/strong>/);
  const payload = { athletes, categories: [team], updatedAt: now, attendance: {} };
  const complete = buildPrintReportHtml(payload, "basquete", "", [], [], team);
  assert.match(complete, /size: A4 landscape/);
  assert.match(complete, /break-inside: avoid/);
});


test("listas clínicas densas preservam conteúdo e adotam grade compacta", () => {
  const team = "BASQUETE SUB 15";
  const physiotherapy = Array.from({ length: 6 }, (_, index) => ({ athleteName: `Fisio ${index}`, teamName: team, demand: "Lombalgia", semaphore: "AMARELO", notes: "Em tratamento | Veto PF: NÃO" }));
  const psychology = Array.from({ length: 3 }, (_, index) => ({ athleteName: `Psico ${index}`, teamName: team, demand: "Acompanhamento" }));
  const html = buildTeamReportSection([athlete("Atual", [entry("25")], team)], [team], now,
    { id: "basquete", label: "Basquete" }, team, "", physiotherapy, psychology);
  assert.match(html, /report-clinical-grid--dense/);
  assert.equal((html.match(/Lombalgia/g) || []).length, 6);
  assert.equal((html.match(/Acompanhamento/g) || []).length, 3);
  assert.match(html, /Veto PF/);
  assert.match(html, /Nota metodológica/);
});


test("relatório clínico reconhece veto parcial sem classificar NÃO como veto", () => {
  const team = "BASQUETE SUB-13";
  const clinical = [
    { athleteName: "Um", teamName: team, demand: "Tornozelo", semaphore: "AMARELO", trainingVeto: "SIM, PARCIAL", notes: "Veto treino: SIM, PARCIAL" },
    { athleteName: "Dois", teamName: team, demand: "Controle", semaphore: "VERDE", trainingVeto: "NÃO", notes: "Veto treino: NÃO" },
  ];
  const html = buildTeamReportSection([], [team], now, { id: "basquete", label: "Basquete" }, team, "", clinical);
  assert.match(html, /<span>Prioritários<\/span>\s*<strong>1<\/strong>/);
  assert.match(html, /relatório de fisioterapia/);
});

test("calcula índice Hooper corretamente respeitando os 4 pilares", () => {
  const normal = Analysis.computeHooperIndex({ fatigueScore: 3, sleepScore: 2, muscleScore: 4, stressScore: 3 });
  assert.deepEqual(normal, {
    total: 12,
    average: 3,
    fatigue: 3,
    sleep: 2,
    muscle: 4,
    stress: 3,
  });

  const missingOne = Analysis.computeHooperIndex({ fatigueScore: 4, sleepScore: 4, muscleScore: 4 });
  assert.equal(missingOne.total, 16);
  assert.equal(missingOne.average, 4);

  const empty = Analysis.computeHooperIndex({});
  assert.equal(empty, null);
});

test("calcula desvio padrão e Z-Score com robustez matemática", () => {
  const values = [2, 4, 4, 4, 5, 5, 7, 9];
  const std = Analysis.standardDeviation(values);
  assert.ok(std !== null && Math.abs(std - 2.14) < 0.05);

  const z = Analysis.computeZScore(7.14, 5, std);
  assert.equal(z, 1);

  assert.equal(Analysis.standardDeviation([5]), null);
  assert.equal(Analysis.computeZScore(5, 5, 0), null);
});

test("calcula EWMA e ACWR com janela adaptativa e zonas de risco", () => {
  const shortEntries = [entry("25", { loadScore: 4 }), entry("24", { loadScore: 3 })];
  assert.equal(Analysis.calculateACWR(shortEntries, "loadScore", 5), null);
  assert.equal(Analysis.calculateACWR_EWMA(shortEntries, "loadScore", 5), null);

  const fullEntries = Array.from({ length: 10 }, (_, i) =>
    entry(String(25 - i).padStart(2, "0"), { loadScore: i < 3 ? 4 : 2 })
  );
  const acwr = Analysis.calculateACWR(fullEntries, "loadScore", 5);
  const acwrEwma = Analysis.calculateACWR_EWMA(fullEntries, "loadScore", 5);

  assert.ok(Number.isFinite(acwr) && acwr > 1);
  assert.ok(Number.isFinite(acwrEwma) && acwrEwma > 1);

  assert.equal(Analysis.getACWRZone(0.7).zone, "undertraining");
  assert.equal(Analysis.getACWRZone(1.1).zone, "optimal");
  assert.equal(Analysis.getACWRZone(1.4).zone, "warning");
  assert.equal(Analysis.getACWRZone(1.6).zone, "danger");
});

test("calcula risco de lesao e sobrecarga aguda com identificacao de alta probabilidade", () => {
  // Atleta com carga normal e sem dor
  const stableEntries = Array.from({ length: 10 }, (_, i) =>
    entry(String(25 - i).padStart(2, "0"), { loadScore: 2, muscleScore: 2, fatigueScore: 2, stressScore: 2, painLevel: 0 })
  );
  const stableAth = athlete("Estável", stableEntries);
  const stableRisk = Analysis.calculateInjuryRisk(stableAth, now);
  assert.equal(stableRisk.probability, "Baixa");
  assert.equal(stableRisk.level, "low");

  // Atleta em crise aguda no momento t=0 (pico agudo de carga, Hooper e dor)
  const acuteEntries = [
    entry("25", { loadScore: 5, muscleScore: 5, fatigueScore: 5, stressScore: 4, painLevel: 6 }),
    ...Array.from({ length: 9 }, (_, i) =>
      entry(String(24 - i).padStart(2, "0"), { loadScore: 2, muscleScore: 2, fatigueScore: 2, stressScore: 2, painLevel: 0 })
    ),
  ];
  const acuteAth = athlete("Crítico", acuteEntries);
  const acuteRisk = Analysis.calculateInjuryRisk(acuteAth, now);
  assert.equal(acuteRisk.probability, "Alta");
  assert.equal(acuteRisk.level, "high");
  assert.ok(acuteRisk.probabilityPercent >= 70);
  assert.ok(acuteRisk.triggers.length >= 3);
  assert.ok(acuteRisk.triggers.some((t) => t.domain === "Carga"));
  assert.ok(acuteRisk.triggers.some((t) => t.domain === "DOMS"));
  assert.ok(acuteRisk.triggers.some((t) => t.domain === "Dor"));

  const list = Analysis.buildRiskAssessmentList([stableAth, acuteAth], now);
  assert.equal(list.length, 2);
  assert.equal(list[0].athlete.name, "Crítico");
  assert.equal(list[0].probability, "Alta");
});

