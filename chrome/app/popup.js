const RATES_PREFIX = "webfpv.rates.library.v";
const SETTINGS_PREFIX = "webfpv.settings.v";
const PILOT_KEY = "webfpv.pilot.name";

document.getElementById("saveToCloud").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  statusEl.innerText = "Saving...";
  statusEl.style.color = ""; // Restore original color

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes("webfpv.org")) {
    statusEl.innerText = "Error: Open webfpv.org!";
    statusEl.style.color = "#F44336"; // Red color for error message
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (rPref, sPref, pKey) => {
      const getLatest = (prefix) => {
        let maxVer = -1, bestKey = null;
        for (let i = 0; i < localStorage.length; i++) {
          let k = localStorage.key(i);
          if (k && k.startsWith(prefix)) {
            let ver = parseInt(k.replace(prefix, ''), 10);
            if (isNaN(ver)) ver = -1;
            if (ver > maxVer) { maxVer = ver; bestKey = k; }
          }
        }
        return bestKey ? { key: bestKey, version: maxVer, value: localStorage.getItem(bestKey) } : null;
      };

      return {
        savedUtc: new Date().toISOString(),
        pilot: localStorage.getItem(pKey),
        rates: getLatest(rPref),
        settings: getLatest(sPref)
      };
    },
    args: [RATES_PREFIX, SETTINGS_PREFIX, PILOT_KEY]
  }, (results) => {
    if (results && results[0]) {
      chrome.storage.sync.set({ webFpvData: results[0].result }, () => {
        statusEl.innerText = "Successfully saved to cloud!";
        statusEl.style.color = "#4CAF50";
      });
    }
  });
});
