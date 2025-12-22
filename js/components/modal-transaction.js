export class TransactionModal {
    constructor() {
        this.modalId = 'transaction-modal';
        this.injectModal();
        this.bindEvents();
    }

    injectModal() {
        if (document.getElementById(this.modalId)) return;

        const modalHTML = `
      <div id="${this.modalId}" class="modal-overlay">
        <div class="modal-sheet">
          <div class="modal-header">
            <span class="modal-title">إضافة حركة</span>
            <button class="close-modal"><i class="fa-solid fa-xmark"></i></button>
          </div>
          
          <div class="modal-body">
            <!-- Type Toggle -->
            <div class="type-toggle">
              <div class="toggle-option active expense" data-type="expense">مصروف</div>
              <div class="toggle-option income" data-type="income">دخل</div>
            </div>

            <!-- Amount -->
            <div class="input-group">
              <label class="input-label">المبلغ</label>
              <div class="amount-input-wrapper">
                <span class="currency-prefix">₪</span>
                <input type="number" class="glass-input amount" placeholder="0.00" inputmode="decimal">
              </div>
            </div>

            <!-- Category -->
            <div class="input-group">
              <label class="input-label">الفئة</label>
              <select class="glass-input">
                <option value="food">🍔 طعام</option>
                <option value="shopping">🛒 تسوق</option>
                <option value="transport">⛽ مواصلات</option>
                <option value="bills">🧾 فواتير</option>
                <option value="salary">💰 راتب</option>
                <option value="other">✨ أخرى</option>
              </select>
            </div>

            <!-- Note -->
            <div class="input-group">
              <label class="input-label">ملاحظة (اختياري)</label>
              <input type="text" class="glass-input" placeholder="اكتب ملاحظة...">
            </div>

            <!-- Submit -->
            <button class="btn-primary" id="save-transaction-btn">حفظ</button>
          </div>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Close Button
        modal.querySelector('.close-modal').addEventListener('click', () => this.close());

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });

        // Toggle Type
        const toggles = modal.querySelectorAll('.toggle-option');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggles.forEach(t => t.classList.remove('active'));
                toggle.classList.add('active');
                // Animation handling could go here
            });
        });

        // Save Button
        modal.querySelector('#save-transaction-btn').addEventListener('click', () => {
            // Simulate Save
            const amount = modal.querySelector('.amount').value;
            if (!amount) return alert('يرجى إدخال المبلغ');

            console.log('Transaction Saved:', amount);
            this.close();

            // Optionally trigger success animation/toast
            alert('تم الحفظ بنجاح! 💾');
        });
    }

    open() {
        const modal = document.getElementById(this.modalId);
        if (modal) modal.classList.add('active');
    }

    close() {
        const modal = document.getElementById(this.modalId);
        if (modal) modal.classList.remove('active');
    }
}
