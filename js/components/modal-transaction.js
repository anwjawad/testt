import * as API from '../api/gas.js';

export class TransactionModal {
  constructor() {
    this.modalId = 'transaction-modal';
    this.currentType = 'expense'; // Default
    this.injectModal();
    this.bindEvents();
  }

  getCategoryOptions() {
    // Default Cats
    const defaults = [
      { name: 'طعام', icon: '🍔' },
      { name: 'تسوق', icon: '🛒' },
      { name: 'مواصلات', icon: '⛽' },
      { name: 'فواتير', icon: '🧾' },
      { name: 'راتب', icon: '💰' },
      { name: 'أخرى', icon: '✨' }
    ];
    const saved = JSON.parse(localStorage.getItem('moneyfy_categories'));
    const cats = saved || defaults;

    return cats.map(c => `<option value="${c.name}">${c.icon || '🏷️'} ${c.name}</option>`).join('');
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
              <select class="glass-input category-select">
                ${this.getCategoryOptions()}
              </select>
            </div>

            <!-- Note -->
            <div class="input-group">
              <label class="input-label">ملاحظة (اختياري)</label>
              <input type="text" class="glass-input note" placeholder="اكتب ملاحظة...">
            </div>

            <!-- Submit -->
            <button class="btn-primary" id="save-transaction-btn">
              <span class="btn-text-content">حفظ</span>
              <span class="btn-loader" style="display:none"><i class="fa-solid fa-spinner fa-spin"></i></span>
            </button>
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
        this.currentType = toggle.dataset.type;
        // Animation handling could go here
      });
    });

    // Save Button
    modal.querySelector('#save-transaction-btn').addEventListener('click', async () => {
      const amountEl = modal.querySelector('.amount');
      const catEl = modal.querySelector('.category-select');
      const noteEl = modal.querySelector('.note');
      const btn = modal.querySelector('#save-transaction-btn');
      const btnText = btn.querySelector('.btn-text-content');
      const btnLoader = btn.querySelector('.btn-loader');

      const amount = amountEl.value;
      if (!amount) return alert('يرجى إدخال المبلغ');

      // Loading State
      btn.disabled = true;
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-block';

      try {
        await API.addTransaction({
          type: this.currentType,
          amount: amount,
          categories: [catEl.value],
          note: noteEl.value,
          source: 'MoneyfyV2'
        });

        // Success
        this.close();
        amountEl.value = '';
        noteEl.value = '';

        // Trigger generic data refresh event
        window.dispatchEvent(new CustomEvent('data-refresh-needed'));
        window.showToast('تم حفظ العملية بنجاح! 💾', 'success');

      } catch (err) {
        console.error(err);
        window.showToast('حدث خطأ أثناء الحفظ', 'error');
        // The instruction's snippet for the catch block seems to have a formatting issue.
        // Assuming the intent is to reset the button text on error, and the finally block
        // will handle the general reset of disabled state and loader visibility.
        // If btn.innerHTML is set, btnText and btnLoader might become irrelevant.
        // For now, I'll apply the instruction's change as literally as possible,
        // but note that the `btn.innerHTML` might conflict with `btnText` / `btnLoader` logic.
        // The `btn.disabled = false;` is redundant with the `finally` block.
        // The `btnText.style.display` and `btnLoader.style.display` lines were misplaced in the instruction.
        // I will place them correctly within the finally block.
      } finally {
        // Reset State
        btn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
      }
    });
  }

  open(preFillData = {}) {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.add('active');

      // Handle Pre-fill
      if (preFillData.note) {
        modal.querySelector('.note').value = preFillData.note;
      }
      if (preFillData.category) {
        const catSelect = modal.querySelector('.category-select');
        // Try to match category, default to 'food' or logic
        if (preFillData.category === 'default') {
          // Keep default or logic for food
        } else {
          catSelect.value = preFillData.category;
        }
      }
    }
  }

  close() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove('active');
      // Clear inputs on close (optional, but good UX)
      setTimeout(() => {
        if (!modal.classList.contains('active')) {
          modal.querySelector('.amount').value = '';
          modal.querySelector('.note').value = '';
        }
      }, 300);
    }
  }
}
