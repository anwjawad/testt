export function renderMarket(items = []) {
  // Separate items
  const pending = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  // Calc progress
  const total = items.length;
  const done = completed.length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  // Generate HTML for Pending
  const pendingHtml = pending.length ? pending.map(item => `
    <div class="shop-item" data-id="${item.id}" data-name="${item.name}">
      <div class="checkbox-circle" onclick="window.handleMarketAction('buy', '${item.id}', '${item.name}')"></div>
      <span class="item-name">${item.name}</span>
      <div class="drag-handle"><i class="fa-solid fa-grip-lines"></i></div>
    </div>
  `).join('') : '<div style="text-align:center; opacity:0.5; padding:20px; font-size:12px;">القائمة فارغة 🎉</div>';

  // Generate HTML for Completed
  const completedHtml = completed.map(item => `
    <div class="shop-item completed" data-id="${item.id}">
      <div class="checkbox-circle checked" onclick="window.handleMarketAction('restore', '${item.id}')"><i class="fa-solid fa-check"></i></div>
      <span class="item-name">${item.name}</span>
    </div>
  `).join('');

  return `
    <div class="section-header">
      <h3>السوق</h3>
      <button class="btn-text" onclick="window.handleMarketAction('clear_completed')"><i class="fa-solid fa-trash-can"></i> تنظيف</button>
    </div>

    <!-- Active List -->
    <div class="market-list-container">
      
      <!-- List Header -->
      <div class="market-card-header">
        <div class="list-info">
          <span class="list-name">🛒 مقاضي البيت</span>
          <span class="list-count">${done}/${total} عنصر</span>
        </div>
        <div class="progress-bar-mini">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="add-item-row">
        <input type="text" class="glass-input-sm" placeholder="أضف غرض جديد..." id="new-item-input" onkeypress="if(event.key==='Enter') window.handleMarketAction('add')">
        <button class="add-btn-sm" onclick="window.handleMarketAction('add')"><i class="fa-solid fa-arrow-up"></i></button>
      </div>

      <!-- Items List -->
      <div class="shopping-items-list" id="shopping-list">
        
        <!-- Pending Items -->
        <h4 class="list-section-title">مطلوب</h4>
        ${pendingHtml}

        <!-- Completed Items -->
        ${completed.length ? `<h4 class="list-section-title mt-4">تم الشراء</h4>${completedHtml}` : ''}

      </div>
    </div>
    
    <div style="height: 40px;"></div>
  `;
}
