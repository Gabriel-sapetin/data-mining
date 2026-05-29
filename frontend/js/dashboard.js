/**
 * dashboard.js
 * Visualization picker dashboard — users choose what to view from categorized menus.
 */

const statsMap = {
  totalPatients: "total_patients",
  numClusters:   "num_clusters",
  avgBmi:        "avg_bmi",
  avgVisits:     "avg_visits"
};

// ── Visualization catalog ─────────────────────────────────────────────────────
// Each category has a display name and a list of items.
// Each item has: label (shown in picker), codeKey (for code-viewer), render (fn).

const VIZ_CATALOG = [
  {
    category: "Explore Data (EDA)",
    items: [
      { key: "hist_all",       label: "All Distributions",              codeKey: "histogram",
        description: "Displays a histogram for every numerical feature in the dataset side by side. Purpose: Provides a quick visual overview of how each clinical variable (Age, BMI, Blood Sugar, etc.) is distributed across the patient population. This helps identify skewness, outliers, and whether features are normally distributed — all of which influence how well K-Means clustering will perform." },
      { key: "hist_age",       label: "Age",                            codeKey: "histogram", feature: "Age",
        description: "Shows the frequency distribution of patient ages across the dataset. Purpose: Reveals the age demographics of the clinic population — whether it skews younger or older. Meaning: Age is a primary risk factor in healthcare; understanding its distribution helps interpret why certain clusters may group older, higher-risk patients together." },
      { key: "hist_bmi",       label: "BMI",                            codeKey: "histogram", feature: "BMI",
        description: "Shows the frequency distribution of Body Mass Index (BMI) values. Purpose: BMI indicates whether patients fall into underweight, normal, overweight, or obese categories. Meaning: A right-skewed distribution suggests many patients have elevated BMI, which correlates with chronic conditions like diabetes and hypertension — key factors in risk-based clustering." },
      { key: "hist_sugar",     label: "Blood Sugar",                    codeKey: "histogram", feature: "BloodSugar_mg_dL",
        description: "Shows the frequency distribution of fasting blood sugar levels (mg/dL). Purpose: Blood sugar is a critical marker for diabetes screening. Meaning: Patients with blood sugar above 126 mg/dL are typically diabetic; this histogram reveals how many patients may fall into pre-diabetic or diabetic ranges, influencing their cluster assignment." },
      { key: "hist_chol",      label: "Cholesterol",                    codeKey: "histogram", feature: "CholesterolLevel",
        description: "Shows the frequency distribution of total cholesterol levels. Purpose: Cholesterol is a major cardiovascular risk indicator. Meaning: Higher cholesterol values contribute to heart disease risk. The distribution shape helps the algorithm separate low-risk patients from those needing lipid management." },
      { key: "hist_bp",        label: "Systolic BP",                    codeKey: "histogram", feature: "BloodPressure_Systolic",
        description: "Shows the frequency distribution of systolic blood pressure readings. Purpose: Systolic BP is the top number in a blood pressure reading and indicates arterial pressure during heartbeats. Meaning: Values above 140 mmHg suggest hypertension. This distribution helps assess how prevalent high blood pressure is in the patient pool, directly affecting cluster risk profiles." },
      { key: "hist_visits",    label: "Visits/Year",                    codeKey: "histogram", feature: "VisitsPerYear",
        description: "Shows how often patients visit the clinic per year. Purpose: Visit frequency is a proxy for care utilization and disease burden. Meaning: Patients who visit frequently may have chronic or complex conditions requiring ongoing management. This feature helps separate low-maintenance patients from high-utilization ones in the clustering model." },
      { key: "hist_meds",      label: "Medications",                    codeKey: "histogram", feature: "MedicationCount",
        description: "Shows the distribution of the number of medications each patient takes. Purpose: Medication count reflects treatment complexity and comorbidity burden. Meaning: Patients on many medications typically have multiple conditions being managed simultaneously. Higher counts push patients toward higher-risk clusters." },
      { key: "scatter_eda",    label: "Age vs BMI",                     codeKey: "scatter_eda",
        description: "Plots each patient as a point using Age on the X-axis and BMI on the Y-axis, before any clustering is applied. Purpose: Reveals the natural relationship between age and body mass in the raw data. Meaning: Visual clusters or trends in this scatter plot hint at natural patient groupings that K-Means will later formalize. It also exposes whether older patients tend to have higher BMI." },
      { key: "corr",           label: "Correlation Heatmap",            codeKey: "correlation",
        description: "Displays a matrix showing the Pearson correlation coefficient between every pair of numerical features. Purpose: Identifies which features move together (positive correlation) or inversely (negative correlation). Meaning: High correlations (close to 1.0 or -1.0) indicate redundant features. For example, if Blood Sugar and Cholesterol are highly correlated, the clustering algorithm may weight that relationship heavily. This helps validate feature selection for K-Means." },
    ]
  },
  {
    category: "Optimal K Selection",
    items: [
      { key: "elbow",        label: "Elbow Method",               codeKey: "elbow",
        description: "Plots the total within-cluster sum of squares (inertia) for different values of K (number of clusters). Purpose: The 'elbow' point — where the rate of decrease sharply changes — indicates the optimal number of clusters. Meaning: Adding more clusters beyond the elbow provides diminishing returns in compactness. The highlighted point marks the algorithmically selected best K for this dataset." },
      { key: "silhouette",   label: "Silhouette Score",           codeKey: "silhouette",
        description: "Plots the silhouette score for each value of K tested. The silhouette score measures how similar each patient is to its own cluster compared to neighboring clusters, ranging from -1 to 1. Purpose: A higher silhouette score means clusters are well-separated and cohesive. Meaning: The K value with the highest score produces the most distinct, meaningful patient groups. The highlighted point shows the best K chosen by this metric." },
    ]
  },
  {
    category: "Cluster Visualizations",
    items: [
      { key: "cl_age_bmi",   label: "Clusters – Age vs BMI",       codeKey: "scatter_eda",
        description: "Scatter plot of Age vs BMI with each point colored by its assigned cluster. Purpose: Shows how the K-Means algorithm separated patients based on the two most intuitive clinical features. Meaning: Distinct color regions indicate clear separation between risk groups. Overlap suggests those features alone don't fully explain the grouping — other features like blood sugar or visits contribute." },
      { key: "cl_sugar_chol", label: "Clusters – Sugar vs Chol",   codeKey: "scatter_eda",
        description: "Scatter plot of Blood Sugar vs Cholesterol with cluster color-coding. Purpose: Visualizes how metabolic markers define patient groupings. Meaning: Clusters that separate along these axes suggest the algorithm identified distinct metabolic profiles — e.g., patients with both high sugar and high cholesterol forming a critical-risk cluster." },
      { key: "pca",          label: "PCA Cluster View",             codeKey: "pca",
        description: "Displays all patients projected onto the first two Principal Components (PC1 and PC2) from PCA, colored by cluster, with centroids marked. Purpose: PCA reduces all 7 features into 2 dimensions for visualization while preserving maximum variance. Meaning: Well-separated clusters in PCA space confirm that K-Means found genuinely different patient profiles. Centroids (cross markers) represent the 'average patient' of each cluster." },
      { key: "bar",          label: "Average Feature Values",       codeKey: "bar",
        description: "Grouped bar chart comparing the average value of each clinical feature across all clusters. Purpose: Provides a direct numeric comparison of cluster profiles. Meaning: Taller bars in one cluster for features like Blood Sugar, Cholesterol, or Visits indicate that cluster represents a higher-risk population. This chart is essential for interpreting what makes each cluster clinically distinct." },
      { key: "pie",          label: "Patient Distribution",         codeKey: "pie",
        description: "Doughnut chart showing the proportion of patients assigned to each cluster. Purpose: Reveals cluster balance — whether patients are evenly distributed or concentrated in certain groups. Meaning: A very large cluster may represent the 'general population' while smaller clusters capture niche risk groups. Extremely small clusters may indicate outlier patients or that K is too high." },
    ]
  }
];

// ── State ─────────────────────────────────────────────────────────────────────

let _clusterData = null;  // Cached cluster API result
let _activeCat = 0;
let _activeItem = null;
let _isFullView = false;

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshBtn").addEventListener("click", forceRunAnalysis);
  document.getElementById("chartFullView").addEventListener("click", toggleFullView);
  document.getElementById("chartViewCode").addEventListener("click", () => {
    if (_activeItem) openCodeModal(_activeItem.codeKey);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("dashboard-full-view-open")) {
      toggleFullView(false);
    }
  });

  // Dashboard CSV upload handling
  const uploadBtn = document.getElementById("uploadBtn");
  const dashUploadInput = document.getElementById("dashUploadInput");
  if (uploadBtn && dashUploadInput) {
    uploadBtn.addEventListener("click", () => dashUploadInput.click());
    dashUploadInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const result = await uploadCSV(file);
        showToast(`${result.rows} rows uploaded — auto-calculating features...`);
        await loadDashboard();
        showToast(`Analysis complete! ${result.rows} patients clustered with auto-calculated BMI & risk labels.`);
      } catch (error) {
        showToast(error.message, true);
      }
      dashUploadInput.value = "";
    });
  }

  buildPicker();
  loadDashboard();
});

// ── Picker Builder ────────────────────────────────────────────────────────────

function buildPicker() {
  const catContainer = document.getElementById("vizCategories");
  VIZ_CATALOG.forEach((cat, catIdx) => {
    const btn = document.createElement("button");
    btn.className = "viz-cat-btn" + (catIdx === 0 ? " active" : "");
    btn.textContent = cat.category;
    btn.addEventListener("click", () => selectCategory(catIdx));
    catContainer.appendChild(btn);
  });
  buildItems(0);
}

function buildItems(catIdx) {
  const itemContainer = document.getElementById("vizItems");
  itemContainer.innerHTML = "";
  const items = VIZ_CATALOG[catIdx].items;
  items.forEach((item, itemIdx) => {
    const btn = document.createElement("button");
    btn.className = "viz-item-btn";
    btn.textContent = item.label;
    btn.addEventListener("click", () => selectItem(catIdx, itemIdx));
    itemContainer.appendChild(btn);
  });
}

function selectCategory(catIdx) {
  _activeCat = catIdx;
  document.querySelectorAll(".viz-cat-btn").forEach((btn, i) =>
    btn.classList.toggle("active", i === catIdx));
  buildItems(catIdx);
  // Auto-select the first item in this category
  selectItem(catIdx, 0);
}

function selectItem(catIdx, itemIdx) {
  _activeItem = VIZ_CATALOG[catIdx].items[itemIdx];
  document.querySelectorAll(".viz-item-btn").forEach((btn, i) =>
    btn.classList.toggle("active", i === itemIdx));
  document.getElementById("chartTitle").textContent = _activeItem.label;
  renderActiveChart();
  // Render description below the chart
  renderDescription(_activeItem.description);
}

function toggleFullView(forceState) {
  const chartDisplay = document.getElementById("chartDisplay");
  const fullViewBtn = document.getElementById("chartFullView");
  if (!chartDisplay || !_activeItem) return;

  _isFullView = typeof forceState === "boolean" ? forceState : !_isFullView;
  chartDisplay.classList.toggle("full-view", _isFullView);
  document.body.classList.toggle("dashboard-full-view-open", _isFullView);
  fullViewBtn.textContent = _isFullView ? "Exit Full View" : "Full View";

  window.setTimeout(() => {
    renderActiveChart();
    renderDescription(_activeItem.description);
  }, 80);
}

// ── Data Loading ──────────────────────────────────────────────────────────────

async function loadDashboard() {
  try {
    // Load stats immediately for instant feedback
    const statsPromise = getStats().catch(() => null);

    // Try cached cluster results first (instant), fallback to full pipeline
    let clusterResult;
    try {
      clusterResult = await getClusterCached();
    } catch {
      clusterResult = await runClustering();
    }
    _clusterData = clusterResult;

    const stats = await statsPromise;
    if (stats) {
      Object.entries(statsMap).forEach(([id, key]) => {
        document.getElementById(id).textContent = stats[key];
      });
    }

    // Populate stat card descriptions
    Object.keys(STAT_CARD_DESCRIPTIONS).forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const card = el.closest(".stat-card");
        if (card && !card.querySelector(".stat-desc")) {
          const p = document.createElement("p");
          p.className = "stat-desc";
          p.textContent = STAT_CARD_DESCRIPTIONS[id];
          card.appendChild(p);
        }
      }
    });

    document.getElementById("emptyState").classList.add("hidden");
    document.getElementById("vizPicker").classList.remove("hidden");
    document.getElementById("chartDisplay").classList.remove("hidden");

    // Auto-select first category + first item
    selectCategory(0);
  } catch (error) {
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("vizPicker").classList.add("hidden");
    document.getElementById("chartDisplay").classList.add("hidden");
    showToast(error.message, true);
  }
}

// Force a fresh analysis run (bypasses cache) — used by Run Analysis button
async function forceRunAnalysis() {
  try {
    const clusterResult = await runClustering();
    _clusterData = clusterResult;
    const stats = await getStats();
    Object.entries(statsMap).forEach(([id, key]) => {
      document.getElementById(id).textContent = stats[key];
    });

    document.getElementById("emptyState").classList.add("hidden");
    document.getElementById("vizPicker").classList.remove("hidden");
    document.getElementById("chartDisplay").classList.remove("hidden");
    selectCategory(0);
    showToast("Analysis refreshed successfully!");
  } catch (error) {
    showToast(error.message, true);
  }
}

// ── Chart Rendering Router ────────────────────────────────────────────────────

// ── Description Renderer ──────────────────────────────────────────────────────

const HIST_ALL_DESCRIPTIONS = {
  "Age": "Distribution of patient ages. Reveals the demographic spread and whether the population skews younger or older, which directly impacts risk clustering.",
  "BMI": "Distribution of Body Mass Index values. Indicates prevalence of underweight, normal, overweight, and obese patients in the dataset.",
  "BloodSugar_mg_dL": "Distribution of fasting blood sugar levels (mg/dL). Highlights how many patients may fall into diabetic (>126) or pre-diabetic ranges.",
  "CholesterolLevel": "Distribution of total cholesterol levels. Higher values increase cardiovascular risk and influence cluster separation.",
  "BloodPressure_Systolic": "Distribution of systolic blood pressure. Values above 140 mmHg indicate hypertension, a key contributor to risk grouping.",
  "VisitsPerYear": "Distribution of annual clinic visits. Higher frequency suggests chronic conditions requiring ongoing management.",
  "MedicationCount": "Distribution of medications per patient. Reflects treatment complexity and comorbidity burden across the population."
};

const STAT_CARD_DESCRIPTIONS = {
  totalPatients: "The total number of patient records loaded into the system. This count determines the dataset size used for clustering analysis.",
  numClusters: "The optimal number of clusters (K) selected by the algorithm using the Elbow and Silhouette methods. Each cluster represents a distinct patient risk group.",
  avgBmi: "The average Body Mass Index across all patients. BMI is a key health indicator — values above 25 suggest overweight, above 30 indicate obesity.",
  avgVisits: "The average number of clinic visits per patient per year. Higher averages suggest the patient population has significant ongoing care needs."
};

function renderDescription(text) {
  const descEl = document.getElementById("chartDescription");
  if (!descEl) return;
  if (text) {
    descEl.textContent = text;
    descEl.classList.remove("hidden");
  } else {
    descEl.classList.add("hidden");
  }
}

function renderActiveChart() {
  if (!_clusterData || !_activeItem) return;

  const chartArea = document.getElementById("chartArea");
  const d = _clusterData;

  // Correlation — HTML table, not canvas
  if (_activeItem.key === "corr") {
    chartArea.innerHTML = '<div id="corrContainer"></div>';
    renderCorrelationTable("corrContainer", d.correlation_matrix);
    return;
  }

  // All Distributions — grid of 7 individual histograms with per-cell descriptions
  if (_activeItem.key === "hist_all") {
    const features = Object.keys(d.feature_arrays);
    chartArea.innerHTML = '<div class="hist-grid">' +
      features.map((name) => `
        <div class="hist-cell">
          <h3 class="hist-cell-title">${name}</h3>
          <canvas id="hist_${name.replace(/[^a-zA-Z0-9]/g, '_')}"></canvas>
          <p class="hist-cell-desc">${HIST_ALL_DESCRIPTIONS[name] || ""}</p>
        </div>
      `).join("") + '</div>';
    features.forEach((name) => {
      const canvasId = `hist_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      renderSingleHistogram(canvasId, name, d.feature_arrays[name]);
    });
    return;
  }

  // Individual feature histogram
  if (_activeItem.key.startsWith("hist_") && _activeItem.feature) {
    chartArea.innerHTML = '<div class="chart-canvas-wrap"><canvas id="mainChart"></canvas></div>';
    renderSingleHistogram("mainChart", _activeItem.feature, d.feature_arrays[_activeItem.feature]);
    return;
  }

  // All other charts — single canvas
  chartArea.innerHTML = '<div class="chart-canvas-wrap"><canvas id="mainChart"></canvas></div>';

  switch (_activeItem.key) {
    case "scatter_eda":
      renderPlainScatter("mainChart", d.scatter_data.age_vs_bmi, "Age", "BMI");
      break;

    case "elbow":
      renderElbowChart("mainChart", d.elbow_data, d.best_k);
      break;

    case "silhouette":
      renderSilhouetteChart("mainChart", d.elbow_data, d.best_k);
      break;

    case "cl_age_bmi":
      renderFeatureScatter("mainChart", d.scatter_data.age_vs_bmi, "Age", "BMI");
      break;

    case "cl_sugar_chol":
      renderFeatureScatter("mainChart", d.scatter_data.sugar_vs_cholesterol, "Blood Sugar (mg/dL)", "Cholesterol Level");
      break;

    case "pca":
      renderScatterChart("mainChart", d.pca_points);
      break;

    case "bar":
      renderBarChart("mainChart", d.cluster_bar_data, d.best_k);
      break;

    case "pie":
      renderPieChart("mainChart", d.pie_data);
      break;
  }
}

// Plain scatter (no clusters — for EDA)
function renderPlainScatter(canvasId, points, xLabel, yLabel) {
  replaceChart(canvasId, {
    type: "scatter",
    data: {
      datasets: [{
        label: `${xLabel} vs ${yLabel}`,
        data: points,
        parsing: { xAxisKey: "x", yAxisKey: "y" },
        backgroundColor: "#6366f1",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: xLabel } },
        y: { title: { display: true, text: yLabel } }
      }
    }
  });
}
