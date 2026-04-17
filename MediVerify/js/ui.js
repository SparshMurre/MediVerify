/* =========================================================
   ui.js — UI Rendering Functions
   ========================================================= */

const UI = (() => {
  const $main = () => document.getElementById('mainContent');
  const $nav = () => document.getElementById('mainNav');
  const $status = () => document.getElementById('statusBar');
  const $modal = () => document.getElementById('modalOverlay');
  const $modalC = () => document.getElementById('modalContent');

  // ---- Status Bar ----
  function setStatus(type) {
    const bar = $status();
    const text = document.getElementById('statusText');
    bar.classList.remove('connected', 'offline');
    if (type === 'connected') {
      bar.classList.add('connected');
      text.textContent = 'Connected to Verification Database';
    } else if (type === 'offline') {
      bar.classList.add('offline');
      text.textContent = 'Offline Mode Active — Using Local Database';
    }
  }

  // ---- Navigation ----
  function renderNav(session) {
    const nav = $nav();
    if (!session) {
      nav.innerHTML = '';
      return;
    }
    if (session.role === 'admin') {
      nav.innerHTML = `
        <button class="nav-btn active" id="navDashboard" onclick="App.navigate('admin-dashboard')">Dashboard</button>
        <button class="nav-btn" id="navAddMedicine" onclick="App.navigate('admin-add')">Add Medicine</button>
        <button class="nav-btn logout" id="navLogout" onclick="App.logout()">Sign Out</button>
      `;
    } else {
      nav.innerHTML = `
        <button class="nav-btn active" id="navSearch" onclick="App.navigate('user-search')">Search</button>
        <button class="nav-btn" id="navScan" onclick="App.navigate('user-scan')">Scan Barcode</button>
        <button class="nav-btn logout" id="navLogout" onclick="App.logout()">Sign Out</button>
      `;
    }
  }

  function setActiveNav(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  // ---- Landing Page ----
  function renderLanding() {
    $main().innerHTML = `
      <div class="landing-hero">
        <h2>Verify Medicine Authenticity</h2>
        <p>MediVerify helps you check the authenticity and details of medicines through our trusted verification database. Search by name or scan a barcode to get started.</p>
        <div class="landing-actions">
          <button class="btn btn-primary" id="landingLogin" onclick="App.navigate('login')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In to Continue
          </button>
        </div>
      </div>
      <div class="landing-features">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3>Search by Name</h3>
          <p>Instantly look up any medicine by its brand name and verify its details against our database.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/><line x1="14" y1="8" x2="14" y2="16"/><line x1="18" y1="8" x2="18" y2="16"/></svg>
          </div>
          <h3>Barcode Scanning</h3>
          <p>Use your device camera to scan medicine barcodes and get instant verification results.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3>Database Verified</h3>
          <p>All medicines are checked against our verification database to confirm authenticity and details.</p>
        </div>
      </div>
    `;
  }

  // ---- Login Page ----
  function renderLogin() {
    $main().innerHTML = `
      <div class="login-wrapper">
        <div class="login-card">
          <h2>Sign In</h2>
          <p class="login-sub">Access the Medicine Verification System</p>
          <div class="alert alert-error" id="loginAlert"></div>
          <form id="loginForm" onsubmit="App.handleLogin(event)">
            <div class="form-group">
              <label class="form-label" for="loginEmail">Email Address</label>
              <input class="form-input" id="loginEmail" type="email" placeholder="admin@med.com or user@med.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label class="form-label" for="loginPassword">Password</label>
              <input class="form-input" id="loginPassword" type="password" placeholder="Enter password" required autocomplete="current-password" />
            </div>
            <button type="submit" class="btn btn-primary btn-full" id="loginSubmit">Sign In</button>
          </form>
          <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--grey-200); font-size:12px; color:var(--grey-500);">
            <strong>Demo Accounts:</strong><br/>
            Admin: admin@med.com / 1234<br/>
            User: user@med.com / 1234
          </div>
        </div>
      </div>
    `;
  }

  // ---- Admin Dashboard ----
  async function renderAdminDashboard() {
    const meds = await DB.getAll();
    $main().innerHTML = `
      <div class="page-heading">
        <h2>Admin Dashboard</h2>
        <p>Manage the medicine verification database</p>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <p class="stat-label">Total Medicines</p>
          <p class="stat-value">${meds.length}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Database Status</p>
          <p class="stat-value" style="font-size:16px; color: var(--green);">● Active</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Mode</p>
          <p class="stat-value" style="font-size:16px;">${DB.isFirebaseReady() ? 'Firebase' : 'Local Storage'}</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">All Medicines</h3>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('admin-add')">+ Add Medicine</button>
        </div>
        <div class="table-wrap">
          <table class="data-table" id="medicinesTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Barcode</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${meds.map(m => `
                <tr>
                  <td style="font-weight:600; color:var(--grey-800);">${escHTML(m.name)}</td>
                  <td>${escHTML(m.brand)}</td>
                  <td><code style="font-size:12px; background:var(--grey-100); padding:2px 6px; border-radius:4px;">${escHTML(m.barcode)}</code></td>
                  <td>${escHTML(m.batch)}</td>
                  <td>${escHTML(m.expiry)}</td>
                  <td><span class="badge badge-green">Verified</span></td>
                  <td><button class="btn-delete" onclick="App.deleteMedicine('${m.id}')">Delete</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    setActiveNav('navDashboard');
  }

  // ---- Admin Add Medicine ----
  function renderAdminAdd() {
    $main().innerHTML = `
      <div class="page-heading">
        <h2>Add New Medicine</h2>
        <p>Add a new medicine to the verification database</p>
      </div>
      <div class="card">
        <div class="alert alert-success" id="addAlert"></div>
        <form class="admin-form" id="addMedForm" onsubmit="App.handleAddMedicine(event)">
          <div class="form-group">
            <label class="form-label" for="medName">Medicine Name *</label>
            <input class="form-input" id="medName" required placeholder="e.g. Dolo 650" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medBrand">Brand *</label>
            <input class="form-input" id="medBrand" required placeholder="e.g. Micro Labs" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medIngredients">Ingredients *</label>
            <input class="form-input" id="medIngredients" required placeholder="e.g. Paracetamol 650mg" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medBarcode">Barcode *</label>
            <input class="form-input" id="medBarcode" required placeholder="e.g. 123456" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medBatch">Batch Number *</label>
            <input class="form-input" id="medBatch" required placeholder="e.g. DL-2026-A1" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medExpiry">Expiry Date *</label>
            <input class="form-input" id="medExpiry" type="date" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="medCategory">Category</label>
            <input class="form-input" id="medCategory" placeholder="e.g. Analgesic" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medDosageForm">Dosage Form</label>
            <input class="form-input" id="medDosageForm" placeholder="e.g. Tablet" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medStrength">Strength</label>
            <input class="form-input" id="medStrength" placeholder="e.g. 500mg" />
          </div>
          <div class="form-group">
            <label class="form-label" for="medManufacturer">Manufacturer</label>
            <input class="form-input" id="medManufacturer" placeholder="e.g. Micro Labs Ltd." />
          </div>
          <button type="submit" class="btn btn-primary" id="addMedSubmit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add to Database
          </button>
        </form>
      </div>
    `;
    setActiveNav('navAddMedicine');
  }

  // ---- User Search ----
  function renderUserSearch() {
    $main().innerHTML = `
      <div class="page-heading">
        <h2>Verify Medicine</h2>
        <p>Search by medicine name to verify its authenticity</p>
      </div>
      <div class="search-section">
        <form class="search-bar" id="searchForm" onsubmit="App.handleSearch(event)">
          <input class="form-input" id="searchInput" placeholder="Enter medicine name (e.g. Dolo 650, Crocin, Augmentin…)" autocomplete="off" />
          <button type="submit" class="btn btn-primary" id="searchBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Verify
          </button>
        </form>
      </div>
      <div id="searchResults"></div>
    `;
    setActiveNav('navSearch');
  }

  // ---- User Scan ----
  function renderUserScan() {
    $main().innerHTML = `
      <div class="page-heading">
        <h2>Scan Barcode</h2>
        <p>Point your camera at a medicine barcode to verify</p>
      </div>
      <div class="scanner-section">
        <div class="scanner-container">
          <div class="scanner-viewport" id="scannerViewport"></div>
          <div class="scanner-controls">
            <button class="btn btn-primary" id="startScanBtn" onclick="App.startScanner()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/><line x1="14" y1="8" x2="14" y2="16"/><line x1="18" y1="8" x2="18" y2="16"/></svg>
              Start Scanner
            </button>
            <button class="btn btn-secondary" id="stopScanBtn" onclick="App.stopScanner()" style="display:none;">Stop</button>
          </div>
          <p class="scanner-info">Allow camera access when prompted. Position the barcode within the scanner frame.</p>
        </div>
      </div>
      <div style="max-width:480px; margin:20px auto 0;">
        <div class="card" style="margin-top:20px;">
          <h3 class="card-title" style="margin-bottom:12px;">Manual Barcode Entry</h3>
          <form class="search-bar" id="barcodeForm" onsubmit="App.handleBarcodeSearch(event)">
            <input class="form-input" id="barcodeInput" placeholder="Enter barcode number (e.g. 123456)" />
            <button type="submit" class="btn btn-primary" id="barcodeSearchBtn">Verify</button>
          </form>
        </div>
      </div>
      <div id="scanResults" style="max-width:480px; margin:0 auto;"></div>
    `;
    setActiveNav('navScan');
  }

  // ---- Verification Result ----
  function renderVerifyResult(container, medicine) {
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', {
      dateStyle: 'medium', timeStyle: 'medium'
    });

    if (!medicine) {
      container.innerHTML = `
        <div class="verify-result">
          <div class="verify-card not-found">
            <div class="verify-status">
              <span class="verify-status-icon">✕</span>
              Not Found in Database
            </div>
            <p style="font-size:14px; color:var(--grey-600);">
              The medicine could not be found in the verification database. This does not necessarily mean the medicine is counterfeit — it may not yet be registered in our system.
            </p>
            <div class="verify-meta">
              <span class="verify-timestamp">Checked: ${timestamp}</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="verify-result">
        <div class="verify-card verified">
          <div class="verify-status">
            <span class="verify-status-icon">✓</span>
            Database Verified
          </div>
          <div class="verify-details">
            <div class="verify-field">
              <span class="verify-field-label">Medicine Name</span>
              <span class="verify-field-value">${escHTML(medicine.name)}</span>
            </div>
            <div class="verify-field">
              <span class="verify-field-label">Brand</span>
              <span class="verify-field-value">${escHTML(medicine.brand)}</span>
            </div>
            <div class="verify-field">
              <span class="verify-field-label">Active Ingredients</span>
              <span class="verify-field-value">${escHTML(medicine.ingredients)}</span>
            </div>
            <div class="verify-field">
              <span class="verify-field-label">Batch Number</span>
              <span class="verify-field-value">${escHTML(medicine.batch)}</span>
            </div>
            <div class="verify-field">
              <span class="verify-field-label">Expiry Date</span>
              <span class="verify-field-value">${escHTML(medicine.expiry)}</span>
            </div>
            ${medicine.category ? `<div class="verify-field">
              <span class="verify-field-label">Category</span>
              <span class="verify-field-value">${escHTML(medicine.category)}</span>
            </div>` : ''}
            ${medicine.dosageForm ? `<div class="verify-field">
              <span class="verify-field-label">Dosage Form</span>
              <span class="verify-field-value">${escHTML(medicine.dosageForm)}</span>
            </div>` : ''}
            ${medicine.strength ? `<div class="verify-field">
              <span class="verify-field-label">Strength</span>
              <span class="verify-field-value">${escHTML(medicine.strength)}</span>
            </div>` : ''}
            <div class="verify-field">
              <span class="verify-field-label">Barcode</span>
              <span class="verify-field-value"><code style="background:rgba(0,0,0,0.05); padding:2px 8px; border-radius:4px; font-size:13px;">${escHTML(medicine.barcode)}</code></span>
            </div>
            ${medicine.manufacturer ? `<div class="verify-field">
              <span class="verify-field-label">Manufacturer</span>
              <span class="verify-field-value">${escHTML(medicine.manufacturer)}</span>
            </div>` : ''}
          </div>
          <div class="verify-meta">
            <span class="verify-timestamp">Verified: ${timestamp}</span>
            <button class="btn btn-sm btn-green" onclick="App.showCertificate('${medicine.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              View Certificate
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ---- Verifying Spinner ----
  function showVerifying() {
    let overlay = document.getElementById('verifyingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'verifyingOverlay';
      overlay.className = 'verifying-overlay';
      overlay.innerHTML = `
        <div class="spinner"></div>
        <p class="verifying-text">Verifying Medicine…</p>
        <p style="font-size:13px; color:var(--grey-500);">Checking against verification database</p>
      `;
      document.body.appendChild(overlay);
    }
    overlay.classList.add('show');
  }

  function hideVerifying() {
    const overlay = document.getElementById('verifyingOverlay');
    if (overlay) overlay.classList.remove('show');
  }

  // ---- Certificate Modal ----
  function showCertificate(medicine) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { dateStyle: 'long' });
    const timeStr = now.toLocaleTimeString('en-IN', { timeStyle: 'medium' });
    const certNo = 'CERT-' + medicine.barcode + '-' + Date.now().toString(36).toUpperCase();

    $modalC().innerHTML = `
    <button class="modal-close" onclick="App.closeModal()">&times;</button>

    <div class="certificate fade-in">

      <div class="certificate-seal">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="32" cy="32" r="28"/>
          <circle cx="32" cy="32" r="22" stroke-dasharray="4 3"/>
          <path d="M32 18V46M18 32H46" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <h3 style="color:#2a5bd7;">MediVerify Certificate</h3>
      <p class="cert-sub">Database Verification Record</p>

      <div class="cert-body">
        <p>
          This certifies that the following medicine has been 
          <strong style="color:green;">verified in the MediVerify database</strong>.
        </p>
      </div>

      <div class="cert-field-row">
        <dl class="cert-field">
          <dt>Medicine</dt>
          <dd>${escHTML(medicine.name)}</dd>
        </dl>
        <dl class="cert-field">
          <dt>Brand</dt>
          <dd>${escHTML(medicine.brand)}</dd>
        </dl>
      </div>

      <div class="cert-field-row">
        <dl class="cert-field">
          <dt>Batch</dt>
          <dd>${escHTML(medicine.batch)}</dd>
        </dl>
        <dl class="cert-field">
          <dt>Barcode</dt>
          <dd>${escHTML(medicine.barcode)}</dd>
        </dl>
      </div>

      <div class="cert-field-row">
        <dl class="cert-field">
          <dt>Verified On</dt>
          <dd>${dateStr}</dd>
        </dl>
        <dl class="cert-field">
          <dt>Time</dt>
          <dd>${timeStr}</dd>
        </dl>
      </div>

      <div style="margin-top:15px;">
        <span class="badge badge-green">✔ Database Verified</span>
      </div>

      <p class="cert-footer">
        Certificate No: ${certNo}<br/>
        This is a database verification certificate for demonstration purposes only.<br/>
        Not a government-issued certification.
      </p>

      <button onclick="window.print()" class="btn btn-primary" style="margin-top:10px;">
        Print Certificate
      </button>

    </div>
  `;

    $modal().classList.add('show');
  }

  // ---- Helpers ----
  function escHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('show');
}

window.App = window.App || {};
window.App.closeModal = closeModal;
  return {
    setStatus,
    renderNav,
    setActiveNav,
    renderLanding,
    renderLogin,
    renderAdminDashboard,
    renderAdminAdd,
    renderUserSearch,
    renderUserScan,
    renderVerifyResult,
    showVerifying,
    hideVerifying,
    showCertificate,
    closeModal,
    escHTML
  };
})();
