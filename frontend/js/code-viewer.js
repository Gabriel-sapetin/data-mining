/**
 * code-viewer.js
 * Manages the Jupyter-style code viewer modal.
 * Call openCodeModal(chartKey) from any chart or card click handler.
 */

// ── Notebook code sections ────────────────────────────────────────────────────

const NOTEBOOK_SECTIONS = {

  setup: {
    title: "notebook.ipynb — Setup",
    tabs: [
      {
        label: "1 · Imports",
        code: `<span class="tok-cmt"># Uncomment if you need to install the libraries</span>
<span class="tok-cmt"># !pip install pandas numpy matplotlib seaborn scikit-learn</span>

<span class="tok-kw">import</span> <span class="tok-cls">pandas</span> <span class="tok-kw">as</span> pd
<span class="tok-kw">import</span> <span class="tok-cls">numpy</span> <span class="tok-kw">as</span> np
<span class="tok-kw">import</span> <span class="tok-cls">matplotlib.pyplot</span> <span class="tok-kw">as</span> plt
<span class="tok-kw">import</span> <span class="tok-cls">seaborn</span> <span class="tok-kw">as</span> sns

<span class="tok-kw">from</span> <span class="tok-cls">sklearn.preprocessing</span> <span class="tok-kw">import</span> <span class="tok-cls">StandardScaler</span>
<span class="tok-kw">from</span> <span class="tok-cls">sklearn.cluster</span> <span class="tok-kw">import</span> <span class="tok-cls">KMeans</span>
<span class="tok-kw">from</span> <span class="tok-cls">sklearn.metrics</span> <span class="tok-kw">import</span> <span class="tok-fn">silhouette_score</span>
<span class="tok-kw">from</span> <span class="tok-cls">sklearn.decomposition</span> <span class="tok-kw">import</span> <span class="tok-cls">PCA</span>

<span class="tok-kw">import</span> warnings
warnings<span class="tok-punc">.</span><span class="tok-fn">filterwarnings</span><span class="tok-punc">(</span><span class="tok-str">'ignore'</span><span class="tok-punc">)</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'All libraries imported successfully!'</span><span class="tok-punc">)</span>`
      }
    ]
  },

  load: {
    title: "notebook.ipynb — Load & Explore Data",
    tabs: [
      {
        label: "2 · Load CSV",
        code: `<span class="tok-cmt"># Load the CSV file</span>
df <span class="tok-punc">=</span> pd<span class="tok-punc">.</span><span class="tok-fn">read_csv</span><span class="tok-punc">(</span><span class="tok-str">'clinic_patients.csv'</span><span class="tok-punc">)</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'Shape:'</span><span class="tok-punc">,</span> df<span class="tok-punc">.</span>shape<span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'\nFirst 5 rows:'</span><span class="tok-punc">)</span>
df<span class="tok-punc">.</span><span class="tok-fn">head</span><span class="tok-punc">()</span>`
      },
      {
        label: "3 · Overview",
        code: `<span class="tok-cmt"># Dataset overview</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'=== Dataset Info ==='</span><span class="tok-punc">)</span>
df<span class="tok-punc">.</span><span class="tok-fn">info</span><span class="tok-punc">()</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'\n=== Missing Values ==='</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span>df<span class="tok-punc">.</span><span class="tok-fn">isnull</span><span class="tok-punc">().</span><span class="tok-fn">sum</span><span class="tok-punc">())</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'\n=== Duplicate Rows ==='</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span>df<span class="tok-punc">.</span><span class="tok-fn">duplicated</span><span class="tok-punc">().</span><span class="tok-fn">sum</span><span class="tok-punc">())</span>

<span class="tok-cmt"># Descriptive statistics</span>
df<span class="tok-punc">.</span><span class="tok-fn">describe</span><span class="tok-punc">().</span><span class="tok-fn">round</span><span class="tok-punc">(</span><span class="tok-num">2</span><span class="tok-punc">)</span>`
      }
    ]
  },

  histogram: {
    title: "notebook.ipynb — Feature Distributions (EDA)",
    tabs: [
      {
        label: "4 · Histograms",
        code: `<span class="tok-cmt"># Histograms — distribution of each numeric feature</span>
features <span class="tok-punc">=</span> <span class="tok-punc">[</span><span class="tok-str">'Age'</span><span class="tok-punc">,</span> <span class="tok-str">'BMI'</span><span class="tok-punc">,</span> <span class="tok-str">'BloodSugar_mg_dL'</span><span class="tok-punc">,</span> <span class="tok-str">'CholesterolLevel'</span><span class="tok-punc">,</span>
            <span class="tok-str">'BloodPressure_Systolic'</span><span class="tok-punc">,</span> <span class="tok-str">'VisitsPerYear'</span><span class="tok-punc">,</span> <span class="tok-str">'MedicationCount'</span><span class="tok-punc">]</span>

df<span class="tok-punc">[</span>features<span class="tok-punc">].</span><span class="tok-fn">hist</span><span class="tok-punc">(</span>bins<span class="tok-punc">=</span><span class="tok-num">15</span><span class="tok-punc">,</span> figsize<span class="tok-punc">=(</span><span class="tok-num">14</span><span class="tok-punc">,</span> <span class="tok-num">8</span><span class="tok-punc">),</span>
                  color<span class="tok-punc">=</span><span class="tok-str">'steelblue'</span><span class="tok-punc">,</span> edgecolor<span class="tok-punc">=</span><span class="tok-str">'white'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">suptitle</span><span class="tok-punc">(</span><span class="tok-str">'Feature Distributions'</span><span class="tok-punc">,</span>
             fontsize<span class="tok-punc">=</span><span class="tok-num">14</span><span class="tok-punc">,</span> fontweight<span class="tok-punc">=</span><span class="tok-str">'bold'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>`
      }
    ]
  },

  scatter_eda: {
    title: "notebook.ipynb — EDA Scatter Plots",
    tabs: [
      {
        label: "5 · Age vs BMI",
        code: `<span class="tok-cmt"># Scatter plot — Age vs BMI</span>
plt<span class="tok-punc">.</span><span class="tok-fn">figure</span><span class="tok-punc">(</span>figsize<span class="tok-punc">=(</span><span class="tok-num">7</span><span class="tok-punc">,</span> <span class="tok-num">5</span><span class="tok-punc">))</span>
plt<span class="tok-punc">.</span><span class="tok-fn">scatter</span><span class="tok-punc">(</span>df<span class="tok-punc">[</span><span class="tok-str">'Age'</span><span class="tok-punc">],</span> df<span class="tok-punc">[</span><span class="tok-str">'BMI'</span><span class="tok-punc">],</span>
            alpha<span class="tok-punc">=</span><span class="tok-num">0.6</span><span class="tok-punc">,</span> color<span class="tok-punc">=</span><span class="tok-str">'steelblue'</span><span class="tok-punc">,</span>
            edgecolors<span class="tok-punc">=</span><span class="tok-str">'white'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">xlabel</span><span class="tok-punc">(</span><span class="tok-str">'Age'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">ylabel</span><span class="tok-punc">(</span><span class="tok-str">'BMI'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">title</span><span class="tok-punc">(</span><span class="tok-str">'Age vs BMI'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>`
      },
      {
        label: "Blood Sugar vs Cholesterol",
        code: `<span class="tok-cmt"># Scatter: Blood Sugar vs Cholesterol</span>
plt<span class="tok-punc">.</span><span class="tok-fn">figure</span><span class="tok-punc">(</span>figsize<span class="tok-punc">=(</span><span class="tok-num">8</span><span class="tok-punc">,</span> <span class="tok-num">5</span><span class="tok-punc">))</span>
<span class="tok-kw">for</span> c <span class="tok-kw">in</span> <span class="tok-fn">sorted</span><span class="tok-punc">(</span>df<span class="tok-punc">[</span><span class="tok-str">'Cluster'</span><span class="tok-punc">].</span><span class="tok-fn">unique</span><span class="tok-punc">()):</span>
    subset <span class="tok-punc">=</span> df<span class="tok-punc">[</span>df<span class="tok-punc">[</span><span class="tok-str">'Cluster'</span><span class="tok-punc">]</span> <span class="tok-punc">==</span> c<span class="tok-punc">]</span>
    plt<span class="tok-punc">.</span><span class="tok-fn">scatter</span><span class="tok-punc">(</span>subset<span class="tok-punc">[</span><span class="tok-str">'BloodSugar_mg_dL'</span><span class="tok-punc">],</span>
                subset<span class="tok-punc">[</span><span class="tok-str">'CholesterolLevel'</span><span class="tok-punc">],</span>
                label<span class="tok-punc">=</span><span class="tok-fn">f</span><span class="tok-str">'Cluster {c}'</span><span class="tok-punc">,</span> alpha<span class="tok-punc">=</span><span class="tok-num">0.7</span><span class="tok-punc">,</span>
                color<span class="tok-punc">=</span>colors<span class="tok-punc">[</span>c<span class="tok-punc">],</span> edgecolors<span class="tok-punc">=</span><span class="tok-str">'white'</span><span class="tok-punc">,</span> s<span class="tok-punc">=</span><span class="tok-num">60</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">xlabel</span><span class="tok-punc">(</span><span class="tok-str">'Blood Sugar (mg/dL)'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">ylabel</span><span class="tok-punc">(</span><span class="tok-str">'Cholesterol Level'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">title</span><span class="tok-punc">(</span><span class="tok-str">'Clusters – Blood Sugar vs Cholesterol'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">legend</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>`
      }
    ]
  },

  correlation: {
    title: "notebook.ipynb — Correlation Heatmap",
    tabs: [
      {
        label: "6 · Heatmap",
        code: `<span class="tok-cmt"># Correlation heatmap</span>
corr <span class="tok-punc">=</span> df<span class="tok-punc">[</span>features<span class="tok-punc">].</span><span class="tok-fn">corr</span><span class="tok-punc">()</span>

plt<span class="tok-punc">.</span><span class="tok-fn">figure</span><span class="tok-punc">(</span>figsize<span class="tok-punc">=(</span><span class="tok-num">10</span><span class="tok-punc">,</span> <span class="tok-num">7</span><span class="tok-punc">))</span>
sns<span class="tok-punc">.</span><span class="tok-fn">heatmap</span><span class="tok-punc">(</span>corr<span class="tok-punc">,</span> annot<span class="tok-punc">=</span><span class="tok-cls">True</span><span class="tok-punc">,</span> fmt<span class="tok-punc">=</span><span class="tok-str">'.2f'</span><span class="tok-punc">,</span>
            cmap<span class="tok-punc">=</span><span class="tok-str">'coolwarm'</span><span class="tok-punc">,</span> square<span class="tok-punc">=</span><span class="tok-cls">True</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">title</span><span class="tok-punc">(</span><span class="tok-str">'Correlation Matrix'</span><span class="tok-punc">,</span>
          fontsize<span class="tok-punc">=</span><span class="tok-num">13</span><span class="tok-punc">,</span> fontweight<span class="tok-punc">=</span><span class="tok-str">'bold'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>

<span class="tok-cmt"># Correlation with VisitsPerYear (risk proxy)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'Correlation with VisitsPerYear:'</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span>corr<span class="tok-punc">[</span><span class="tok-str">'VisitsPerYear'</span><span class="tok-punc">].</span><span class="tok-fn">sort_values</span><span class="tok-punc">(</span>ascending<span class="tok-punc">=</span><span class="tok-cls">False</span><span class="tok-punc">).</span><span class="tok-fn">round</span><span class="tok-punc">(</span><span class="tok-num">3</span><span class="tok-punc">))</span>`
      }
    ]
  },

  cleaning: {
    title: "notebook.ipynb — Data Cleaning",
    tabs: [
      {
        label: "7 · Clean",
        code: `<span class="tok-cmt"># Remove duplicates</span>
df <span class="tok-punc">=</span> df<span class="tok-punc">.</span><span class="tok-fn">drop_duplicates</span><span class="tok-punc">()</span>

<span class="tok-cmt"># Remove rows with missing values</span>
df <span class="tok-punc">=</span> df<span class="tok-punc">.</span><span class="tok-fn">dropna</span><span class="tok-punc">()</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'Clean dataset shape:'</span><span class="tok-punc">,</span> df<span class="tok-punc">.</span>shape<span class="tok-punc">)</span>`
      },
      {
        label: "8 · Normalize",
        code: `<span class="tok-cmt"># Select features for clustering (drop PatientID)</span>
features <span class="tok-punc">=</span> <span class="tok-punc">[</span><span class="tok-str">'Age'</span><span class="tok-punc">,</span> <span class="tok-str">'BMI'</span><span class="tok-punc">,</span> <span class="tok-str">'BloodSugar_mg_dL'</span><span class="tok-punc">,</span>
             <span class="tok-str">'CholesterolLevel'</span><span class="tok-punc">,</span> <span class="tok-str">'BloodPressure_Systolic'</span><span class="tok-punc">,</span>
             <span class="tok-str">'VisitsPerYear'</span><span class="tok-punc">,</span> <span class="tok-str">'MedicationCount'</span><span class="tok-punc">]</span>

X <span class="tok-punc">=</span> df<span class="tok-punc">[</span>features<span class="tok-punc">].</span><span class="tok-fn">copy</span><span class="tok-punc">()</span>

<span class="tok-cmt"># Normalize — KMeans is distance-based so scaling is important</span>
scaler <span class="tok-punc">=</span> <span class="tok-cls">StandardScaler</span><span class="tok-punc">()</span>
X_scaled <span class="tok-punc">=</span> scaler<span class="tok-punc">.</span><span class="tok-fn">fit_transform</span><span class="tok-punc">(</span>X<span class="tok-punc">)</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'Features scaled successfully.'</span><span class="tok-punc">)</span>`
      }
    ]
  },

  elbow: {
    title: "notebook.ipynb — Elbow Method",
    tabs: [
      {
        label: "9 · Elbow + Silhouette",
        code: `inertia <span class="tok-punc">=</span> <span class="tok-punc">[]</span>
silhouette <span class="tok-punc">=</span> <span class="tok-punc">[]</span>
k_range <span class="tok-punc">=</span> <span class="tok-fn">range</span><span class="tok-punc">(</span><span class="tok-num">2</span><span class="tok-punc">,</span> <span class="tok-num">9</span><span class="tok-punc">)</span>

<span class="tok-kw">for</span> k <span class="tok-kw">in</span> k_range<span class="tok-punc">:</span>
    km <span class="tok-punc">=</span> <span class="tok-cls">KMeans</span><span class="tok-punc">(</span>n_clusters<span class="tok-punc">=</span>k<span class="tok-punc">,</span> random_state<span class="tok-punc">=</span><span class="tok-num">42</span><span class="tok-punc">,</span> n_init<span class="tok-punc">=</span><span class="tok-num">10</span><span class="tok-punc">)</span>
    labels <span class="tok-punc">=</span> km<span class="tok-punc">.</span><span class="tok-fn">fit_predict</span><span class="tok-punc">(</span>X_scaled<span class="tok-punc">)</span>
    inertia<span class="tok-punc">.</span><span class="tok-fn">append</span><span class="tok-punc">(</span>km<span class="tok-punc">.</span>inertia_<span class="tok-punc">)</span>
    silhouette<span class="tok-punc">.</span><span class="tok-fn">append</span><span class="tok-punc">(</span><span class="tok-fn">silhouette_score</span><span class="tok-punc">(</span>X_scaled<span class="tok-punc">,</span> labels<span class="tok-punc">))</span>

fig<span class="tok-punc">,</span> axes <span class="tok-punc">=</span> plt<span class="tok-punc">.</span><span class="tok-fn">subplots</span><span class="tok-punc">(</span><span class="tok-num">1</span><span class="tok-punc">,</span> <span class="tok-num">2</span><span class="tok-punc">,</span> figsize<span class="tok-punc">=(</span><span class="tok-num">13</span><span class="tok-punc">,</span> <span class="tok-num">4</span><span class="tok-punc">))</span>

axes<span class="tok-punc">[</span><span class="tok-num">0</span><span class="tok-punc">].</span><span class="tok-fn">plot</span><span class="tok-punc">(</span>k_range<span class="tok-punc">,</span> inertia<span class="tok-punc">,</span> marker<span class="tok-punc">=</span><span class="tok-str">'o'</span><span class="tok-punc">,</span> color<span class="tok-punc">=</span><span class="tok-str">'steelblue'</span><span class="tok-punc">)</span>
axes<span class="tok-punc">[</span><span class="tok-num">0</span><span class="tok-punc">].</span><span class="tok-fn">set_title</span><span class="tok-punc">(</span><span class="tok-str">'Elbow Method'</span><span class="tok-punc">)</span>
axes<span class="tok-punc">[</span><span class="tok-num">0</span><span class="tok-punc">].</span><span class="tok-fn">set_xlabel</span><span class="tok-punc">(</span><span class="tok-str">'Number of Clusters (K)'</span><span class="tok-punc">)</span>
axes<span class="tok-punc">[</span><span class="tok-num">0</span><span class="tok-punc">].</span><span class="tok-fn">set_ylabel</span><span class="tok-punc">(</span><span class="tok-str">'Inertia'</span><span class="tok-punc">)</span>

axes<span class="tok-punc">[</span><span class="tok-num">1</span><span class="tok-punc">].</span><span class="tok-fn">plot</span><span class="tok-punc">(</span>k_range<span class="tok-punc">,</span> silhouette<span class="tok-punc">,</span> marker<span class="tok-punc">=</span><span class="tok-str">'o'</span><span class="tok-punc">,</span> color<span class="tok-punc">=</span><span class="tok-str">'coral'</span><span class="tok-punc">)</span>
axes<span class="tok-punc">[</span><span class="tok-num">1</span><span class="tok-punc">].</span><span class="tok-fn">set_title</span><span class="tok-punc">(</span><span class="tok-str">'Silhouette Score'</span><span class="tok-punc">)</span>
axes<span class="tok-punc">[</span><span class="tok-num">1</span><span class="tok-punc">].</span><span class="tok-fn">set_xlabel</span><span class="tok-punc">(</span><span class="tok-str">'Number of Clusters (K)'</span><span class="tok-punc">)</span>
axes<span class="tok-punc">[</span><span class="tok-num">1</span><span class="tok-punc">].</span><span class="tok-fn">set_ylabel</span><span class="tok-punc">(</span><span class="tok-str">'Silhouette Score'</span><span class="tok-punc">)</span>

plt<span class="tok-punc">.</span><span class="tok-fn">suptitle</span><span class="tok-punc">(</span><span class="tok-str">'Optimal K Selection'</span><span class="tok-punc">,</span>
             fontsize<span class="tok-punc">=</span><span class="tok-num">13</span><span class="tok-punc">,</span> fontweight<span class="tok-punc">=</span><span class="tok-str">'bold'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>

best_k <span class="tok-punc">=</span> <span class="tok-fn">list</span><span class="tok-punc">(</span>k_range<span class="tok-punc">)[</span>silhouette<span class="tok-punc">.</span><span class="tok-fn">index</span><span class="tok-punc">(</span><span class="tok-fn">max</span><span class="tok-punc">(</span>silhouette<span class="tok-punc">))]</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-fn">f</span><span class="tok-str">'Best K by Silhouette Score: {best_k}'</span><span class="tok-punc">)</span>`
      }
    ]
  },

  silhouette: {
    title: "notebook.ipynb — Silhouette Score",
    tabs: [
      {
        label: "9 · Silhouette",
        code: `<span class="tok-cmt"># Silhouette Score per K</span>
silhouette <span class="tok-punc">=</span> <span class="tok-punc">[]</span>
k_range <span class="tok-punc">=</span> <span class="tok-fn">range</span><span class="tok-punc">(</span><span class="tok-num">2</span><span class="tok-punc">,</span> <span class="tok-num">9</span><span class="tok-punc">)</span>

<span class="tok-kw">for</span> k <span class="tok-kw">in</span> k_range<span class="tok-punc">:</span>
    km <span class="tok-punc">=</span> <span class="tok-cls">KMeans</span><span class="tok-punc">(</span>n_clusters<span class="tok-punc">=</span>k<span class="tok-punc">,</span> random_state<span class="tok-punc">=</span><span class="tok-num">42</span><span class="tok-punc">,</span> n_init<span class="tok-punc">=</span><span class="tok-num">10</span><span class="tok-punc">)</span>
    labels <span class="tok-punc">=</span> km<span class="tok-punc">.</span><span class="tok-fn">fit_predict</span><span class="tok-punc">(</span>X_scaled<span class="tok-punc">)</span>
    silhouette<span class="tok-punc">.</span><span class="tok-fn">append</span><span class="tok-punc">(</span><span class="tok-fn">silhouette_score</span><span class="tok-punc">(</span>X_scaled<span class="tok-punc">,</span> labels<span class="tok-punc">))</span>

best_k <span class="tok-punc">=</span> <span class="tok-fn">list</span><span class="tok-punc">(</span>k_range<span class="tok-punc">)[</span>silhouette<span class="tok-punc">.</span><span class="tok-fn">index</span><span class="tok-punc">(</span><span class="tok-fn">max</span><span class="tok-punc">(</span>silhouette<span class="tok-punc">))]</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-fn">f</span><span class="tok-str">'Best K by Silhouette Score: {best_k}'</span><span class="tok-punc">)</span>`
      }
    ]
  },

  kmeans: {
    title: "notebook.ipynb — Train KMeans",
    tabs: [
      {
        label: "10 · Train",
        code: `<span class="tok-cmt"># Train KMeans with the best K found above</span>
kmeans <span class="tok-punc">=</span> <span class="tok-cls">KMeans</span><span class="tok-punc">(</span>n_clusters<span class="tok-punc">=</span>best_k<span class="tok-punc">,</span> random_state<span class="tok-punc">=</span><span class="tok-num">42</span><span class="tok-punc">,</span> n_init<span class="tok-punc">=</span><span class="tok-num">10</span><span class="tok-punc">)</span>
df<span class="tok-punc">[</span><span class="tok-str">'Cluster'</span><span class="tok-punc">]</span> <span class="tok-punc">=</span> kmeans<span class="tok-punc">.</span><span class="tok-fn">fit_predict</span><span class="tok-punc">(</span>X_scaled<span class="tok-punc">)</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-fn">f</span><span class="tok-str">'KMeans trained with K={best_k}'</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'\nPatients per cluster:'</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span>df<span class="tok-punc">[</span><span class="tok-str">'Cluster'</span><span class="tok-punc">].</span><span class="tok-fn">value_counts</span><span class="tok-punc">().</span><span class="tok-fn">sort_index</span><span class="tok-punc">())</span>

<span class="tok-cmt"># Auto-label clusters by average visits (low → high risk)</span>
means <span class="tok-punc">=</span> df<span class="tok-punc">.</span><span class="tok-fn">groupby</span><span class="tok-punc">(</span><span class="tok-str">'Cluster'</span><span class="tok-punc">)[</span><span class="tok-str">'VisitsPerYear'</span><span class="tok-punc">].</span><span class="tok-fn">mean</span><span class="tok-punc">().</span><span class="tok-fn">sort_values</span><span class="tok-punc">()</span>
risk_labels <span class="tok-punc">=</span> <span class="tok-punc">[</span><span class="tok-str">'Low Risk'</span><span class="tok-punc">,</span> <span class="tok-str">'Moderate Risk'</span><span class="tok-punc">,</span>
               <span class="tok-str">'High Risk'</span><span class="tok-punc">,</span> <span class="tok-str">'Critical Risk'</span><span class="tok-punc">]</span>
labels_map <span class="tok-punc">=</span> <span class="tok-punc">{</span>cid<span class="tok-punc">:</span> risk_labels<span class="tok-punc">[</span>i<span class="tok-punc">]</span>
              <span class="tok-kw">for</span> i<span class="tok-punc">,</span> <span class="tok-punc">(</span>cid<span class="tok-punc">,</span> _<span class="tok-punc">)</span> <span class="tok-kw">in</span> <span class="tok-fn">enumerate</span><span class="tok-punc">(</span>means<span class="tok-punc">.</span><span class="tok-fn">items</span><span class="tok-punc">())}</span>
df<span class="tok-punc">[</span><span class="tok-str">'ClusterLabel'</span><span class="tok-punc">]</span> <span class="tok-punc">=</span> df<span class="tok-punc">[</span><span class="tok-str">'Cluster'</span><span class="tok-punc">].</span><span class="tok-fn">map</span><span class="tok-punc">(</span>labels_map<span class="tok-punc">)</span>`
      }
    ]
  },

  pca: {
    title: "notebook.ipynb — PCA Cluster View",
    tabs: [
      {
        label: "11 · PCA + Centroids",
        code: `<span class="tok-cmt"># PCA — compress all 7 features into 2D</span>
pca <span class="tok-punc">=</span> <span class="tok-cls">PCA</span><span class="tok-punc">(</span>n_components<span class="tok-punc">=</span><span class="tok-num">2</span><span class="tok-punc">)</span>
X_pca <span class="tok-punc">=</span> pca<span class="tok-punc">.</span><span class="tok-fn">fit_transform</span><span class="tok-punc">(</span>X_scaled<span class="tok-punc">)</span>

plt<span class="tok-punc">.</span><span class="tok-fn">figure</span><span class="tok-punc">(</span>figsize<span class="tok-punc">=(</span><span class="tok-num">8</span><span class="tok-punc">,</span> <span class="tok-num">5</span><span class="tok-punc">))</span>
<span class="tok-kw">for</span> c <span class="tok-kw">in</span> <span class="tok-fn">sorted</span><span class="tok-punc">(</span>df<span class="tok-punc">[</span><span class="tok-str">'Cluster'</span><span class="tok-punc">].</span><span class="tok-fn">unique</span><span class="tok-punc">()):</span>
    idx <span class="tok-punc">=</span> df<span class="tok-punc">[</span><span class="tok-str">'Cluster'</span><span class="tok-punc">]</span> <span class="tok-punc">==</span> c
    plt<span class="tok-punc">.</span><span class="tok-fn">scatter</span><span class="tok-punc">(</span>X_pca<span class="tok-punc">[</span>idx<span class="tok-punc">,</span> <span class="tok-num">0</span><span class="tok-punc">],</span> X_pca<span class="tok-punc">[</span>idx<span class="tok-punc">,</span> <span class="tok-num">1</span><span class="tok-punc">],</span>
                label<span class="tok-punc">=</span><span class="tok-fn">f</span><span class="tok-str">'Cluster {c}'</span><span class="tok-punc">,</span>
                alpha<span class="tok-punc">=</span><span class="tok-num">0.7</span><span class="tok-punc">,</span> color<span class="tok-punc">=</span>colors<span class="tok-punc">[</span>c<span class="tok-punc">],</span>
                edgecolors<span class="tok-punc">=</span><span class="tok-str">'white'</span><span class="tok-punc">,</span> s<span class="tok-punc">=</span><span class="tok-num">60</span><span class="tok-punc">)</span>

<span class="tok-cmt"># Centroid visualization</span>
centroids_pca <span class="tok-punc">=</span> pca<span class="tok-punc">.</span><span class="tok-fn">transform</span><span class="tok-punc">(</span>kmeans<span class="tok-punc">.</span>cluster_centers_<span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">scatter</span><span class="tok-punc">(</span>centroids_pca<span class="tok-punc">[:,</span> <span class="tok-num">0</span><span class="tok-punc">],</span> centroids_pca<span class="tok-punc">[:,</span> <span class="tok-num">1</span><span class="tok-punc">],</span>
            marker<span class="tok-punc">=</span><span class="tok-str">'X'</span><span class="tok-punc">,</span> s<span class="tok-punc">=</span><span class="tok-num">200</span><span class="tok-punc">,</span> color<span class="tok-punc">=</span><span class="tok-str">'black'</span><span class="tok-punc">,</span>
            label<span class="tok-punc">=</span><span class="tok-str">'Centroids'</span><span class="tok-punc">,</span> zorder<span class="tok-punc">=</span><span class="tok-num">5</span><span class="tok-punc">)</span>

pct <span class="tok-punc">=</span> pca<span class="tok-punc">.</span>explained_variance_ratio_
plt<span class="tok-punc">.</span><span class="tok-fn">xlabel</span><span class="tok-punc">(</span><span class="tok-fn">f</span><span class="tok-str">'PC1 ({pct[0]*100:.1f}% variance)'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">ylabel</span><span class="tok-punc">(</span><span class="tok-fn">f</span><span class="tok-str">'PC2 ({pct[1]*100:.1f}% variance)'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">title</span><span class="tok-punc">(</span><span class="tok-str">'PCA – Full Feature Cluster View with Centroids'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">legend</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-fn">f</span><span class="tok-str">'Total variance explained: {sum(pct)*100:.1f}%'</span><span class="tok-punc">)</span>`
      }
    ]
  },

  bar: {
    title: "notebook.ipynb — Average Feature Values per Cluster",
    tabs: [
      {
        label: "12 · Bar Chart",
        code: `<span class="tok-cmt"># Bar chart — average feature values per cluster</span>
cluster_means <span class="tok-punc">=</span> df<span class="tok-punc">.</span><span class="tok-fn">groupby</span><span class="tok-punc">(</span><span class="tok-str">'Cluster'</span><span class="tok-punc">)[</span>features<span class="tok-punc">].</span><span class="tok-fn">mean</span><span class="tok-punc">().</span><span class="tok-fn">round</span><span class="tok-punc">(</span><span class="tok-num">2</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'=== Cluster Centroids (original scale) ==='</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span>cluster_means<span class="tok-punc">)</span>

cluster_means<span class="tok-punc">.</span>T<span class="tok-punc">.</span><span class="tok-fn">plot</span><span class="tok-punc">(</span>kind<span class="tok-punc">=</span><span class="tok-str">'bar'</span><span class="tok-punc">,</span> figsize<span class="tok-punc">=(</span><span class="tok-num">13</span><span class="tok-punc">,</span> <span class="tok-num">5</span><span class="tok-punc">),</span>
                        colormap<span class="tok-punc">=</span><span class="tok-str">'Set2'</span><span class="tok-punc">,</span> edgecolor<span class="tok-punc">=</span><span class="tok-str">'white'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">title</span><span class="tok-punc">(</span><span class="tok-str">'Average Feature Values per Cluster'</span><span class="tok-punc">,</span>
          fontsize<span class="tok-punc">=</span><span class="tok-num">13</span><span class="tok-punc">,</span> fontweight<span class="tok-punc">=</span><span class="tok-str">'bold'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">ylabel</span><span class="tok-punc">(</span><span class="tok-str">'Average Value'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">xticks</span><span class="tok-punc">(</span>rotation<span class="tok-punc">=</span><span class="tok-num">20</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">legend</span><span class="tok-punc">(</span>title<span class="tok-punc">=</span><span class="tok-str">'Cluster'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>`
      }
    ]
  },

  pie: {
    title: "notebook.ipynb — Patient Distribution",
    tabs: [
      {
        label: "13 · Pie Chart",
        code: `<span class="tok-cmt"># Pie chart — patient distribution by risk group</span>
counts <span class="tok-punc">=</span> df<span class="tok-punc">[</span><span class="tok-str">'ClusterLabel'</span><span class="tok-punc">].</span><span class="tok-fn">value_counts</span><span class="tok-punc">()</span>

plt<span class="tok-punc">.</span><span class="tok-fn">figure</span><span class="tok-punc">(</span>figsize<span class="tok-punc">=(</span><span class="tok-num">6</span><span class="tok-punc">,</span> <span class="tok-num">6</span><span class="tok-punc">))</span>
plt<span class="tok-punc">.</span><span class="tok-fn">pie</span><span class="tok-punc">(</span>counts<span class="tok-punc">,</span> labels<span class="tok-punc">=</span>counts<span class="tok-punc">.</span>index<span class="tok-punc">,</span>
        autopct<span class="tok-punc">=</span><span class="tok-str">'%1.1f%%'</span><span class="tok-punc">,</span>
        colors<span class="tok-punc">=</span>colors<span class="tok-punc">[:</span><span class="tok-fn">len</span><span class="tok-punc">(</span>counts<span class="tok-punc">)],</span>
        startangle<span class="tok-punc">=</span><span class="tok-num">140</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">title</span><span class="tok-punc">(</span><span class="tok-str">'Patient Distribution by Cluster'</span><span class="tok-punc">,</span>
          fontsize<span class="tok-punc">=</span><span class="tok-num">13</span><span class="tok-punc">,</span> fontweight<span class="tok-punc">=</span><span class="tok-str">'bold'</span><span class="tok-punc">)</span>
plt<span class="tok-punc">.</span><span class="tok-fn">tight_layout</span><span class="tok-punc">()</span>
plt<span class="tok-punc">.</span><span class="tok-fn">show</span><span class="tok-punc">()</span>`
      }
    ]
  },

  cluster_summary: {
    title: "notebook.ipynb — Cluster Summary & Interpretation",
    tabs: [
      {
        label: "14 · Summary",
        code: `<span class="tok-cmt"># Summary table per cluster</span>
summary <span class="tok-punc">=</span> df<span class="tok-punc">.</span><span class="tok-fn">groupby</span><span class="tok-punc">(</span><span class="tok-str">'Cluster'</span><span class="tok-punc">).</span><span class="tok-fn">agg</span><span class="tok-punc">(</span>
    PatientCount<span class="tok-punc">=(</span><span class="tok-str">'PatientID'</span><span class="tok-punc">,</span> <span class="tok-str">'count'</span><span class="tok-punc">),</span>
    Avg_Age<span class="tok-punc">=(</span><span class="tok-str">'Age'</span><span class="tok-punc">,</span> <span class="tok-str">'mean'</span><span class="tok-punc">),</span>
    Avg_BMI<span class="tok-punc">=(</span><span class="tok-str">'BMI'</span><span class="tok-punc">,</span> <span class="tok-str">'mean'</span><span class="tok-punc">),</span>
    Avg_BloodSugar<span class="tok-punc">=(</span><span class="tok-str">'BloodSugar_mg_dL'</span><span class="tok-punc">,</span> <span class="tok-str">'mean'</span><span class="tok-punc">),</span>
    Avg_Cholesterol<span class="tok-punc">=(</span><span class="tok-str">'CholesterolLevel'</span><span class="tok-punc">,</span> <span class="tok-str">'mean'</span><span class="tok-punc">),</span>
    Avg_Systolic<span class="tok-punc">=(</span><span class="tok-str">'BloodPressure_Systolic'</span><span class="tok-punc">,</span> <span class="tok-str">'mean'</span><span class="tok-punc">),</span>
    Avg_Visits<span class="tok-punc">=(</span><span class="tok-str">'VisitsPerYear'</span><span class="tok-punc">,</span> <span class="tok-str">'mean'</span><span class="tok-punc">),</span>
    Avg_Medications<span class="tok-punc">=(</span><span class="tok-str">'MedicationCount'</span><span class="tok-punc">,</span> <span class="tok-str">'mean'</span><span class="tok-punc">)</span>
<span class="tok-punc">).</span><span class="tok-fn">round</span><span class="tok-punc">(</span><span class="tok-num">2</span><span class="tok-punc">)</span>

<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'=== Cluster Summary ==='</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span>summary<span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'\nCluster Labels Assigned:'</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span>df<span class="tok-punc">[</span><span class="tok-str">'ClusterLabel'</span><span class="tok-punc">].</span><span class="tok-fn">value_counts</span><span class="tok-punc">())</span>`
      },
      {
        label: "15 · Save CSV",
        code: `<span class="tok-cmt"># Save the clustered dataset</span>
df<span class="tok-punc">.</span><span class="tok-fn">to_csv</span><span class="tok-punc">(</span><span class="tok-str">'clinic_patients_clustered.csv'</span><span class="tok-punc">,</span> index<span class="tok-punc">=</span><span class="tok-cls">False</span><span class="tok-punc">)</span>
<span class="tok-fn">print</span><span class="tok-punc">(</span><span class="tok-str">'Saved: clinic_patients_clustered.csv'</span><span class="tok-punc">)</span>

<span class="tok-cmt"># Preview result</span>
df<span class="tok-punc">[[</span><span class="tok-str">'PatientID'</span><span class="tok-punc">,</span> <span class="tok-str">'Age'</span><span class="tok-punc">,</span> <span class="tok-str">'BMI'</span><span class="tok-punc">,</span>
    <span class="tok-str">'VisitsPerYear'</span><span class="tok-punc">,</span> <span class="tok-str">'Cluster'</span><span class="tok-punc">,</span> <span class="tok-str">'ClusterLabel'</span><span class="tok-punc">]].</span><span class="tok-fn">head</span><span class="tok-punc">(</span><span class="tok-num">10</span><span class="tok-punc">)</span>`
      }
    ]
  }
};

// ── Modal state ───────────────────────────────────────────────────────────────

let _activeTabIndex = 0;

// ── Build & inject the modal once ────────────────────────────────────────────

function _buildModal() {
  if (document.getElementById("codeModalOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "codeModalOverlay";
  overlay.className = "code-modal-overlay";
  overlay.innerHTML = `
    <div class="code-modal" role="dialog" aria-modal="true" aria-labelledby="codeModalTitle">
      <div class="code-modal-bar">
        <div class="code-modal-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="code-modal-title" id="codeModalTitle">notebook.ipynb</span>
        <div class="code-modal-actions">
          <button id="codeModalCopy">Copy</button>
          <button id="codeModalClose">✕ Close</button>
        </div>
      </div>
      <div class="code-modal-tabs" id="codeModalTabs"></div>
      <div class="code-modal-body" id="codeModalBody"></div>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById("codeModalClose").addEventListener("click", closeCodeModal);
  document.getElementById("codeModalCopy").addEventListener("click", _copyCode);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeCodeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCodeModal(); });
}

// ── Public API ────────────────────────────────────────────────────────────────

function openCodeModal(sectionKey) {
  _buildModal();
  const section = NOTEBOOK_SECTIONS[sectionKey];
  if (!section) return;

  document.getElementById("codeModalTitle").textContent = section.title;

  // Build tabs
  const tabsEl = document.getElementById("codeModalTabs");
  const bodyEl = document.getElementById("codeModalBody");
  tabsEl.innerHTML = "";
  bodyEl.innerHTML = "";

  section.tabs.forEach((tab, index) => {
    const btn = document.createElement("button");
    btn.className = "code-tab" + (index === 0 ? " active" : "");
    btn.textContent = tab.label;
    btn.addEventListener("click", () => _switchTab(index));
    tabsEl.appendChild(btn);

    const panel = document.createElement("div");
    panel.className = "code-block-panel" + (index === 0 ? " active" : "");
    panel.dataset.tabIndex = index;
    panel.innerHTML = `<pre class="code-display">${tab.code}</pre>`;
    bodyEl.appendChild(panel);
  });

  _activeTabIndex = 0;
  const overlay = document.getElementById("codeModalOverlay");
  overlay.classList.add("open");
  overlay.querySelector(".code-modal").focus?.();
}

function closeCodeModal() {
  const overlay = document.getElementById("codeModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _switchTab(index) {
  _activeTabIndex = index;
  document.querySelectorAll(".code-tab").forEach((btn, i) =>
    btn.classList.toggle("active", i === index));
  document.querySelectorAll(".code-block-panel").forEach((panel) =>
    panel.classList.toggle("active", Number(panel.dataset.tabIndex) === index));
}

function _copyCode() {
  const activePanel = document.querySelector(".code-block-panel.active pre");
  if (!activePanel) return;
  const rawText = activePanel.innerText;
  navigator.clipboard.writeText(rawText).then(() => {
    const btn = document.getElementById("codeModalCopy");
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    window.setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  });
}
