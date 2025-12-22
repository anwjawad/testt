import { renderHome } from './views/home.js';
import { renderWallet } from './views/wallet.js';
import { renderMarket } from './views/market.js';
import { renderMore } from './views/more.js';
import { TransactionModal } from './components/modal-transaction.js';
import { StorageService } from './api/storage.js';
import { AuthSystem } from './components/auth-screen.js'; // Import Auth
import { Features } from './components/feature-modals.js';
import * as API from './api/gas.js'; // Still needed for direct calls in helpers if any

// Moneyfy V2 - Core Application Logic
console.log("Moneyfy V2 Initializing...");

const State = {
    transactions: [],
    shoppingList: [], // {id, name, completed}
    currentView: 'home',
    currentUser: null,
    selectedMonth: new Date().toISOString().slice(0, 7) // 'YYYY-MM'
};

document.addEventListener("DOMContentLoaded", async () => {

    // Initialize Auth
    const auth = new AuthSystem();
    const isLoggedIn = auth.init(); // Returns true if session exists
    if (isLoggedIn) {
        State.currentUser = auth.currentUser;
    }

    // Initialize Components
    const transModal = new TransactionModal();

    // If not logged in, wait for event
    window.addEventListener('auth-success', () => {
        State.currentUser = auth.currentUser; // Sync State
        loadData(); // Reload personalized data if needed
    });

    // Load data immediately anyway (background), overlay covers it if needed
    // This makes it feel faster once you enter PIN.


    // --- Date Filter Logic ---
    const dateInput = document.getElementById('global-date-filter');
    if (dateInput) {
        dateInput.value = State.selectedMonth;
        dateInput.addEventListener('change', (e) => {
            State.selectedMonth = e.target.value;
            console.log("Month changed to:", State.selectedMonth);
            renderCurrentView();
        });
    }

    function getFilteredTransactions() {
        if (!State.selectedMonth) return State.transactions;
        return State.transactions.filter(tx => tx.date && tx.date.startsWith(State.selectedMonth));
    }


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



    // Helper to Open Feature Modal
    window.closeFeatureModal = () => {
        const el = document.getElementById('feature-modal-overlay');
        if (el) {
            el.classList.remove('active');
            setTimeout(() => el.remove(), 300);
        }
    };

    window.openFeatureModal = (content) => {
        // Remove existing if any
        window.closeFeatureModal();

        const overlay = document.createElement('div');
        overlay.id = 'feature-modal-overlay';
        overlay.className = 'modal-overlay active'; // Re-using modal-overlay style
        overlay.style.alignItems = "center"; // Center it for features

        // We reuse modal-overlay but inject a different child container
        overlay.innerHTML = `
        <div class="auth-card glass-panel" style="width: 90%; max-width: 400px; text-align: right; overflow:hidden;">
            ${content}
        </div>
    `;

        document.body.appendChild(overlay);
    };

    // --- Global Actions (More View etc) ---
    window.handleAppAction = (action) => {
        if (action === 'logout') {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                auth.logout();
            }
        } else if (action === 'reports') {
            const filteredTx = getFilteredTransactions(); // Use current filtered data
            window.openFeatureModal(Features.renderReports(filteredTx));
        } else if (action === 'goals') {
            window.openFeatureModal(Features.renderGoals());
        } else if (action === 'bills' || action === 'budget') {
            window.openFeatureModal(Features.renderUpcoming());
            window.openFeatureModal(Features.renderBills()); // Updated to renderBills
        }
    };
    // --- Data Loading ---
    async function loadData() {
        const mainView = document.getElementById("main-view");

        // Check User Role for Default View on First Load only
        if (State.currentUser && State.currentUser.id === 'user_2' && State.currentView === 'home') {
            State.currentView = 'market';
        }

        // 1. Load from LocalStorage (Instant)
        // StorageService returns { data: [], syncPromise: Promise }
        const { data: cachedTx, syncPromise: syncTxPromise } = await StorageService.getTransactions();
        const { data: cachedList, syncPromise: syncListPromise } = await StorageService.getShoppingList();

        let hasCache = false;

        if (cachedTx && Array.isArray(cachedTx)) {
            State.transactions = cachedTx;
            if (cachedTx.length > 0) hasCache = true;
        }

        if (cachedList && Array.isArray(cachedList)) {
            State.shoppingList = cachedList;
            if (cachedList.length > 0) hasCache = true;
        }

        if (hasCache) {
            renderCurrentView();
        } else {
            mainView.innerHTML = '<div class="loading-spinner"><div class="spinner-ring"></div></div>';
        }

        // 2. Wait for Background Sync from API
        try {
            const [freshTx, freshList] = await Promise.all([syncTxPromise, syncListPromise]);

            let updated = false;
            // StorageService.sync returns the unwrapped array (or null on fail)
            if (freshTx && Array.isArray(freshTx)) {
                State.transactions = freshTx;
                updated = true;
            }
            if (freshList && Array.isArray(freshList)) {
                State.shoppingList = freshList; // Fixed: was using freshTx
                updated = true;
            }

            if (updated) {
                console.log("Data synced from cloud");
                renderCurrentView();
            }

        } catch (error) {
            console.error("Failed to sync data:", error);
        }
    }

    // Function to Render Current View
    function renderCurrentView() {
        const mainView = document.getElementById("main-view");
        const filteredTx = getFilteredTransactions(); // USE FILTERED DATA

        // Pass Current User to Views
        if (State.currentView === 'home') {
            mainView.innerHTML = renderHome(filteredTx);
        } else if (State.currentView === 'wallet') {
            mainView.innerHTML = renderWallet(filteredTx);
        } else if (State.currentView === 'market') {
            mainView.innerHTML = renderMarket(State.shoppingList, State.currentUser); // Pass User
        } else if (State.currentView === 'more') {
            mainView.innerHTML = renderMore();
        }

        // Re-attach listeners for dynamic content
        attachViewListeners();
        updateNavState();
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
