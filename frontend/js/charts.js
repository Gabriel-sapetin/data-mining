const chartInstances = {};
const riskColors = ["#49d990", "#ffd760", "#ffb23f", "#ff5c67", "#8b5cf6"];
const scatterColors = ["#8b5cf6", "#d946b8", "#39d8c8", "#ff7a38", "#58a6ff"];
if (window.Chart) {
  Chart.defaults.color = "#d9deea";
  Chart.defaults.borderColor = "rgba(169, 176, 194, 0.22)";
  Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
}

// Replaces an existing Chart.js instance on the same canvas.
function replaceChart(canvasId, config) {
  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
  const canvas = document.getElementById(canvasId);
  chartInstances[canvasId] = new Chart(canvas, applyChartTheme(canvas, config));
}

function applyChartTheme(canvas, config) {
  const isDarkCard = Boolean(canvas?.closest(".hist-cell"));
  const textColor = isDarkCard ? "#d9deea" : "#25304a";
  const mutedColor = isDarkCard ? "#a9b0c2" : "#5f6d86";
  const gridColor = isDarkCard ? "rgba(169, 176, 194, 0.22)" : "rgba(37, 48, 74, 0.12)";

  config.options = config.options || {};
  config.options.plugins = config.options.plugins || {};
  config.options.plugins.legend = {
    labels: { color: textColor, boxWidth: 36 },
    ...(config.options.plugins.legend || {})
  };

  if (config.options.scales) {
    Object.keys(config.options.scales).forEach((axis) => {
      const scale = config.options.scales[axis] || {};
      scale.grid = { color: gridColor, ...(scale.grid || {}) };
      scale.ticks = { color: mutedColor, ...(scale.ticks || {}) };
      scale.title = {
        color: textColor,
        font: { weight: "700" },
        ...(scale.title || {})
      };
      config.options.scales[axis] = scale;
    });
  }

  return config;
}

// ── Elbow & Silhouette ────────────────────────────────────────────────────────

function renderElbowChart(canvasId, elbowData, bestK) {
  replaceChart(canvasId, {
    type: "line",
    data: {
      labels: elbowData.map((p) => p.k),
      datasets: [{
        label: "Inertia",
        data: elbowData.map((p) => p.inertia),
        borderColor: "#39d8c8",
        backgroundColor: elbowData.map((p) => p.k === bestK ? "#d946b8" : "#39d8c8"),
        pointRadius: elbowData.map((p) => p.k === bestK ? 8 : 4),
        tension: 0,
        borderWidth: 2
      }]
    },
    options: baseLineOptions("K", "Inertia")
  });
}

function renderSilhouetteChart(canvasId, elbowData, bestK) {
  replaceChart(canvasId, {
    type: "line",
    data: {
      labels: elbowData.map((p) => p.k),
      datasets: [{
        label: "Silhouette",
        data: elbowData.map((p) => p.silhouette),
        borderColor: "#ff7a38",
        backgroundColor: elbowData.map((p) => p.k === bestK ? "#d946b8" : "#ff7a38"),
        pointRadius: elbowData.map((p) => p.k === bestK ? 8 : 4),
        tension: 0,
        borderWidth: 2
      }]
    },
    options: baseLineOptions("K", "Silhouette Score")
  });
}

// ── PCA Scatter ───────────────────────────────────────────────────────────────

function renderScatterChart(canvasId, pcaPoints) {
  const clusters = [...new Set(pcaPoints.map((p) => p.cluster))].sort();
  const datasets = clusters.map((c, i) => ({
    label: `Cluster ${c}`,
    data: pcaPoints.filter((p) => p.cluster === c && !p.is_centroid),
    parsing: { xAxisKey: "x", yAxisKey: "y" },
    backgroundColor: scatterColors[i % scatterColors.length],
    pointRadius: 5
  }));
  datasets.push({
    label: "Centroids",
    data: pcaPoints.filter((p) => p.is_centroid),
    parsing: { xAxisKey: "x", yAxisKey: "y" },
    backgroundColor: "#111827",
    pointStyle: "crossRot",
    pointRadius: 12,
    borderWidth: 3
  });
  replaceChart(canvasId, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: "PC1" } },
        y: { title: { display: true, text: "PC2" } }
      }
    }
  });
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function renderBarChart(canvasId, barData, clusterCount) {
  const labels = Object.keys(barData);
  const datasets = Array.from({ length: clusterCount }, (_, c) => ({
    label: `Cluster ${c}`,
    data: labels.map((l) => barData[l][c]),
    backgroundColor: scatterColors[c % scatterColors.length]
  }));
  replaceChart(canvasId, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } }
    }
  });
}

// ── Pie / Doughnut ────────────────────────────────────────────────────────────

function renderPieChart(canvasId, pieData) {
  replaceChart(canvasId, {
    type: "doughnut",
    data: {
      labels: pieData.labels,
      datasets: [{ data: pieData.counts, backgroundColor: riskColors }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// ── Feature Histograms ────────────────────────────────────────────────────────

function renderHistogramChart(canvasId, featureArrays) {
  const featureNames = Object.keys(featureArrays);
  // Build binned data for all features as grouped bar chart
  const binCount = 15;
  const datasets = featureNames.map((name, i) => {
    const values = featureArrays[name];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / binCount || 1;
    const bins = Array(binCount).fill(0);
    values.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / step), binCount - 1);
      bins[idx]++;
    });
    return {
      label: name,
      data: bins,
      backgroundColor: scatterColors[i % scatterColors.length],
      borderColor: "white",
      borderWidth: 1
    };
  });
  const labels = Array.from({ length: binCount }, (_, i) => `Bin ${i + 1}`);
  replaceChart(canvasId, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { title: { display: true, text: "Bins" } },
        y: { title: { display: true, text: "Count" } }
      }
    }
  });
}

// Renders a single-feature histogram
function renderSingleHistogram(canvasId, featureName, values) {
  const binCount = 15;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / binCount || 1;
  const bins = Array(binCount).fill(0);
  const binLabels = [];
  values.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / step), binCount - 1);
    bins[idx]++;
  });
  for (let i = 0; i < binCount; i++) {
    const lo = (min + i * step).toFixed(1);
    const hi = (min + (i + 1) * step).toFixed(1);
    binLabels.push(`${lo}`);
  }
  replaceChart(canvasId, {
    type: "bar",
    data: {
      labels: binLabels,
      datasets: [{
        label: featureName,
        data: bins,
        backgroundColor: "#6366f1",
        borderColor: "white",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: featureName } },
        y: { title: { display: true, text: "Count" } }
      }
    }
  });
}

// ── Scatter: Age vs BMI / Sugar vs Cholesterol ────────────────────────────────

function renderFeatureScatter(canvasId, points, xLabel, yLabel, title) {
  const clusters = [...new Set(points.map((p) => p.cluster))].sort();
  const datasets = clusters.map((c, i) => ({
    label: `Cluster ${c}`,
    data: points.filter((p) => p.cluster === c),
    parsing: { xAxisKey: "x", yAxisKey: "y" },
    backgroundColor: scatterColors[i % scatterColors.length],
    pointRadius: 5
  }));
  replaceChart(canvasId, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { title: { display: true, text: xLabel } },
        y: { title: { display: true, text: yLabel } }
      }
    }
  });
}

// ── Correlation Heatmap (HTML table) ──────────────────────────────────────────

function renderCorrelationTable(containerId, corrMatrix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const labels = corrMatrix.labels;
  const values = corrMatrix.values;

  // Build color-coded table
  let html = '<div class="corr-table-wrap"><table class="corr-table"><thead><tr><th></th>';
  labels.forEach((l) => { html += `<th>${l}</th>`; });
  html += '</tr></thead><tbody>';
  values.forEach((row, i) => {
    html += `<tr><th>${labels[i]}</th>`;
    row.forEach((val) => {
      const color = corrColor(val);
      html += `<td style="background:${color};color:${Math.abs(val) > 0.5 ? '#fff' : '#171717'}">${val.toFixed(2)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function corrColor(val) {
  // Blue for negative, red for positive, white for 0
  const abs = Math.min(Math.abs(val), 1);
  if (val > 0) {
    const r = Math.round(255 - abs * 100);
    const g = Math.round(255 - abs * 150);
    const b = Math.round(255 - abs * 200);
    return `rgb(${Math.max(r, 80)}, ${Math.max(g, 40)}, ${Math.max(b, 40)})`;
  } else {
    const r = Math.round(255 - abs * 200);
    const g = Math.round(255 - abs * 150);
    const b = Math.round(255 - abs * 80);
    return `rgb(${Math.max(r, 40)}, ${Math.max(g, 60)}, ${Math.max(b, 120)})`;
  }
}

// ── Shared Options ────────────────────────────────────────────────────────────

function baseLineOptions(xLabel, yLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "rgba(169,176,194,0.14)" }, title: { display: true, text: xLabel || "K" } },
      y: { grid: { color: "rgba(169,176,194,0.14)" }, title: { display: true, text: yLabel || "" } }
    }
  };
}
