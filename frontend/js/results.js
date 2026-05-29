document.addEventListener("DOMContentLoaded", () => {
  loadResults();
  // Wire View Code buttons with data-code attributes
  document.querySelectorAll(".code-chip-btn[data-code]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openCodeModal(btn.dataset.code);
    });
  });
});

const resultChartInstances = {};

// Loads cluster results and recommendations for the results page.
async function loadResults() {
  try {
    // Try cached results first (instant), fallback to full pipeline
    let clusterResult;
    try {
      clusterResult = await getClusterCached();
    } catch {
      clusterResult = await runClustering();
    }
    const recommendations = await getRecommendations();
    renderClusterCards(clusterResult.cluster_summaries);
    renderInterpretationTable(clusterResult.cluster_summaries);
    renderAccordion(recommendations);
    renderInsightCards();
  } catch (error) {
    showToast(error.message, true);
  }
}

// Generates the cluster summary card grid.
function renderClusterCards(summaries) {
  document.getElementById("clusterCards").innerHTML = summaries.map((item) => `
    <article class="cluster-card risk-border-${riskKey(item.risk_label)}">
      <div class="cluster-card-header">
        <div class="cluster-top">
          <h2>Cluster ${item.cluster_id}</h2>
          ${getRiskBadge(item.risk_label)}
        </div>
        <div class="cluster-actions">
          <button class="chart-chip-btn" data-cluster-chart="${item.cluster_id}">View Chart</button>
          <button class="code-chip-btn" data-code="kmeans">View Code</button>
        </div>
      </div>
      <div class="metric-grid">
        ${metric("Patients", item.patient_count)}
        ${metric("Avg Age", item.avg_age)}
        ${metric("Avg BMI", item.avg_bmi)}
        ${metric("Visits", item.avg_visits)}
        ${metric("Blood Sugar", item.avg_blood_sugar)}
        ${metric("Cholesterol", item.avg_cholesterol)}
      </div>
      <div class="cluster-chart-panel hidden" id="clusterChartPanel-${item.cluster_id}">
        <canvas id="clusterChart-${item.cluster_id}" aria-label="Cluster ${item.cluster_id} profile chart"></canvas>
      </div>
    </article>
  `).join("");
  // Wire click handlers on freshly rendered buttons
  document.querySelectorAll(".cluster-card .code-chip-btn[data-code]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openCodeModal(btn.dataset.code);
    });
  });
  summaries.forEach((item) => {
    const btn = document.querySelector(`[data-cluster-chart="${item.cluster_id}"]`);
    const panel = document.getElementById(`clusterChartPanel-${item.cluster_id}`);
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const isHidden = panel.classList.toggle("hidden");
      btn.textContent = isHidden ? "View Chart" : "Hide Chart";
      if (!isHidden) renderClusterProfileChart(item);
    });
  });
}

// Renders one cluster's averaged clinical profile as a compact bar chart.
function renderClusterProfileChart(item) {
  const canvasId = `clusterChart-${item.cluster_id}`;
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  if (resultChartInstances[canvasId]) resultChartInstances[canvasId].destroy();

  resultChartInstances[canvasId] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Age", "BMI", "Visits", "Blood Sugar", "Cholesterol"],
      datasets: [{
        label: `Cluster ${item.cluster_id}`,
        data: [
          item.avg_age,
          item.avg_bmi,
          item.avg_visits,
          item.avg_blood_sugar,
          item.avg_cholesterol
        ].map(Number),
        backgroundColor: getRiskColor(item.risk_label),
        borderColor: "rgba(255,255,255,0.9)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed.y}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#d9deea", font: { size: 10 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(169, 176, 194, 0.16)" },
          ticks: { color: "#a9b0c2", font: { size: 10 } }
        }
      }
    }
  });
}

// Generates the interpretation rows from live cluster summaries.
function renderInterpretationTable(summaries) {
  document.getElementById("interpretationRows").innerHTML = summaries.map((item) => `
    <tr>
      <td>Cluster ${item.cluster_id}</td>
      <td>${profileFor(item.risk_label)}</td>
      <td>${getRiskBadge(item.risk_label)}</td>
    </tr>
  `).join("");
}

// Builds the recommendation accordion and toggle behavior.
function renderAccordion(recommendations) {
  const accordion = document.getElementById("accordion");
  accordion.innerHTML = Object.entries(recommendations).map(([risk, text], index) => `
    <div class="accordion-item ${index === 0 ? "open" : ""}">
      <button class="accordion-trigger" type="button">
        <span>${risk}</span><span class="chevron">v</span>
      </button>
      <div class="accordion-body"><p>${text}</p></div>
    </div>
  `).join("");
  accordion.querySelectorAll(".accordion-item").forEach((item) => {
    const body = item.querySelector(".accordion-body");
    body.style.maxHeight = item.classList.contains("open") ? `${body.scrollHeight}px` : "0";
    item.querySelector(".accordion-trigger").addEventListener("click", () => {
      item.classList.toggle("open");
      body.style.maxHeight = item.classList.contains("open") ? `${body.scrollHeight}px` : "0";
    });
  });
}

// Injects static notebook-informed insight cards.
function renderInsightCards() {
  const insights = [
    ["Age and BMI separate patient groups", "The PCA view compresses all seven features while preserving the clinical distance patterns used by K-Means."],
    ["VisitsPerYear drives risk language", "Clusters are automatically ordered by average visits so operational intensity maps to care priority."],
    ["Compounding factors mark escalation", "Higher-risk groups tend to combine blood sugar, cholesterol, systolic pressure, and medication burden."]
  ];
  document.getElementById("insightCards").innerHTML = insights.map(([title, text]) => `
    <article class="insight-card">
      <h2>${title}</h2>
      <p>${text}</p>
    </article>
  `).join("");
}

// Returns a color for a risk label.
function getRiskColor(riskLabel) {
  return {
    "Low Risk": "#4CAF82",
    "Moderate Risk": "#F5C842",
    "High Risk": "#F5A623",
    "Critical Risk": "#E05C5C"
  }[riskLabel] || "#1A6FBF";
}

// Returns a lowercase risk key for CSS classes.
function riskKey(riskLabel) {
  return (riskLabel || "default").toLowerCase().split(" ")[0];
}

// Returns a compact metric block for a cluster card.
function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

// Returns a risk-specific profile description.
function profileFor(riskLabel) {
  return {
    "Low Risk": "Younger profile, healthier BMI, rare visits, and minimal medication load.",
    "Moderate Risk": "Middle-aged profile with elevated clinical markers and recurring visits.",
    "High Risk": "Older profile with high BMI, frequent visits, and multiple medications.",
    "Critical Risk": "Highest acuity profile with compounded BP, sugar, cholesterol, and visit burden."
  }[riskLabel] || "Cluster profile is based on feature means and visit intensity.";
}

// Returns the colored risk badge markup.
function getRiskBadge(riskLabel) {
  const key = (riskLabel || "Unclustered").toLowerCase().split(" ")[0];
  return `<span class="risk-badge risk-${key}">${riskLabel || "Unclustered"}</span>`;
}
