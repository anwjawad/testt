// Google Apps Script API Wrapper (JSONP)

const GAS_URL = "https://script.google.com/macros/s/AKfycbwSkHZ415pesRIqXgkePUgTMqequDoWTDEkGPA01r_fkurUGuqRKkFSMP30zJUCVegeHQ/exec";

function gasCallJSONP(paramsObj = {}) {
    return new Promise((resolve) => {
        if (!GAS_URL) {
            console.warn("GAS URL not configured.");
            resolve({ ok: false, error: "NO_GAS_URL" });
            return;
        }

        // Generate unique callback name
        const cbName = "__gas_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e9);

        // Inject Script
        const scriptTag = document.createElement("script");
        scriptTag.src = finalUrl;
        scriptTag.async = true;

        // Cleanup Function
        function cleanup() {
            try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
            if (scriptTag && scriptTag.parentNode) {
                scriptTag.parentNode.removeChild(scriptTag);
            }
        }

        // Timeout Safety (15s)
        const timeoutId = setTimeout(() => {
            cleanup();
            console.warn("GAS Request Timeout:", paramsObj.action);
            resolve({ ok: false, error: "TIMEOUT" });
        }, 15000);

        // Success Callback
        window[cbName] = function (data) {
            clearTimeout(timeoutId);
            cleanup();
            resolve(data);
        };

        // Error Handler
        scriptTag.onerror = function () {
            clearTimeout(timeoutId);
            cleanup();
            resolve({ ok: false, error: "SCRIPT_LOAD_ERROR" });
        };

        document.body.appendChild(scriptTag);
    });
}

// --- API Methods ---

export async function fetchTransactions() {
    return gasCallJSONP({ action: "getTransactions" });
}

export async function addTransaction(transactionData) {
    // transactionData: { type, amount, categories, note, source }
    return gasCallJSONP({
        action: "addTransaction",
        ...transactionData,
        categories: JSON.stringify(transactionData.categories || [])
    });
}

export async function fetchWalletSummary() {
    // In a real app we might have a specific endpoint, 
    // but for now we can reuse getTransactions and calc client-side, 
    // OR assume fetchTransactions returns everything we need.
    return fetchTransactions();
}

export async function fetchShoppingList() {
    return gasCallJSONP({ action: "getShoppingList" });
}

export async function addShoppingItem(itemName) {
    return gasCallJSONP({ action: "addShoppingItem", itemName });
}

export async function toggleShoppingItem(itemId, price = 0) {
    return gasCallJSONP({
        action: "markShoppingPurchased",
        itemId,
        price
    });
}

export async function deleteShoppingItem(itemId) {
    return gasCallJSONP({
        action: "deleteShoppingItem",
        itemId
    });
}

// --- Settings API ---
export async function fetchSettings() {
    return gasCallJSONP({ action: "getSettings" });
}

export async function saveSettings(settingsObj) {
    return gasCallJSONP({
        action: "saveSettings",
        settingsJson: JSON.stringify(settingsObj)
    });
}
