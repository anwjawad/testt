import { renderHome } from './views/home.js';
import { renderWallet } from './views/wallet.js';
import { renderMarket } from './views/market.js';
import { renderMore } from './views/more.js';
import { TransactionModal } from './components/modal-transaction.js';
import { StorageService } from './api/storage.js';
import { AuthSystem } from './components/auth-screen.js'; // Import Auth
import * as API from './api/gas.js'; // Still needed for direct calls in helpers if any

// Moneyfy V2 - Core Application Logic
console.log("Moneyfy V2 Initializing...");

const State = {
    transactions: [],
    shoppingList: [], // {id, name, completed}
    currentView: 'home',
    currentUser: null
};

document.addEventListener("DOMContentLoaded", async () => {

    // Initialize Auth
    const auth = new AuthSystem();
    const isLoggedIn = auth.init(); // Returns true if session exists

    // Initialize Components
    const transModal = new TransactionModal();

    // If not logged in, wait for event
    window.addEventListener('auth-success', () => {
        loadData(); // Reload personalized data if needed
    });

    // Load data immediately anyway (background), overlay covers it if needed
    // This makes it feel faster once you enter PIN.


    // --- Market Logic Helpers ---
    window.handleMarketAction = async (action, id, name) => {
        if (action === 'add') {
            const input = document.getElementById('new-item-input');
            const val = input.value.trim();
            if (!val) return;

            // Optimistic UI Update (Update State + Local Storage)
            const newItem = { id: 'temp-' + Date.now(), name: val, completed: false };
            State.shoppingList.push(newItem);
            StorageService.updateShoppingListLocal(State.shoppingList); // Save local
            renderCurrentView();

            try {
                await API.addShoppingItem(val);
                // Re-sync
                const freshItems = await StorageService._syncShoppingList();
                if (freshItems) {
                    State.shoppingList = freshItems;
                    renderCurrentView();
                }
            } catch (e) { console.error(e); }
        }

        else if (action === 'buy') {
            // Step 1: Open Transaction Modal Pre-filled
            transModal.open({
                note: name,
                category: 'طعام', // Intelligent default?
            });

            // We need to know WHICH item triggered this to mark it done after save
            // We can temporarily store it in State
            State.pendingBuyItem = { id, name };
        }

        else if (action === 'restore') {
            // Optimistic Toggle
            const item = State.shoppingList.find(i => i.id === id);
            if (item) {
                item.completed = !item.completed; // Toggle
                StorageService.updateShoppingListLocal(State.shoppingList);
                renderCurrentView();

                // Background Sync
                // Todo: Add API for generic toggle if needed, or re-use logic
            }
        }
        else if (action === 'clear_completed') {
            // ... logic for clear ...
        }
    };

    // --- Toast Notification ---
    window.showToast = (message, type = 'success') => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation';

        toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="toast-msg">${message}</div>
    `;

        container.appendChild(toast);

        // Remove after 3s
        setTimeout(() => {
            toast.style.animation = 'toastExit 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // --- Global Actions (More View etc) ---
    window.handleAppAction = (action) => {
        if (action === 'logout') {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                auth.logout();
            }
        }
    };
    // --- Data Loading ---
    async function loadData() {
        const mainView = document.getElementById("main-view");

        // 1. Load from Cache FIRST (Instant)
        const { data: localTx, syncPromise: syncTx } = await StorageService.getTransactions();
        const { data: localList, syncPromise: syncList } = await StorageService.getShoppingList();

        if (localTx.length > 0 || localList.length > 0) {
            State.transactions = localTx;
            State.shoppingList = localList;
            renderCurrentView();
            console.log("Rendered from Cache");
        } else {
            // Only show spinner if cache is empty
            if (mainView) {
                mainView.innerHTML = `
                <div class="loading-spinner">
                <div class="spinner-ring"></div>
                </div>
            `;
            }
        }

        // 2. Background Sync
        try {
            const [freshTx, freshList] = await Promise.all([syncTx, syncList]);

            let updated = false;
            if (freshTx) {
                State.transactions = freshTx;
                updated = true;
            }
            if (freshList) {
                State.shoppingList = freshList;
                updated = true;
            }

            if (updated) {
                console.log("View Updated from Cloud");
                renderCurrentView();
            }

        } catch (e) {
            console.error("Background Sync Failed:", e);
        }
    }

    // --- View Rendering ---
    function renderCurrentView() {
        const mainView = document.getElementById("main-view");
        if (!mainView) return;

        if (State.currentView === "home") {
            mainView.innerHTML = renderHome(State.transactions);
        } else if (State.currentView === "wallet") {
            mainView.innerHTML = renderWallet(State.transactions);
        } else if (State.currentView === "market") {
            mainView.innerHTML = renderMarket(State.shoppingList);
        } else if (State.currentView === "more") {
            mainView.innerHTML = renderMore();
        }
    }

    // --- Event Listeners ---

    // 1. Refresh Event (Global)
    window.addEventListener('data-refresh-needed', async () => {
        // If we have a pending buy item, mark it as done now
        if (State.pendingBuyItem) {
            console.log("Marking item purchased:", State.pendingBuyItem.name);
            try {
                // Optimistic Update
                const item = State.shoppingList.find(i => i.id === State.pendingBuyItem.id);
                if (item) item.completed = true;
                renderCurrentView();

                // API Call
                await API.toggleShoppingItem(State.pendingBuyItem.id, 0); // Price 0 because we recorded separate tx
            } catch (e) { console.error(e); }

            State.pendingBuyItem = null;
        }

        // Reload all data
        loadData();
    });

    // Initial Load
    loadData();

    // Navigation Logic
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove("active"));
            // Add to clicked
            item.classList.add("active");

            const target = item.dataset.target;
            State.currentView = target;
            renderCurrentView();
        });
    });

    // FAB Click -> Open Modal
    const fab = document.getElementById("fab-add");
    if (fab) {
        fab.addEventListener("click", () => {
            transModal.open();
        });
    }
});
