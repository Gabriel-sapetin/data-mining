const API_PORT = "8001";
const BASE_URL = window.location.port === API_PORT ? window.location.origin : `http://127.0.0.1:${API_PORT}`;

// Shows a compact toast message for success and error feedback.
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? "var(--danger)" : "var(--surface-3)";
  toast.style.color = "var(--text)";
  toast.style.borderColor = isError ? "var(--danger)" : "var(--primary-light)";
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3200);
}

// Fetches JSON and throws a useful error when the API rejects a request.
async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || "Request failed");
  }
  return payload;
}

// Uploads a clinic CSV file to the backend.
async function uploadCSV(file) {
  const formData = new FormData();
  formData.append("csv_file", file);
  return requestJson(`${BASE_URL}/api/upload`, { method: "POST", body: formData });
}

// Runs the full K-Means clustering pipeline.
async function runClustering() {
  return requestJson(`${BASE_URL}/api/cluster`, { method: "POST" });
}

// Gets cached cluster results (instant, no re-computation).
async function getClusterCached() {
  return requestJson(`${BASE_URL}/api/cluster/cached`);
}

// Returns a paginated patient slice with optional search and risk filtering.
async function getPatients(page = 1, pageSize = 20, search = "", filter = "") {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (search) params.set("search", search);
  if (filter) params.set("cluster_filter", filter);
  return requestJson(`${BASE_URL}/api/patients?${params.toString()}`);
}

// Gets top-level summary statistics for the current dataset.
async function getStats() {
  return requestJson(`${BASE_URL}/api/stats`);
}

// Gets care recommendations for each risk label.
async function getRecommendations() {
  return requestJson(`${BASE_URL}/api/recommendations`);
}
