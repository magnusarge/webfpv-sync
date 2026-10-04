# WebFPV Sync

A simple Chrome extension to sync your webfpv.org rates and settings across different computers using Chrome Sync.

WebFPV normally stores settings in `localStorage`, which means you lose your tune if you switch computers or reinstall the browser. This extension reads `localStorage` from the active tab and saves it to `chrome.storage.sync`. When you open WebFPV on another machine, a content script checks for cloud settings and shows a prompt to import them.

## Installation

1. Clone or download the repo.
2. Go to `chrome://extensions` in Chrome.
3. Turn on "Developer mode".
4. Click "Load unpacked" and select the `chrome/app` folder.

*Note: The `manifest.json` includes a hardcoded `key` so the extension gets the same ID on all your computers when loaded unpacked. Without it, Chrome Sync wouldn't share data between them.*

## Usage

1. Open webfpv.org and configure your rates/settings.
2. Click the extension icon and hit "Save settings to cloud".
3. On your other computer, open webfpv.org.
4. A prompt will appear in the bottom right corner if the cloud has different settings.
5. Click Import. The page will reload with your updated settings.

It also checks if the cloud version is older than your local version and shows a warning so you don't accidentally overwrite newer settings with an old backup.
