/* =========================================================
   scanner.js — Barcode Scanner using html5-qrcode
   ========================================================= */

const Scanner = (() => {
  let html5QrCode = null;
  let isScanning = false;

  function init(elementId) {
    if (typeof Html5Qrcode === 'undefined') {
      console.warn('[Scanner] html5-qrcode library not loaded');
      return false;
    }
    html5QrCode = new Html5Qrcode(elementId);
    return true;
  }

  async function start(onScanSuccess) {
    if (!html5QrCode || isScanning) return;
    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.5
        },
        (decodedText) => {
          // Pause scanning after success
          stop();
          onScanSuccess(decodedText);
        },
        () => {} // Ignore scan errors (no match yet)
      );
      isScanning = true;
    } catch (err) {
      console.warn('[Scanner] Could not start:', err);
      throw err;
    }
  }

  async function stop() {
    if (!html5QrCode || !isScanning) return;
    try {
      await html5QrCode.stop();
    } catch (err) {
      console.warn('[Scanner] Stop error:', err);
    }
    isScanning = false;
  }

  function getIsScanning() {
    return isScanning;
  }

  return { init, start, stop, getIsScanning };
})();
