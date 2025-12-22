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

        else if (action === 'delete') {
            if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
                // Optimistic Local Delete
                State.shoppingList = State.shoppingList.filter(i => i.id !== id);
                StorageService.updateShoppingListLocal(State.shoppingList);

                // Persist deletion (Soft Delete)
                const deletedIds = JSON.parse(localStorage.getItem('moneyfy_deleted_items') || '[]');
                if (!deletedIds.includes(id)) deletedIds.push(id);
                localStorage.setItem('moneyfy_deleted_items', JSON.stringify(deletedIds));

                renderCurrentView();

                // Background API Call
                try {
                    await API.deleteShoppingItem(id);
                } catch (e) {
                    console.error("Failed to delete from server:", e);
                    // Optionally revert or show toast
                }
            }
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
        else if (action === 'clear') {
            State.shoppingList = State.shoppingList.filter(i => !i.completed);
            StorageService.updateShoppingListLocal(State.shoppingList);
            renderCurrentView();
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
        <div class="auth-card glass-panel" style="width: 95%; max-width: 600px; text-align: right; overflow-y:auto; max-height:85vh; padding: 25px;">
            ${content}
        </div>
    `;

        document.body.appendChild(overlay);
    };

    // --- Global Actions (More View etc) ---
    // REDEFINING handleAppAction to accept data
    window.handleAppAction = (action, data) => {
        if (action === 'logout') {
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                auth.logout();
            }
        }
        else if (action === 'reports') {
            const filteredTx = getFilteredTransactions();
            window.openFeatureModal(Features.renderReports(filteredTx));
        }
        else if (action === 'goals') {
            const goals = JSON.parse(localStorage.getItem('moneyfy_goals') || '[]');
            window.openFeatureModal(Features.renderGoals(goals));
        }
        else if (action === 'add_goal') {
            const title = document.getElementById('goal-title').value;
            const target = document.getElementById('goal-target').value;
            const saved = document.getElementById('goal-saved').value || 0;
            if (!title || !target) return alert('الرجاء تعبئة البيانات');

            const goals = JSON.parse(localStorage.getItem('moneyfy_goals') || '[]');
            goals.push({ id: Date.now(), title, target, saved });
            localStorage.setItem('moneyfy_goals', JSON.stringify(goals));

            window.openFeatureModal(Features.renderGoals(goals));
        }
        else if (action === 'delete_goal') { // Data is ID
            let goals = JSON.parse(localStorage.getItem('moneyfy_goals') || '[]');
            goals = goals.filter(g => g.id != data);
            localStorage.setItem('moneyfy_goals', JSON.stringify(goals));
            window.openFeatureModal(Features.renderGoals(goals));
        }
        else if (action === 'bills') {
            window.openFeatureModal(Features.renderBills());
        }
        else if (action === 'budget') {
            // New Smart Budget
            const catBudgets = JSON.parse(localStorage.getItem('moneyfy_category_budgets') || '{}');
            const filteredTx = getFilteredTransactions();
            window.openFeatureModal(Features.renderBudget(filteredTx, catBudgets));
        }
        else if (action === 'set_category_budget') {
            // Data is object {category, amount}
            const { category, amount } = data;
            const budgets = JSON.parse(localStorage.getItem('moneyfy_category_budgets') || '{}');
            budgets[category] = parseFloat(amount);
            localStorage.setItem('moneyfy_category_budgets', JSON.stringify(budgets));
            saveSettingsToCloud();

            // Re-render to update progress bars
            const filteredTx = getFilteredTransactions();
            window.openFeatureModal(Features.renderBudget(filteredTx, budgets));
            // Note: Re-rendering might lose focus of input, but acceptable for MVP
        }
        else if (action === 'manage_categories') {
            const defaults = [
                { name: 'طعام', icon: '🍔' }, { name: 'تسوق', icon: '🛒' }, { name: 'مواصلات', icon: '⛽' }, { name: 'فواتير', icon: '🧾' }, { name: 'راتب', icon: '💰' }, { name: 'أخرى', icon: '✨' }
            ];
            const cats = JSON.parse(localStorage.getItem('moneyfy_categories')) || defaults;
            window.openFeatureModal(Features.renderCategories(cats));
        }
        else if (action === 'add_category') {
            const name = document.getElementById('cat-name').value;
            const icon = document.getElementById('cat-icon').value || '🏷️';
            if (!name) return alert('أدخل اسم الفئة');

            const defaults = [
                { name: 'طعام', icon: '🍔' }, { name: 'تسوق', icon: '🛒' }, { name: 'مواصلات', icon: '⛽' }, { name: 'فواتير', icon: '🧾' }, { name: 'راتب', icon: '💰' }, { name: 'أخرى', icon: '✨' }
            ];
            const cats = JSON.parse(localStorage.getItem('moneyfy_categories')) || defaults;
            cats.push({ name, icon });
            localStorage.setItem('moneyfy_categories', JSON.stringify(cats));
            // Sync with current view
            window.openFeatureModal(Features.renderCategories(cats));
            // Reload whole app to update modal dropdowns? Ideally yes or just navigate
            // For now, next time they open modal it will be there.
        }
        else if (action === 'delete_category') {
            const defaults = [
                { name: 'طعام', icon: '🍔' }, { name: 'تسوق', icon: '🛒' }, { name: 'مواصلات', icon: '⛽' }, { name: 'فواتير', icon: '🧾' }, { name: 'راتب', icon: '💰' }, { name: 'أخرى', icon: '✨' }
            ];
            let cats = JSON.parse(localStorage.getItem('moneyfy_categories')) || defaults;
            cats = cats.filter(c => c.name !== data);
            localStorage.setItem('moneyfy_categories', JSON.stringify(cats));
            window.openFeatureModal(Features.renderCategories(cats));
        }
        else if (action === 'set_budget') {
            // Data is the text value
            let val = parseFloat(data.replace(/[^0-9.]/g, ''));
            if (val) localStorage.setItem('moneyfy_budget', val);
        }
        else if (action === 'settings') {
            window.openFeatureModal(Features.renderSettings());
        }
        else if (action === 'export_csv') {
            const txs = State.transactions;
            let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Excel
            csvContent += "ID,Date,Type,Category,Amount,Note\n";
            txs.forEach(t => {
                csvContent += `${t.id},${t.date},${t.type},${t.category},${t.amount},${t.note || ''}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "moneyfy_data.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
        else if (action === 'reset_app') {
            if (confirm('تحذير: هذا سيحذف جميع البيانات المحفوظة محلياً. هل أنت متأكد؟')) {
                localStorage.clear();
                location.reload();
            }
        }
    };
    // --- Data Loading ---
    async function loadData() {
        const mainView = document.getElementById("main-view");

        // --- MIGRATION: Force New Categories One Time ---
        if (!localStorage.getItem('migrated_cats_v1')) {
            const newDefaults = [
                { name: 'ديون', icon: '💸' }, { name: 'راتب', icon: '💰' }, { name: 'سيارة', icon: '🚗' }, { name: 'فنكهة', icon: '🎡' }, { name: 'فواتير شهرية', icon: '📉' }, { name: 'مصروف امل', icon: '👩' }, { name: 'مصروف بيت', icon: '🏠' }, { name: 'مصروف لولو', icon: '👧' }, { name: 'مصروف جواد', icon: '👨' }
            ];
            localStorage.setItem('moneyfy_categories', JSON.stringify(newDefaults));
            localStorage.setItem('migrated_cats_v1', 'true');
            console.log("Migrated to new categories");
        }
        // ------------------------------------------------

        // Restrict User_2 to Market
        if (State.currentUser && State.currentUser.id === 'user_2') {
            State.currentView = 'market';
        }

        // 1. Load from LocalStorage (Instant)
        // StorageService returns { data: [], syncPromise: Promise }
        const { data: cachedTx, syncPromise: syncTxPromise } = await StorageService.getTransactions();
        const { data: cachedList, syncPromise: syncListPromise } = await StorageService.getShoppingList();

        let hasCache = false;

        if (cachedTx && Array.isArray(cachedTx)) {
            // Normalize Data: Ensure 'date' field exists for filtering
            State.transactions = cachedTx.map(tx => {
                const t = { ...tx };
                if (!t.date && t.timestamp) {
                    t.date = new Date(t.timestamp).toISOString().split('T')[0];
                }
                return t;
            });
            if (cachedTx.length > 0) hasCache = true;
        }

        if (cachedList && Array.isArray(cachedList)) {
            // Soft Delete Filter
            const deletedIds = JSON.parse(localStorage.getItem('moneyfy_deleted_items') || '[]');
            State.shoppingList = cachedList.filter(item => !deletedIds.includes(item.id));
            if (State.shoppingList.length > 0) hasCache = true;
        }

        if (hasCache) {
            renderCurrentView();
        } else {
            mainView.innerHTML = '<div class="loading-spinner"><div class="spinner-ring"></div></div>';
        }

        // 2. Wait for Background Sync from API
        try {
            const settingsPromise = API.fetchSettings(); // Fetch Settings
            const [freshTx, freshList, freshSettings] = await Promise.all([syncTxPromise, syncListPromise, settingsPromise]);

            // Handle Settings Sync
            if (freshSettings && freshSettings.data) {
                const s = freshSettings.data;
                if (s.categories) localStorage.setItem('moneyfy_categories', JSON.stringify(s.categories));
                if (s.goals) localStorage.setItem('moneyfy_goals', JSON.stringify(s.goals));
                if (s.budget) localStorage.setItem('moneyfy_budget', s.budget);

                // Merge Deleted Items (Union)
                if (s.deleted_items && Array.isArray(s.deleted_items)) {
                    const localDeleted = JSON.parse(localStorage.getItem('moneyfy_deleted_items') || '[]');
                    const mergedDeleted = [...new Set([...localDeleted, ...s.deleted_items])];
                    localStorage.setItem('moneyfy_deleted_items', JSON.stringify(mergedDeleted));
                }
            }

            let updated = false;
            // StorageService.sync returns the unwrapped array (or null on fail)
            if (freshTx && Array.isArray(freshTx)) {
                // Normalize Data: Ensure 'date' field exists for filtering
                State.transactions = freshTx.map(tx => {
                    const t = { ...tx };
                    if (!t.date && t.timestamp) {
                        t.date = new Date(t.timestamp).toISOString().split('T')[0];
                    }
                    return t;
                });
                updated = true;
            }
            if (freshList && Array.isArray(freshList)) {
                // Soft Delete Filter
                const deletedIds = JSON.parse(localStorage.getItem('moneyfy_deleted_items') || '[]');
                State.shoppingList = freshList.filter(item => !deletedIds.includes(item.id));
                State.shoppingList = State.shoppingList; // (Redundant assignment but keeps flow clear)
                updated = true;
            }

            if (updated) {
                console.log("Data & Settings synced from cloud");
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

    function attachViewListeners() {
        // Placeholder for any view-specific event binding
        // Most events are handled via delegation or inline onclicks
    }

    function updateNavState() {
        const navItems = document.querySelectorAll(".nav-item");

        // Hide nav items for Wife (User 2)
        const isWife = State.currentUser && State.currentUser.id === 'user_2';

        navItems.forEach(item => {
            // If Wife, hide everything except Market
            if (isWife) {
                if (item.dataset.target !== 'market') {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                    item.style.width = '100%'; // Full width for the only button
                }
            } else {
                item.style.display = 'flex'; // Reset
                item.style.width = '';
            }

            if (item.dataset.target === State.currentView) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
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
            // Prevent Wife from navigating away from Market
            if (State.currentUser && State.currentUser.id === 'user_2' && item.dataset.target !== 'market') {
                window.showToast('عذراً، لا تملكين صلاحية الوصول لهذه الصفحة', 'error');
                return;
            }

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
            // Disable FAB for Wife if it opens Transaction Modal
            if (State.currentUser && State.currentUser.id === 'user_2') {
                // Maybe default FAB should add Shopping Item for her?
                // For now, simple error
                window.showToast('للإضافة استخدمي زر الإضافة في القائمة', 'error');
                return;
            }
            transModal.open();
        });
    }
});
