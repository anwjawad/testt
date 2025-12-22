import { renderHome } from './views/home.js';
import { renderWallet } from './views/wallet.js';
import { TransactionModal } from './components/modal-transaction.js';

// Moneyfy V2 - Core Application Logic
console.log("Moneyfy V2 Initializing...");

document.addEventListener("DOMContentLoaded", () => {

    // Initialize Components
    const transModal = new TransactionModal();

    // Render Home by default
    const mainView = document.getElementById("main-view");
    if (mainView) {
        mainView.innerHTML = renderHome();
    }

    // Navigation Logic
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove("active"));
            // Add to clicked
            item.classList.add("active");

            const target = item.dataset.target;

            // Simple Router
            if (target === "home") {
                mainView.innerHTML = renderHome();
            } else if (target === "wallet") {
                mainView.innerHTML = renderWallet();
            } else {
                // Placeholder for other views
                mainView.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:40px; text-align:center; opacity:0.5;">
            <i class="fa-duotone fa-person-digging" style="font-size:48px; margin-bottom:16px;"></i>
            <h3>قريباً...</h3>
            <p>جارٍ العمل على شاشة ${target}</p>
          </div>
        `;
            }
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
