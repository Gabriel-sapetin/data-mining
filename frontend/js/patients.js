let currentPage = 1;
let currentRows = [];
let sortState = { column: "patient_id", direction: "asc" };
const pageSize = 20;

document.addEventListener("DOMContentLoaded", init);

// Initializes upload, search, filter, pagination, and sorting behavior.
function init() {
  const uploadZone = document.getElementById("uploadZone");
  const csvInput = document.getElementById("csvInput");
  uploadZone.addEventListener("click", (event) => {
    if (event.target !== csvInput) csvInput.click();
  });
  csvInput.addEventListener("click", (event) => event.stopPropagation());
  uploadZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadZone.classList.add("dragging");
  });
  uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragging"));
  uploadZone.addEventListener("drop", handleDrop);
  csvInput.addEventListener("change", () => handleUpload(csvInput.files[0]));
  document.getElementById("searchInput").addEventListener("input", debounce(() => fetchAndRender(1), 250));
  document.getElementById("riskFilter").addEventListener("change", () => fetchAndRender(1));
  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => handleSort(th.dataset.sort));
  });
  fetchAndRender(1);
}

// Handles a dropped CSV file.
function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove("dragging");
  handleUpload(event.dataTransfer.files[0]);
}

// Uploads a CSV and refreshes the visible table.
async function handleUpload(file) {
  if (!file) return;
  try {
    const result = await uploadCSV(file);
    showToast(`${result.rows} rows uploaded — auto-calculating features...`);
    await runClustering();
    // Show auto-calc success banner
    const banner = document.getElementById("autoCalcBanner");
    if (banner) banner.classList.remove("hidden");
    fetchAndRender(1);
    showToast(`Done! BMI, clusters & risk labels calculated for ${result.rows} patients.`);
  } catch (error) {
    showToast(error.message, true);
  }
}

// Fetches patients from the API and renders the current page.
async function fetchAndRender(page) {
  currentPage = page;
  const search = document.getElementById("searchInput").value.trim();
  const filter = document.getElementById("riskFilter").value;
  try {
    const result = await getPatients(currentPage, pageSize, search, filter);
    currentRows = result.data;
    renderRows(applySort(currentRows));
    renderPagination(result.total, result.page, result.page_size);
    document.getElementById("resultCount").textContent = `Showing ${result.data.length} of ${result.total} patients`;
    document.getElementById("emptyState").classList.toggle("hidden", result.total > 0);
  } catch (error) {
    showToast(error.message, true);
  }
}

// Builds table rows for the patient list.
function renderRows(patients) {
  document.getElementById("patientRows").innerHTML = patients.map((patient) => `
    <tr>
      <td>${patient.patient_id}</td>
      <td>${patient.age}</td>
      <td>${patient.bmi}</td>
      <td>${patient.blood_sugar}</td>
      <td>${patient.cholesterol}</td>
      <td>${patient.bp_systolic}</td>
      <td>${patient.visits_per_year}</td>
      <td>${patient.medication_count}</td>
      <td>${getRiskBadge(patient.risk_label)}</td>
    </tr>
  `).join("");
}

// Builds pagination controls for the current result set.
function renderPagination(total, page, size) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const buttons = [];
  buttons.push(`<button ${page === 1 ? "disabled" : ""} data-page="${page - 1}">Prev</button>`);
  for (let index = 1; index <= totalPages; index += 1) {
    buttons.push(`<button class="${index === page ? "active" : ""}" data-page="${index}">${index}</button>`);
  }
  buttons.push(`<button ${page === totalPages ? "disabled" : ""} data-page="${page + 1}">Next</button>`);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = buttons.join("");
  pagination.querySelectorAll("button[data-page]").forEach((button) => {
    button.addEventListener("click", () => fetchAndRender(Number(button.dataset.page)));
  });
}

// Returns the colored risk badge markup.
function getRiskBadge(riskLabel) {
  const key = (riskLabel || "Unclustered").toLowerCase().split(" ")[0];
  return `<span class="risk-badge risk-${key}">${riskLabel || "Unclustered"}</span>`;
}

// Sorts the currently visible page by a clicked column.
function handleSort(column) {
  sortState = {
    column,
    direction: sortState.column === column && sortState.direction === "asc" ? "desc" : "asc"
  };
  renderRows(applySort(currentRows));
}

// Applies the current sort state to the visible page rows.
function applySort(rows) {
  return [...rows].sort((a, b) => {
    const left = a[sortState.column];
    const right = b[sortState.column];
    const result = typeof left === "number" ? left - right : String(left).localeCompare(String(right));
    return sortState.direction === "asc" ? result : -result;
  });
}

// Delays high-frequency input events.
function debounce(callback, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}
