const RATES_PREFIX = "webfpv.rates.library.v";
const SETTINGS_PREFIX = "webfpv.settings.v";
const PILOT_KEY = "webfpv.pilot.name";

chrome.storage.sync.get(["webFpvData"], (result) => {
  const cloud = result.webFpvData;
  if (!cloud) return;

  if (document.getElementById("webfpv-sync-modal")) return;

  // Lokaalsete andmete lugemise abifunktsioon
  const getLatest = (prefix) => {
    let maxVer = -1, bestKey = null, val = null;
    for (let i = 0; i < localStorage.length; i++) {
      let k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        let ver = parseInt(k.replace(prefix, ''), 10);
        if (isNaN(ver)) ver = -1;
        if (ver > maxVer) { maxVer = ver; bestKey = k; val = localStorage.getItem(k); }
      }
    }
    return bestKey ? { key: bestKey, version: maxVer, value: val } : null;
  };

  const localPilot = localStorage.getItem(PILOT_KEY);
  const localRates = getLatest(RATES_PREFIX);
  const localSettings = getLatest(SETTINGS_PREFIX);

  // Erinevuste tuvastamine
  let diffPilot = cloud.pilot && cloud.pilot !== localPilot;
  let diffRates = cloud.rates && (!localRates || cloud.rates.value !== localRates.value);
  let diffSettings = cloud.settings && (!localSettings || cloud.settings.value !== localSettings.value);

  if (!diffPilot && !diffRates && !diffSettings) return;
  
  let isCloudOlder = (localRates && cloud.rates && cloud.rates.version < localRates.version) || 
                     (localSettings && cloud.settings && cloud.settings.version < localSettings.version);

  // Modaali (modal) ehitamine
  const modal = document.createElement("div");
  modal.id = "webfpv-sync-modal";
  modal.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 999999;
    background: #1e1e1e; color: #fff; padding: 20px; border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family: sans-serif;
    border: 1px solid #444; width: 300px;
  `;

  const dateStr = cloud.savedUtc ? new Date(cloud.savedUtc).toLocaleString('en-US') : 'Unknown';
  
  let html = `
    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: ${isCloudOlder ? '#FF9800' : '#4CAF50'};">Cloud settings found</h3>
    <p style="margin: 0 0 15px 0; font-size: 12px; color: #aaa;">Saved: ${dateStr}</p>
    ${isCloudOlder ? '<p style="margin: 0 0 10px 0; font-size: 11px; color: #FF9800;">Warning: Cloud has partially older versions than local memory.</p>' : ''}
    <div style="margin-bottom: 15px;">
  `;

  if (cloud.pilot) {
    html += `<label style="display:block; margin-bottom:5px; font-size: 13px;">
      <input type="checkbox" id="sync-pilot" ${diffPilot ? 'checked' : ''}> 
      Pilot Name
    </label>`;
  }
  if (cloud.rates) {
    html += `<label style="display:block; margin-bottom:5px; font-size: 13px;">
      <input type="checkbox" id="sync-rates" ${diffRates ? 'checked' : ''}> 
      Rates (v${cloud.rates.version})
    </label>`;
  }
  if (cloud.settings) {
    html += `<label style="display:block; margin-bottom:5px; font-size: 13px;">
      <input type="checkbox" id="sync-settings" ${diffSettings ? 'checked' : ''}> 
      Settings (v${cloud.settings.version})
    </label>`;
  }

  html += `
    </div>
    <div style="display: flex; gap: 10px;">
      <button id="btn-sync-import" style="flex: 1; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Import</button>
      <button id="btn-sync-close" style="flex: 1; padding: 8px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;

  modal.innerHTML = html;
  document.body.appendChild(modal);

  // Vana versiooni kustutamise loogika
  const cleanupOld = (prefix, keepVer) => {
    let toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        let ver = parseInt(key.replace(prefix, ''), 10);
        if (isNaN(ver)) ver = -1;
        if (ver !== keepVer) {
          toRemove.push(key);
        }
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  };

  document.getElementById("btn-sync-close").onclick = () => modal.remove();
  
  document.getElementById("btn-sync-import").onclick = () => {
    if (document.getElementById("sync-pilot")?.checked && cloud.pilot) {
      localStorage.setItem(PILOT_KEY, cloud.pilot);
    }
    if (document.getElementById("sync-rates")?.checked && cloud.rates) {
      localStorage.setItem(cloud.rates.key, cloud.rates.value);
      cleanupOld(RATES_PREFIX, cloud.rates.version);
    }
    if (document.getElementById("sync-settings")?.checked && cloud.settings) {
      localStorage.setItem(cloud.settings.key, cloud.settings.value);
      cleanupOld(SETTINGS_PREFIX, cloud.settings.version);
    }
    location.reload();
  };
});
