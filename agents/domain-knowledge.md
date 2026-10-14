# Conhecimento de Domínio Esportivo · Olympico Club

Este documento detalha as fórmulas, métricas e convenções fisiológicas aplicadas no monitoramento dos atletas do Olympico Club.

---

## 1. Questionário de Bem-Estar e PSR (Percepção Subjetiva de Recuperação)

As abas PSR das planilhas de cada modalidade coletam respostas diárias dos atletas contendo:
- **Fadiga** (Escala 1 a 5, onde 1 = Muito descansado e 5 = Muito cansado)
- **Sono** (Escala 1 a 5, onde 1 = Excelente e 5 = Péssimo)
- **Dor Muscular** (Escala 1 a 5, onde 1 = Nenhuma dor e 5 = Dores intensas)
- **Estresse** (Escala 1 a 5, onde 1 = Relaxado e 5 = Extremamente estressado)
- **Humor** (Escala 1 a 5, onde 1 = Muito positivo e 5 = Muito negativo)
- **Nível de Dor** (Escala 0 a 10 e Local da dor)

> **Atenção à polaridade da planilha:** Valores mais baixos indicam condições mais favoráveis/recuperadas, enquanto valores mais altos indicam maior estresse/desgaste percebido.

---

## 2. Índice Hooper (Hooper & Mackinnon, 1995)

O Índice Hooper original é a soma das 4 variáveis psicofisiológicas principais:
$$\text{Hooper Index} = \text{Fadiga} + \text{Sono} + \text{Dor Muscular} + \text{Estresse}$$

- **Escala Total:** Varia de 4 (estado ideal / sem estresse) a 20 (sobrecarga máxima percebida).
- **Média Hooper (normalizada 1 a 5):** Permite comparação direta na mesma magnitude das perguntas individuais.
- **Utilidade Prática:** Monitora se o atleta está absorvendo a carga de treino ou acumulando fadiga não-funcional antes de sinais clínicos evidentes de overreaching.

---

## 3. Razão Aguda:Crônica (ACWR) e EWMA (Williams et al., 2017)

A relação entre carga aguda (fadiga recente) e crônica (capacidade/condicionamento acumulado) proposta por Gabbett (2016):

$$\text{ACWR} = \frac{\text{Carga Aguda}}{\text{Carga Crônica}}$$

### Zonas de Risco de Lesão (Gabbett Sweet Spot):
- **< 0.80:** Zona de Destreinamento / Risco aumentado por retorno abrupto.
- **0.80 – 1.30:** "Sweet Spot" (Zona ideal de treinamento e adaptação com menor risco relativo de lesão).
- **1.31 – 1.49:** Zona de Atenção (Aumento de risco moderado).
- **≥ 1.50:** "Danger Zone" (Zona de perigo crítico de sobrecarga ou pico desproporcional).

### Adaptação EWMA (Média Móvel Ponderada Exponencialmente):
Como os treinos mais recentes têm maior impacto fisiológico do que treinos de semanas anteriores, o EWMA atribui pesos decrescentes:
$$\text{EWMA}_t = \lambda \cdot \text{Valor}_t + (1 - \lambda) \cdot \text{EWMA}_{t-1}$$

Onde:
$$\lambda_{\text{agudo}} = \frac{2}{N_{\text{agudo}} + 1} \quad (N \approx 3\text{ a }7\text{ dias})$$
$$\lambda_{\text{crônico}} = \frac{2}{N_{\text{crônico}} + 1} \quad (N \approx 21\text{ a }28\text{ dias})$$

### Tratamento de Amostra Reduzida:
Em atletas com menos de 28 check-ins diários (comum em categorias de base com treinos alternados):
- Requer-se um mínimo de 5 a 7 check-ins para estimar o ACWR preliminar.
- Para atletas com histórico insuficiente (< 5 check-ins), exibe-se estado informativo claro ("Em construção: X/5 check-ins"), evitando "N/A" agressivo ou quebra da UI.

---

## 4. Z-Score Individual (Desvios do Próprio Histórico)

O Z-Score compara o estado recente do atleta com sua própria distribuição histórica habitual:

$$Z = \frac{\text{Valor Atual} - \mu_{\text{baseline}}}{\sigma_{\text{baseline}}}$$

- **$Z > +1.5$:** Aumento substancial e rápido no desgaste/fadiga individual.
- **$Z > +2.0$:** Alerta crítico de pico fora de mais de 95% do padrão histórico pessoal.
- **$Z < -1.5$:** Desvio favorável acentuado (recuperação excepcional ou retorno).

---

## 5. Postura de Comunicação com a Comissão Técnica (Treinadores)

- **Soberania do Treinador:** Treinadores são os responsáveis finais pelo planejamento técnico-tático e minutagem dos atletas.
- **Linguagem Descritiva, Não Prescritiva:** Nunca utilize linguagem imperativa ou ordens diretivas ("Reduzir volume", "Conduta do Treinador", "Liberado 100%"). Apresente as métricas como **indicadores de prontidão**, **níveis de tolerância à carga** e **respostas fisiológicas contextuais**.
- **Terminologia Recomendada:**
  - Em vez de "Conduta", use "Prontidão", "Sinalização" ou "Classificação Fisiológica".
  - Em vez de ordens de corte, use "Faixa de Sobrecarga Aguda", "Alerta de Tolerância" ou "Vulnerabilidade Tecidual Acentuada".
