import { renderHome } from './views/home.js';
import { renderWallet } from './views/wallet.js';
import { renderMarket } from './views/market.js';
import { renderMore } from './views/more.js';
import { TransactionModal } from './components/modal-transaction.js';
import * as API from './api/gas.js';

// Moneyfy V2 - Core Application Logic
console.log("Moneyfy V2 Initializing...");

const State = {
    transactions: [],
    currentView: 'home'
};

document.addEventListener("DOMContentLoaded", async () => {

    // Initialize Components
    const transModal = new TransactionModal();

    // Function to Load/Refresh Data
    async function loadData() {
        const mainView = document.getElementById("main-view");
        // Only show spinner if we don't have data yet (first load)
        if (State.transactions.length === 0 && mainView) {
            mainView.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
      `;
        }

        try {
            const response = await API.fetchTransactions();
            if (response && response.transactions) {
                State.transactions = response.transactions;
                console.log("Loaded Transactions:", State.transactions.length);
                renderCurrentView(); // Re-render logic
            }
        } catch (e) {
            console.error("Failed to load transactions:", e);
        }
    }

    // Function to Render Current View
    function renderCurrentView() {
        const mainView = document.getElementById("main-view");
        if (!mainView) return;

        if (State.currentView === "home") {
            mainView.innerHTML = renderHome(State.transactions);
        } else if (State.currentView === "wallet") {
            mainView.innerHTML = renderWallet(State.transactions);
        } else if (State.currentView === "market") {
            mainView.innerHTML = renderMarket();
        } else if (State.currentView === "more") {
            mainView.innerHTML = renderMore();
        }
    }

    // Listen for refresh events (from Modal)
    window.addEventListener('data-refresh-needed', () => {
        console.log("Refreshing Data...");
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
