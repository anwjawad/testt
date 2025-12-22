export function renderWallet(transactions = []) {
  // 1. Calculate Summary
  let walletIncome = 0;
  let walletExpense = 0;

  const sortedTx = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  sortedTx.forEach(tx => {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') walletIncome += amount;
    else walletExpense += amount;
  });

  const fmt = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 2. Group by Date
  const grouped = {};
  sortedTx.forEach(tx => {
    const d = new Date(tx.timestamp);
    // Key: YYYY-MM-DD
    const key = d.toISOString().split('T')[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  });

  // 3. Generate List HTML
  let listHtml = '';

  if (sortedTx.length === 0) {
    listHtml = `<div style="text-align:center; margin-top:40px; color:var(--text-dim);">لا توجد حركات في المحفظة حالياً</div>`;
  } else {
    // Process groups
    Object.keys(grouped).forEach(dateKey => {
      const groupTx = grouped[dateKey];

      // Date Label
      let dateLabel = dateKey;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (dateKey === today) dateLabel = 'اليوم';
      else if (dateKey === yesterday) dateLabel = 'أمس';

      listHtml += `<div style="margin-bottom: 8px; font-size:12px; color:var(--text-dim); font-weight:600; margin-top:20px;">${dateLabel}</div>`;
      listHtml += `<div class="transactions-list">`;

      groupTx.forEach(tx => {
        const isIncome = tx.type === 'income';
        const amountClass = isIncome ? 'positive' : 'negative';
        const sign = isIncome ? '+' : '-';

        // Icon Logic
        let iconClass = 'fa-sack-dollar';
        let catColorClass = 'category-salary';
        if (tx.category.includes('أكل') || tx.category.includes('طعام')) { iconClass = 'fa-burger'; catColorClass = 'category-food'; }
        else if (tx.category.includes('سوبر') || tx.category.includes('تسو')) { iconClass = 'fa-basket-shopping'; catColorClass = 'category-shopping'; }
        else if (tx.category.includes('سيارة') || tx.category.includes('بنزين') || tx.category.includes('مواصلات')) { iconClass = 'fa-gas-pump'; catColorClass = 'category-car'; }

        const timeStr = new Date(tx.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        listHtml += `
          <div class="trans-item">
            <div class="trans-icon ${catColorClass}"><i class="fa-solid ${iconClass}"></i></div>
            <div class="trans-details">
              <div class="trans-title">${tx.note || tx.category || 'حركة عامة'}</div>
              <div class="trans-meta">${timeStr}</div>
            </div>
            <div class="trans-amount ${amountClass}">${sign} ${fmt(Number(tx.amount))}</div>
          </div>
         `;
      });
      listHtml += `</div>`; // End group list
    });
  }


  return `
    <div class="section-header">
      <h3>المحفظة</h3>
      <div style="font-size:12px; color:var(--text-dim); cursor:pointer;">الكل <i class="fa-solid fa-chevron-down"></i></div>
    </div>

    <!-- Summary Cards -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:20px;">
      <div style="background:var(--bg-card); padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
        <div style="font-size:12px; color:var(--text-dim); margin-bottom:4px;">مجموع الدخل</div>
        <div style="font-family:var(--font-num); font-size:18px; font-weight:700; color:var(--success-green);">+ ${fmt(walletIncome)}</div>
      </div>
      <div style="background:var(--bg-card); padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
        <div style="font-size:12px; color:var(--text-dim); margin-bottom:4px;">مجموع الصرف</div>
        <div style="font-family:var(--font-num); font-size:18px; font-weight:700; color:var(--accent-pink);">${fmt(walletExpense * -1)}</div>
      </div>
    </div>

    ${listHtml}
    
    <div style="height: 40px;"></div>
  `;
}
