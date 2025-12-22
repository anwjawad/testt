export function renderMarket() {
    return `
    <div class="section-header">
      <h3>السوق</h3>
      <button class="btn-text"><i class="fa-solid fa-plus"></i> قائمة جديدة</button>
    </div>

    <!-- Active List -->
    <div class="market-list-container">
      
      <!-- List Header -->
      <div class="market-card-header">
        <div class="list-info">
          <span class="list-name">🛒 مقاضي البيت</span>
          <span class="list-count">3/12 عنصر</span>
        </div>
        <div class="progress-bar-mini">
          <div class="progress-fill" style="width: 25%"></div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="add-item-row">
        <input type="text" class="glass-input-sm" placeholder="أضف غرض جديد..." id="new-item-input">
        <button class="add-btn-sm"><i class="fa-solid fa-arrow-up"></i></button>
      </div>

      <!-- Items List (Draggable) -->
      <div class="shopping-items-list" id="shopping-list">
        
        <!-- Pending Items -->
        <h4 class="list-section-title">مطلوب</h4>
        
        <div class="shop-item" draggable="true">
          <div class="checkbox-circle"></div>
          <span class="item-name">حليب المراعي (2 لتر)</span>
          <div class="drag-handle"><i class="fa-solid fa-grip-lines"></i></div>
        </div>

        <div class="shop-item" draggable="true">
          <div class="checkbox-circle"></div>
          <span class="item-name">خبز توست</span>
          <div class="drag-handle"><i class="fa-solid fa-grip-lines"></i></div>
        </div>

        <div class="shop-item" draggable="true">
          <div class="checkbox-circle"></div>
          <span class="item-name">بيض (طبق 30)</span>
          <div class="drag-handle"><i class="fa-solid fa-grip-lines"></i></div>
        </div>

        <!-- Completed Items -->
        <h4 class="list-section-title mt-4">تم الشراء</h4>
        
        <div class="shop-item completed">
          <div class="checkbox-circle checked"><i class="fa-solid fa-check"></i></div>
          <span class="item-name">طماطم (1 كيلو)</span>
        </div>

      </div>
    </div>
    
    <div style="height: 40px;"></div>
  `;
}
