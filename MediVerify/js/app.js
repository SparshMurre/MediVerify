/* =========================================================
   app.js — Main Application Controller
   ========================================================= */

const App = (() => {
  let currentPage = '';

  // ---- Initialize ----
  function init() {
    const fbReady = DB.init();

    // Set status bar
    if (fbReady) {
      UI.setStatus('connected');
    } else {
      // Show connecting briefly, then offline
      setTimeout(() => UI.setStatus('offline'), 1200);
    }

    // Route based on session
    const session = Auth.getSession();
    if (session) {
      UI.renderNav(session);
      if (session.role === 'admin') {
        navigate('admin-dashboard');
      } else {
        navigate('user-search');
      }
    } else {
      UI.renderNav(null);
      navigate('landing');
    }

    // Close modal on backdrop click
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
  }

  // ---- Navigation ----
  function navigate(page) {
    currentPage = page;
    // Stop scanner if leaving scan page
    if (page !== 'user-scan') {
      Scanner.stop();
    }
    switch (page) {
      case 'landing':        UI.renderLanding(); break;
      case 'login':          UI.renderLogin(); break;
      case 'admin-dashboard': UI.renderAdminDashboard(); break;
      case 'admin-add':      UI.renderAdminAdd(); break;
      case 'user-search':    UI.renderUserSearch(); break;
      case 'user-scan':      UI.renderUserScan(); break;
    }
  }

  // ---- Auth Handlers ----
  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const session = Auth.login(email, password);

    if (!session) {
      const alert = document.getElementById('loginAlert');
      alert.textContent = 'Invalid email or password. Please try again.';
      alert.classList.add('show');
      return;
    }

    UI.renderNav(session);
    if (session.role === 'admin') {
      navigate('admin-dashboard');
    } else {
      navigate('user-search');
    }
  }

  function logout() {
    Auth.logout();
    UI.renderNav(null);
    navigate('landing');
  }

  // ---- Search Handler ----
  async function handleSearch(e) {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    UI.showVerifying();

    // Simulate verification delay (1–2 seconds)
    const delay = 1000 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, delay));

    const results = await DB.searchByName(query);
    UI.hideVerifying();

    const container = document.getElementById('searchResults');
    if (results.length > 0) {
      // Show first match prominently
      UI.renderVerifyResult(container, results[0]);

      // If multiple matches, show list below
      if (results.length > 1) {
        const extra = document.createElement('div');
        extra.className = 'card';
        extra.style.marginTop = '16px';
        extra.innerHTML = `
          <h3 class="card-title" style="margin-bottom:12px;">Other Matches (${results.length - 1})</h3>
          ${results.slice(1).map(m => `
            <div style="padding:10px 0; border-bottom:1px solid var(--grey-100); cursor:pointer;" onclick="App.showMedicineDetail('${m.id}')">
              <strong>${UI.escHTML(m.name)}</strong> <span style="color:var(--grey-500);">— ${UI.escHTML(m.brand)}</span>
              <span class="badge badge-green" style="margin-left:8px;">Verified</span>
            </div>
          `).join('')}
        `;
        container.appendChild(extra);
      }
    } else {
      UI.renderVerifyResult(container, null);
    }
  }

  // ---- Show detail for a specific medicine ----
  async function showMedicineDetail(id) {
    UI.showVerifying();
    await new Promise(r => setTimeout(r, 800));
    const all = await DB.getAll();
    const med = all.find(m => m.id === id);
    UI.hideVerifying();
    if (med) {
      const container = document.getElementById('searchResults') || document.getElementById('scanResults');
      if (container) UI.renderVerifyResult(container, med);
    }
  }

  // ---- Barcode Search (manual entry) ----
  async function handleBarcodeSearch(e) {
    e.preventDefault();
    const barcode = document.getElementById('barcodeInput').value.trim();
    if (!barcode) return;

    UI.showVerifying();
    const delay = 1000 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, delay));

    const med = await DB.searchByBarcode(barcode);
    UI.hideVerifying();

    const container = document.getElementById('scanResults');
    UI.renderVerifyResult(container, med);
  }

  // ---- Scanner ----
  async function startScanner() {
    const ok = Scanner.init('scannerViewport');
    if (!ok) {
      alert('Camera scanner is not available. Please use the manual barcode entry below.');
      return;
    }

    try {
      document.getElementById('startScanBtn').style.display = 'none';
      document.getElementById('stopScanBtn').style.display = '';

      await Scanner.start(async (decodedText) => {
        // Barcode scanned
        document.getElementById('startScanBtn').style.display = '';
        document.getElementById('stopScanBtn').style.display = 'none';

        UI.showVerifying();
        await new Promise(r => setTimeout(r, 1200));

        const med = await DB.searchByBarcode(decodedText);
        UI.hideVerifying();

        const container = document.getElementById('scanResults');
        UI.renderVerifyResult(container, med);
      });
    } catch (err) {
      document.getElementById('startScanBtn').style.display = '';
      document.getElementById('stopScanBtn').style.display = 'none';
      alert('Could not access camera. Please use the manual barcode entry below.');
    }
  }

  async function stopScanner() {
    await Scanner.stop();
    document.getElementById('startScanBtn').style.display = '';
    document.getElementById('stopScanBtn').style.display = 'none';
  }

  // ---- Admin: Add Medicine ----
  async function handleAddMedicine(e) {
    e.preventDefault();
    const med = {
      name:         document.getElementById('medName').value.trim(),
      brand:        document.getElementById('medBrand').value.trim(),
      ingredients:  document.getElementById('medIngredients').value.trim(),
      barcode:      document.getElementById('medBarcode').value.trim(),
      batch:        document.getElementById('medBatch').value.trim(),
      expiry:       document.getElementById('medExpiry').value,
      category:     document.getElementById('medCategory').value.trim(),
      dosageForm:   document.getElementById('medDosageForm').value.trim(),
      strength:     document.getElementById('medStrength').value.trim(),
      manufacturer: document.getElementById('medManufacturer').value.trim(),
      countryOfOrigin: 'India'
    };

    await DB.addMedicine(med);

    const alert = document.getElementById('addAlert');
    alert.textContent = `"${med.name}" has been added to the verification database.`;
    alert.classList.add('show');

    document.getElementById('addMedForm').reset();

    // Auto-hide after 3s
    setTimeout(() => alert.classList.remove('show'), 3000);
  }

  // ---- Admin: Delete Medicine ----
  async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to remove this medicine from the database?')) return;
    await DB.deleteMedicine(id);
    navigate('admin-dashboard');
  }

  // ---- Certificate ----
  async function showCertificate(medId) {
    const all = await DB.getAll();
    const med = all.find(m => m.id === medId);
    if (med) UI.showCertificate(med);
  }

  function closeModal() {
    UI.closeModal();
  }

  // ---- Boot ----
  document.addEventListener('DOMContentLoaded', init);

  return {
    navigate,
    handleLogin,
    logout,
    handleSearch,
    handleBarcodeSearch,
    startScanner,
    stopScanner,
    handleAddMedicine,
    deleteMedicine,
    showCertificate,
    showMedicineDetail,
    closeModal
  };
})();
