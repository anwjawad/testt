export class AuthSystem {
    constructor() {
        this.users = [
            { id: 'user_1', name: 'جواد', avatar: 'https://ui-avatars.com/api/?name=Jawad&background=3fa9f5&color=fff', pin: null },
            { id: 'user_2', name: 'أمل', avatar: 'https://ui-avatars.com/api/?name=Amal&background=ff4081&color=fff', pin: null }
        ];
        this.currentUser = null;
        this.overlayId = 'auth-overlay';
    }

    init() {
        // Check if already logged in (Persistent Session)
        const savedUser = localStorage.getItem('moneyfy_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateHeader();
            return true; // Logged in
        }

        this.render();
        return false; // Not logged in
    }

    render() {
        // Create Overlay
        const overlay = document.createElement('div');
        overlay.id = this.overlayId;
        overlay.className = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-card glass-panel">
                <div class="auth-logo">
                    <div class="logo-circle">M</div>
                    <h2>Moneyfy V2</h2>
                </div>
                <p class="auth-subtitle">مرحباً بك، من أنت؟</p>
                
                <div class="users-grid">
                    ${this.users.map(u => `
                        <div class="user-select" data-id="${u.id}">
                            <img src="${u.avatar}" class="auth-avatar">
                            <span>${u.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.attachEvents(overlay);
    }

    attachEvents(overlay) {
        const users = overlay.querySelectorAll('.user-select');

        // User Selection -> Direct Login
        users.forEach(u => {
            u.addEventListener('click', () => {
                const selectedUser = this.users.find(user => user.id === u.dataset.id);
                this.login(selectedUser);
            });
        });
    }

    login(user) {
        this.currentUser = user;
        localStorage.setItem('moneyfy_user', JSON.stringify(user));
        this.updateHeader();

        // Remove Overlay with animation
        const overlay = document.getElementById(this.overlayId);
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);

        // Notify App
        window.dispatchEvent(new CustomEvent('auth-success'));
    }

    logout() {
        localStorage.removeItem('moneyfy_user');
        window.location.reload();
    }

    updateHeader() {
        const nameEl = document.getElementById('current-user-name');
        const avatarEl = document.querySelector('.user-profile img');
        if (nameEl && this.currentUser) nameEl.textContent = this.currentUser.name;
        if (avatarEl && this.currentUser) avatarEl.src = this.currentUser.avatar;
    }
}
