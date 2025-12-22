import * as API from './gas.js';

const PY_CACHE_KEYS = {
    TRANSACTIONS: 'moneyfy_v2_transactions',
    SHOPPING_LIST: 'moneyfy_v2_shopping_list',
    LAST_SYNC: 'moneyfy_v2_last_sync'
};

export class StorageService {

    // --- Transactions ---
    static async getTransactions() {
        // 1. Return cached data immediately if exists
        const cached = localStorage.getItem(PY_CACHE_KEYS.TRANSACTIONS);
        const localData = cached ? JSON.parse(cached) : [];

        // 2. We return local data first, but we also want to trigger a sync
        // The calling app should handle the "stale-while-revalidate" pattern
        return {
            data: localData,
            syncPromise: this._syncTransactions()
        };
    }

    static async _syncTransactions() {
        try {
            const response = await API.fetchTransactions();
            if (response && response.transactions) {
                localStorage.setItem(PY_CACHE_KEYS.TRANSACTIONS, JSON.stringify(response.transactions));
                localStorage.setItem(PY_CACHE_KEYS.LAST_SYNC, Date.now());
                return response.transactions;
            }
        } catch (e) {
            console.warn("Sync failed, using offline data:", e);
            return null; // Return null to indicate no fresh data
        }
    }

    static async addTransaction(txData) {
        // 1. Optimistic Update
        const cached = localStorage.getItem(PY_CACHE_KEYS.TRANSACTIONS);
        let localData = cached ? JSON.parse(cached) : [];

        // Add temp ID and timestamp
        const newTx = {
            ...txData,
            timestamp: new Date().toISOString(), // Local time for now
            id: 'temp-' + Date.now()
        };

        localData.push(newTx);
        localStorage.setItem(PY_CACHE_KEYS.TRANSACTIONS, JSON.stringify(localData));

        // 2. Send to Cloud
        try {
            await API.addTransaction(txData);
            // 3. Re-sync to get real ID and server timestamp
            return this._syncTransactions();
        } catch (e) {
            console.error("Cloud save failed:", e);
            // Todo: Add to "pending sync" queue
            throw e;
        }
    }

    // --- Shopping List ---
    static async getShoppingList() {
        const cached = localStorage.getItem(PY_CACHE_KEYS.SHOPPING_LIST);
        const localData = cached ? JSON.parse(cached) : [];

        return {
            data: localData,
            syncPromise: this._syncShoppingList()
        };
    }

    static async _syncShoppingList() {
        try {
            const response = await API.fetchShoppingList();
            if (response && response.items) {
                localStorage.setItem(PY_CACHE_KEYS.SHOPPING_LIST, JSON.stringify(response.items));
                return response.items;
            }
        } catch (e) { console.warn("Shopping sync failed:", e); return null; }
    }

    static async updateShoppingListLocal(items) {
        localStorage.setItem(PY_CACHE_KEYS.SHOPPING_LIST, JSON.stringify(items));
    }
}
