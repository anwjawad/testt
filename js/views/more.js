export function renderMore() {
  return `
    <div class="section-header">
      <h3>المزيد</h3>
    </div>

    <div class="more-grid">
      <!-- Goals -->
      <div class="more-card">
        <div class="more-icon accent"><i class="fa-solid fa-bullseye"></i></div>
        <span class="more-title">الأهداف</span>
        <span class="more-desc">خطط لمستقبلك المالي</span>
      </div>

      <!-- Reports -->
      <div class="more-card">
        <div class="more-icon warning"><i class="fa-solid fa-chart-pie"></i></div>
        <span class="more-title">التقارير</span>
        <span class="more-desc">تحليل المصاريف والدخل</span>
      </div>

      <!-- Categories -->
      <div class="more-card">
        <div class="more-icon positive"><i class="fa-solid fa-tags"></i></div>
        <span class="more-title">التصنيفات</span>
        <span class="more-desc">إدارة فئات الصرف</span>
      </div>

       <!-- Data Management -->
       <div class="more-card">
        <div class="more-icon"><i class="fa-solid fa-database"></i></div>
        <span class="more-title">البيانات</span>
        <span class="more-desc">تحديث ومزامنة</span>
      </div>

      <!-- Settings -->
      <div class="more-card">
        <div class="more-icon"><i class="fa-solid fa-gear"></i></div>
        <span class="more-title">الإعدادات</span>
        <span class="more-desc">التفضيلات والتنبيهات</span>
      </div>

      <!-- Logout -->
      <div class="more-card" onclick="window.handleAppAction('logout')">
        <div class="more-icon negative"><i class="fa-solid fa-right-from-bracket"></i></div>
        <span class="more-title">تسجيل خروج</span>
        <span class="more-desc">تبديل المستخدم</span>
      </div>
    </div>
    
    <div style="height: 40px;"></div>
  `;
}
