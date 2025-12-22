export function renderHome(transactions = []) {
  // 1. Calculate Totals (Current Month / Overall)
  // For simplicity v2 prototype, let's calc overall balance, 
  // and specific Income/Expense for the *Current Month*.

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalBalance = 0;
  let monthIncome = 0;
  let monthExpense = 0;

  // Sort descending by date
  const sortedTx = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  sortedTx.forEach(tx => {
    const amount = Number(tx.amount) || 0;
    const type = tx.type; // 'income' or 'expense'
    const date = new Date(tx.timestamp);

    // Balance Logic: Income adds, Expense subtracts
    if (type === 'income') {
      totalBalance += amount;
    } else {
      totalBalance -= amount;
    }

    // Monthly Stats
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      if (type === 'income') {
        monthIncome += amount;
      } else {
        monthExpense += amount;
      }
    }
  });

  // 2. Format Currency
  const fmt = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 3. Generate Recent Transactions HTML (Limit 4)
  const recentTxHtml = sortedTx.slice(0, 4).map(tx => {
    const isIncome = tx.type === 'income';
    const amountClass = isIncome ? 'positive' : 'negative';
    const sign = isIncome ? '+' : '-';

    // Category Icon Helper (Simple mapping)
    let iconClass = 'fa-sack-dollar';
    let catColorClass = 'category-salary';

    const category = String(tx.category || '');

    // Auto-detect category styles (Mock logic)
    if (category.includes('أكل') || category.includes('طعام')) {
      iconClass = 'fa-burger'; catColorClass = 'category-food';
    } else if (category.includes('سوبر') || category.includes('تسو')) {
      iconClass = 'fa-basket-shopping'; catColorClass = 'category-shopping';
    } else if (category.includes('سيارة') || category.includes('بنزين')) {
      iconClass = 'fa-gas-pump'; catColorClass = 'category-car';
    }

    const dateStr = new Date(tx.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });

    return `
      <div class="trans-item">
        <div class="trans-icon ${catColorClass}">
          <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="trans-details">
          <div class="trans-title">${tx.note || tx.category || 'بدون عنوان'}</div>
          <div class="trans-meta">${dateStr}</div>
        </div>
        <div class="trans-amount ${amountClass}">${sign} ${fmt(Number(tx.amount))}</div>
      </div>
    `;
  }).join('');


  return `
    <!-- Stories Rail -->
    <div class="stories-rail">
      <div class="story-item">
        <div class="story-ring positive"><i class="fa-solid fa-sack-dollar"></i></div>
        <span>الميزانية</span>
      </div>
      <div class="story-item">
        <div class="story-ring warning"><i class="fa-solid fa-file-invoice"></i></div>
        <span>فواتير</span>
      </div>
      <div class="story-item">
        <div class="story-ring accent"><i class="fa-solid fa-bullseye"></i></div>
        <span>أهداف</span>
      </div>
      <div class="story-item">
        <div class="story-ring"><i class="fa-solid fa-chart-pie"></i></div>
        <span>تقارير</span>
      </div>
    </div>

    <!-- Balance Card -->
    <div class="balance-card tilt-effect">
      <div class="card-bg"></div>
      <div class="card-content">
        <div class="card-top">
          <span class="card-label">الرصيد الحالي</span>
          <i class="fa-brands fa-cc-visa card-brand"></i>
        </div>
        <div class="balance-amount">
          <span class="currency">₪</span>
          <span class="value">${fmt(totalBalance)}</span>
        </div>
        <div class="card-bottom">
          <div class="card-info">
            <span class="label">دخل (شهر)</span>
            <span class="val positive">+ ${fmt(monthIncome)}</span>
          </div>
          <div class="card-info">
            <span class="label">صرف (شهر)</span>
            <span class="val negative">- ${fmt(monthExpense)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Title -->
    <div class="section-header">
      <h3>آخر الحركات</h3>
      <button class="btn-text">عرض الكل</button>
    </div>

    <!-- Transactions List -->
    <div class="transactions-list">
      ${recentTxHtml || '<div style="text-align:center; opacity:0.5; padding:20px;">لا توجد حركات بعد</div>'}
    </div>
    
    <div style="height: 20px;"></div>
  `;
}
