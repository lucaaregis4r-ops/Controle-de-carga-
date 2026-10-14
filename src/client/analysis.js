/* Shared by the local report and the static dashboard. Entries are newest first. */
(function (root, factory) {
  const analysis = factory();
  if (typeof module === "object" && module.exports) module.exports = analysis;
  if (root) root.OlympicoAnalysis = analysis;
})(typeof globalThis === "object" ? globalThis : this, function () {
  const ANALYSIS_CONFIG = Object.freeze({
    activityWindowDays: 20,
    reportWeekDays: 7,
    trendDays: 90,
    recentWindowEntries: 3,
    minPersonalBaselineWindows: 6,
    minTeamPercentileN: 6,
    minAcwrEntries: 5,
  });

  const mean = (values) => {
    const valid = values.filter(Number.isFinite);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };

  const rounded = (value) => (Number.isFinite(value) ? Math.round(value * 100) / 100 : null);

  const standardDeviation = (values) => {
    const valid = values.filter(Number.isFinite);
    if (valid.length < 2) return null;
    const m = mean(valid);
    const variance = valid.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (valid.length - 1);
    return Math.sqrt(variance);
  };

  const computeZScore = (value, meanValue, stdDev) => {
    if (!Number.isFinite(value) || !Number.isFinite(meanValue) || !Number.isFinite(stdDev) || stdDev < 0.0001) return null;
    return rounded((value - meanValue) / stdDev);
  };

  function computeHooperIndex(entry) {
    if (!entry) return null;
    const scores = [entry.fatigueScore, entry.sleepScore, entry.muscleScore, entry.stressScore];
    const valid = scores.filter(Number.isFinite);
    if (valid.length < 3) return null;
    const sum = valid.reduce((a, b) => a + b, 0);
    const total = valid.length === 4 ? sum : Math.round((sum / valid.length) * 4);
    const averageScore = rounded(sum / valid.length);
    return {
      total,
      average: averageScore,
      fatigue: entry.fatigueScore ?? null,
      sleep: entry.sleepScore ?? null,
      muscle: entry.muscleScore ?? null,
      stress: entry.stressScore ?? null,
    };
  }

  function calculateEWMA(values, alpha) {
    if (!values || !values.length) return null;
    let ewma = values[0];
    for (let i = 1; i < values.length; i++) {
      ewma = alpha * values[i] + (1 - alpha) * ewma;
    }
    return ewma;
  }

  function calculateACWR_EWMA(entries, metricKey = "loadScore", minEntries = ANALYSIS_CONFIG.minAcwrEntries) {
    if (!entries || entries.length < minEntries) return null;
    const values = entries
      .slice(0, 28)
      .map((e) => (typeof e === "number" ? e : e?.[metricKey]))
      .filter(Number.isFinite);

    if (values.length < minEntries) return null;

    const chronological = values.slice().reverse();
    const acuteAlpha = 0.25;
    const chronicAlpha = chronological.length >= 20 ? 0.069 : 2 / (chronological.length + 1);

    const acuteEWMA = calculateEWMA(chronological, acuteAlpha);
    const chronicEWMA = calculateEWMA(chronological, chronicAlpha);

    if (!chronicEWMA || chronicEWMA === 0) return null;
    return rounded(acuteEWMA / chronicEWMA);
  }

  function calculateACWR(entries, metricKey = "loadScore", minEntries = ANALYSIS_CONFIG.minAcwrEntries) {
    if (!entries || entries.length < minEntries) return null;
    const values = entries
      .slice(0, 28)
      .map((e) => (typeof e === "number" ? e : e?.[metricKey]))
      .filter(Number.isFinite);

    if (values.length < minEntries) return null;

    const acuteCount = Math.min(7, Math.max(3, Math.floor(values.length / 3)));
    const acuteValues = values.slice(0, acuteCount);
    const acuteMean = mean(acuteValues);
    const chronicMean = mean(values);

    if (!chronicMean || chronicMean === 0) return null;
    return rounded(acuteMean / chronicMean);
  }

  function getACWRZone(acwr) {
    if (!Number.isFinite(acwr)) {
      return { zone: "unknown", label: "Indisponível", tone: "neutral", color: "#94a3b8" };
    }
    if (acwr < 0.8) {
      return { zone: "undertraining", label: "Destreinamento (<0.80)", tone: "info", color: "#38bdf8" };
    }
    if (acwr <= 1.3) {
      return { zone: "optimal", label: "Faixa Ideal (0.80–1.30)", tone: "success", color: "#22c55e" };
    }
    if (acwr <= 1.5) {
      return { zone: "warning", label: "Atenção Moderada (1.31–1.49)", tone: "warning", color: "#eab308" };
    }
    return { zone: "danger", label: "Risco Alto (≥1.50)", tone: "danger", color: "#ef4444" };
  }

  const withinDays = (entry, updatedAtIso, days) => {
    const date = Date.parse(entry?.timestampIso || "");
    const anchor = Date.parse(updatedAtIso || "");
    const end = new Date(anchor);
    const start = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - days + 1);
    return Number.isFinite(date) && Number.isFinite(anchor) && date <= anchor && date >= start;
  };

  const recentEntries = (athlete, updatedAtIso, days = ANALYSIS_CONFIG.reportWeekDays) =>
    (athlete.entries || []).filter((entry) => withinDays(entry, updatedAtIso, days));

  const getAnalysisEligibleAthletes = (athletes, updatedAtIso, options = {}) =>
    athletes.filter((athlete) =>
      recentEntries(athlete, updatedAtIso, options.days ?? ANALYSIS_CONFIG.activityWindowDays).length > 0
    );

  // Source labels: sleep 1 = "muito tranquilo", 5 = "insônia";
  // mood 1 = "muito bom humor", 5 = "muito triste".
  function computeRecoveryScore(entry) {
    const value = mean([
      Number.isFinite(entry.fatigueScore) ? 6 - entry.fatigueScore : null,
      Number.isFinite(entry.stressScore) ? 6 - entry.stressScore : null,
      Number.isFinite(entry.muscleScore) ? 6 - entry.muscleScore : null,
      Number.isFinite(entry.sleepScore) ? 6 - entry.sleepScore : null,
      Number.isFinite(entry.moodScore) ? 6 - entry.moodScore : null,
      Number.isFinite(entry.painLevel) ? 5 - Math.min(10, Math.max(0, entry.painLevel)) / 2 : null,
    ]);
    return value === null ? null : rounded(Math.max(0, Math.min(5, value)));
  }

  function percentile(values, value) {
    if (!Number.isFinite(value) || !values.length) return null;
    const valid = values.filter(Number.isFinite);
    return valid.length
      ? Math.round(((valid.filter((item) => item < value).length + valid.filter((item) => item === value).length / 2) / valid.length) * 100)
      : null;
  }

  function personalBaseline(athlete, metricKey) {
    const entries = athlete.entries || [];
    const currentValues = entries.slice(0, ANALYSIS_CONFIG.recentWindowEntries).map((entry) => entry[metricKey]);
    const current =
      currentValues.length === ANALYSIS_CONFIG.recentWindowEntries && currentValues.every(Number.isFinite)
        ? rounded(mean(currentValues))
        : null;
    const chronological = entries.slice().reverse();
    const windows = [];
    for (let index = 0; index <= chronological.length - ANALYSIS_CONFIG.recentWindowEntries; index += 1) {
      const values = chronological.slice(index, index + ANALYSIS_CONFIG.recentWindowEntries).map((entry) => entry[metricKey]);
      if (values.every(Number.isFinite)) windows.push(rounded(mean(values)));
    }
    // The current window is never part of its own reference distribution.
    if (windows.length) windows.pop();

    const stdDev = windows.length >= 2 ? rounded(standardDeviation(windows)) : null;
    const meanVal = windows.length ? mean(windows) : null;
    const zScore =
      current !== null && meanVal !== null && stdDev !== null && stdDev > 0
        ? computeZScore(current, meanVal, stdDev)
        : null;

    return {
      current,
      baselineCount: windows.length,
      percentile: windows.length >= ANALYSIS_CONFIG.minPersonalBaselineWindows ? percentile(windows, current) : null,
      stdDev,
      zScore,
    };
  }

  function buildAttentionItems(athletes, updatedAtIso) {
    const eligible = getAnalysisEligibleAthletes(athletes, updatedAtIso, { days: ANALYSIS_CONFIG.reportWeekDays });
    const byTeam = new Map();
    eligible.forEach((athlete) => {
      if (!byTeam.has(athlete.category)) byTeam.set(athlete.category, []);
      byTeam.get(athlete.category).push(athlete);
    });
    return eligible
      .map((athlete) => {
        const entries = recentEntries(athlete, updatedAtIso).slice(0, 3);
        const latest = entries[0];
        const baseline = personalBaseline(athlete, "loadScore");
        const recoveryBaseline = personalBaseline(athlete, "recoveryScore");
        const stressBaseline = personalBaseline(athlete, "stressScore");
        const persistent = (key, predicate) =>
          entries.length === 3 && entries.filter((entry) => predicate(entry[key])).length >= 2;
        const signals = [];
        const add = (domain, reason, strength, absolute = 0, persistence = false) =>
          signals.push({ domain, reason, strength, absolute, persistence });

        if (Number.isFinite(latest.painLevel) && latest.painLevel >= 6) {
          add("pain", `Dor ${latest.painLevel}/10`, 3, latest.painLevel);
        }
        if (Number.isFinite(latest.recoveryScore) && latest.recoveryScore <= 2.2) {
          add("recovery", `Recuperação ${latest.recoveryScore}/5`, 3, 5 - latest.recoveryScore);
        }
        if (persistent("fatigueScore", (value) => Number.isFinite(value) && value >= 4)) {
          add("fatigue", "Fadiga alta em 2 das 3 respostas", 2, 0, true);
        }
        if (persistent("stressScore", (value) => Number.isFinite(value) && value >= 4)) {
          add("stress", "Estresse alto em 2 das 3 respostas", 2, 0, true);
        }
        if (persistent("recoveryScore", (value) => Number.isFinite(value) && value <= 2.8)) {
          add("recovery", "Recuperação baixa em 2 das 3 respostas", 2, 0, true);
        }

        // Z-Score alerts (pico agudo estatístico em relação ao histórico individual)
        if (baseline.zScore !== null && baseline.zScore >= 1.8 && baseline.current >= 3) {
          add("load", `Desgaste subiu rápido (Z-Score +${baseline.zScore})`, 2, baseline.zScore);
        } else if (baseline.percentile >= 85 && baseline.current >= 3) {
          add("load", "Desgaste acima do padrão pessoal", 1);
        }

        if (recoveryBaseline.zScore !== null && recoveryBaseline.zScore <= -1.8) {
          add("recovery", `Recuperação despencou (Z-Score ${recoveryBaseline.zScore})`, 2, Math.abs(recoveryBaseline.zScore));
        } else if (recoveryBaseline.percentile !== null && recoveryBaseline.percentile <= 15 && Number.isFinite(recoveryBaseline.current)) {
          add("recovery", "Recuperação abaixo do padrão pessoal", 1);
        }

        if (stressBaseline.zScore !== null && stressBaseline.zScore >= 1.8 && stressBaseline.current >= 3) {
          add("stress", `Estresse subiu rápido (Z-Score +${stressBaseline.zScore})`, 2, stressBaseline.zScore);
        } else if (stressBaseline.percentile >= 85 && stressBaseline.current >= 3) {
          add("stress", "Estresse acima do padrão pessoal", 1);
        }

        // ACWR Exponencial (EWMA) alert
        const acwrEWMA = calculateACWR_EWMA(athlete.entries, "loadScore");
        if (acwrEWMA !== null && acwrEWMA >= 1.5) {
          add("load", `Razão ACWR Exponencial em zona de risco (${acwrEWMA})`, 3, acwrEWMA);
        } else if (acwrEWMA !== null && acwrEWMA < 0.8) {
          add("load", `Razão ACWR Exponencial em zona de destreinamento (${acwrEWMA})`, 1, acwrEWMA);
        }

        // Índice Hooper alert
        const hooper = computeHooperIndex(latest);
        if (hooper && hooper.total >= 16) {
          add("wellness", `Índice Hooper crítico (${hooper.total}/20)`, 2, hooper.total);
        }

        if (!signals.length) return null;
        signals.sort(
          (a, b) =>
            b.strength - a.strength ||
            b.absolute - a.absolute ||
            Number(b.persistence) - Number(a.persistence)
        );
        const domains = new Set(signals.map((signal) => signal.domain));
        const strong = signals[0].strength === 3;
        const combined = domains.size >= 2 && signals.some((signal) => signal.strength >= 2);
        const level = strong || combined ? "Atenção alta" : signals.some((signal) => signal.strength >= 2) ? "Atenção" : "Acompanhar";
        const tone = level === "Atenção alta" ? "high" : level === "Atenção" ? "medium" : "watch";
        const teamValues = (byTeam.get(athlete.category) || [])
          .map((item) => personalBaseline(item, "loadScore").current)
          .filter(Number.isFinite);
        return {
          athlete,
          level,
          tone,
          primaryReason: signals[0].reason,
          secondaryReasons: signals.slice(1, 3).map((signal) => signal.reason),
          metrics: {
            load: baseline.current,
            recovery: latest.recoveryScore,
            stress: latest.stressScore,
            acwr: acwrEWMA,
            hooper: hooper?.total ?? null,
            zScore: baseline.zScore,
          },
          dataQuality: {
            recentCount: entries.length,
            baselineCount: baseline.baselineCount,
            note:
              entries.length < 3
                ? "Base recente reduzida"
                : baseline.percentile === null
                ? "Base histórica insuficiente"
                : "",
          },
          context: {
            personalPercentile: baseline.percentile,
            teamPercentile:
              teamValues.length >= ANALYSIS_CONFIG.minTeamPercentileN
                ? percentile(teamValues, baseline.current)
                : null,
          },
          absoluteStrength: signals[0].absolute,
          persistenceCount: signals.filter((signal) => signal.persistence).length,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          ({ high: 0, medium: 1, watch: 2 })[a.tone] - ({ high: 0, medium: 1, watch: 2 })[b.tone] ||
          b.absoluteStrength - a.absoluteStrength ||
          b.persistenceCount - a.persistenceCount ||
          Date.parse(b.athlete.latest?.timestampIso || b.athlete.entries?.[0]?.timestampIso || 0) -
            Date.parse(a.athlete.latest?.timestampIso || a.athlete.entries?.[0]?.timestampIso || 0) ||
          a.athlete.name.localeCompare(b.athlete.name, "pt-BR")
      );
  }

  return {
    ANALYSIS_CONFIG,
    computeRecoveryScore,
    getAnalysisEligibleAthletes,
    recentEntries,
    personalBaseline,
    buildAttentionItems,
    standardDeviation,
    computeZScore,
    computeHooperIndex,
    calculateEWMA,
    calculateACWR,
    calculateACWR_EWMA,
    getACWRZone,
  };
});
