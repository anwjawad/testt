export const Features = {
    renderReports(transactions) {
        // Calculate Totals by Category
        const categories = {};
        let totalExpense = 0;

        transactions.forEach(tx => {
            if (tx.type === 'expense') {
                const amount = parseFloat(tx.amount);
                categories[tx.category] = (categories[tx.category] || 0) + amount;
                totalExpense += amount;
            }
        });

        // Sort categories
        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);

        // Generate SVG Pie Chart
        let currentAngle = 0;
        const radius = 16;
        const circumference = 2 * Math.PI * radius;

        let paths = '';
        if (totalExpense > 0) {
            paths = sortedCats.map(([cat, amount], index) => {
                const percentage = amount / totalExpense;
                const dashArray = percentage * circumference;
                const color = getColorForCat(cat);

                // For simplicity in SVG dasharray pie, we just need the offset
                // But native SVG dasharray circle is easier

                // Let's use Conic Gradient for CSS Pie Chart (Easiest & Cleanest)
                return '';
            }).join('');
        }

        // CSS Conic Dividend
        let gradientStr = '';
        let deg = 0;
        sortedCats.forEach(([cat, amount]) => {
            const percent = (amount / totalExpense) * 100;
            const color = getColorForCat(cat);
            gradientStr += `${color} ${deg}% ${deg + percent}%, `;
            deg += percent;
        });
        gradientStr = gradientStr.slice(0, -2); // remove last comma

        if (!gradientStr) gradientStr = '#333 0% 100%';

        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>التقارير المالية 📊</h2>
                    <p class="feature-subtitle">تحليل المصاريف لهذا الشهر</p>
                </div>

                <div style="display:flex; justify-content:center; margin: 20px 0;">
                    <div style="width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(${gradientStr}); position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="position:absolute; inset: 25%; background: var(--bg-card); border-radius: 50%; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                           <span style="font-size:10px; color:var(--text-dim)">المجموع</span>
                           <span style="font-weight:bold; font-family:var(--font-num)">${totalExpense.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="chart-container-glass">
                    ${sortedCats.length === 0 ? '<p class="empty-msg">لا توجد بيانات لهذا الشهر</p>' : ''}
                    ${sortedCats.map(([cat, amount]) => {
            const percent = ((amount / totalExpense) * 100).toFixed(0);
            return `
                            <div class="chart-bar-row">
                                <div class="chart-label">
                                    <span>${cat}</span>
                                    <span>${percent}%</span>
                                </div>
                                <div class="chart-track">
                                    <div class="chart-fill" style="width: ${percent}%; background: ${getColorForCat(cat)}"></div>
                                </div>
                                <div class="chart-amt">₪ ${amount.toLocaleString()}</div>
                            </div>
                        `;
        }).join('')}
                </div>

                <button class="btn-primary" onclick="window.closeFeatureModal()">إغلاق</button>
            </div>
        `;
    },

    renderGoals(goals = []) {
        const goalsHtml = goals.length === 0 ? '<p class="empty-msg">لم تقم بإضافة أهداف بعد</p>' :
            goals.map(g => `
                 <div class="goal-card">
                    <div class="goal-icon">${g.icon || '🎯'}</div>
                    <div class="goal-info">
                        <div class="goal-title">${g.title}</div>
                        <div class="progress-bar-mini">
                            <div class="progress-fill" style="width: ${(g.saved / g.target) * 100}%;"></div>
                        </div>
                        <div class="goal-stats">
                            <span>${g.saved} / ${g.target}</span>
                            <span>${Math.round((g.saved / g.target) * 100)}%</span>
                        </div>
                    </div>
                    <!-- Delete Goal -->
                    <div onclick="window.handleAppAction('delete_goal', '${g.id}')" style="color:var(--danger-red); opacity:0.6; cursor:pointer"><i class="fa-solid fa-trash"></i></div>
                </div>
            `).join('');

        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>الأهداف المالية 🎯</h2>
                </div>

                <div class="goals-list">${goalsHtml}</div>
                
                <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin: 20px 0;">

                <!-- Add Goal Form -->
                <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:12px;">
                    <h4 style="margin-bottom:10px; font-size:14px;">أضف هدف جديد</h4>
                    <input type="text" id="goal-title" class="glass-input-sm" placeholder="اسم الهدف (مثلاً: سيارة)" style="margin-bottom:8px;">
                    <input type="number" id="goal-target" class="glass-input-sm" placeholder="المبلغ المطلوب" style="margin-bottom:8px;">
                     <input type="number" id="goal-saved" class="glass-input-sm" placeholder="المبلغ المتوفر حالياً" style="margin-bottom:8px;">
                    <button class="add-btn-sm" style="width:100%" onclick="window.handleAppAction('add_goal')">حفظ الهدف</button>
                </div>

                <button class="btn-text" style="width:100%; margin-top:20px;" onclick="window.closeFeatureModal()">إغلاق</button>
            </div>
        `;
    },

    renderBills() {
        const bills = [
            { name: 'إيجار المنزل', amount: '3,500', icon: '🏠' },
            { name: 'فاتورة الكهرباء', amount: '450', icon: '⚡' },
            { name: 'الإنترنت', amount: '250', icon: '🌐' },
            { name: 'اشتراك النادي', amount: '300', icon: '💪' }
        ];

        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>الفواتير الثابتة 🧾</h2>
                    <p class="feature-subtitle">التزامات شهرية (ثابتة)</p>
                </div>

                <div class="goals-list">
                    ${bills.map(bill => `
                        <div class="goal-card">
                            <div class="goal-icon">${bill.icon}</div>
                            <div class="goal-info">
                                <div class="goal-title">${bill.name}</div>
                                <div class="goal-stats">
                                    <span>${bill.amount} ريال</span>
                                    <div class="checkbox-circle" onclick="this.classList.toggle('checked')"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary" onclick="window.closeFeatureModal()">إغلاق</button>
            </div>
        `;
    },

    renderCategories(categories) {
        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>إدارة الفئات 🏷️</h2>
                    <p class="feature-subtitle">تخصيص تصنيفات المصاريف</p>
                </div>

                <div class="goals-list">
                    ${categories.map(cat => `
                        <div class="goal-card" style="padding:10px;">
                            <div class="goal-icon">${cat.icon || '🏷️'}</div>
                            <div class="goal-info">
                                <div class="goal-title">${cat.name}</div>
                            </div>
                            <div onclick="window.handleAppAction('delete_category', '${cat.name}')" style="color:var(--danger-red); opacity:0.6; cursor:pointer"><i class="fa-solid fa-trash"></i></div>
                        </div>
                    `).join('')}
                </div>

                <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin: 20px 0;">

                <div style="background:rgba(255,255,255,0.03); padding:15px; border-radius:12px;">
                    <h4 style="margin-bottom:10px; font-size:14px;">أضف فئة جديدة</h4>
                    <div style="display:flex; gap:8px;">
                         <input type="text" id="cat-icon" class="glass-input-sm" placeholder="الرمز (emoji)" style="width:60px; text-align:center;">
                         <input type="text" id="cat-name" class="glass-input-sm" placeholder="اسم الفئة" style="flex:1;">
                    </div>
                    <button class="add-btn-sm" style="width:100%; margin-top:10px;" onclick="window.handleAppAction('add_category')">حفظ</button>
                </div>

                <button class="btn-primary" onclick="window.closeFeatureModal()">إغلاق</button>
            </div>
        `;
    },

    renderReports(transactions) {
        // Calculate Totals per Category
        const expenses = transactions.filter(t => t.type === 'expense');
        const totalExp = expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        // Group by Category
        const byCat = {};
        expenses.forEach(t => {
            const c = t.category || 'غير مصنف';
            byCat[c] = (byCat[c] || 0) + parseFloat(t.amount || 0);
        });

        // Ensure all default categories are listed even if 0
        const defaults = JSON.parse(localStorage.getItem('moneyfy_categories') || '[]');
        const catList = defaults.map(d => {
            return {
                name: d.name,
                icon: d.icon,
                amount: byCat[d.name] || 0,
                percent: totalExp > 0 ? ((byCat[d.name] || 0) / totalExp) * 100 : 0
            };
        });

        // Add any "Extra" categories not in default list
        Object.keys(byCat).forEach(key => {
            if (!defaults.find(d => d.name === key)) {
                catList.push({
                    name: key,
                    icon: '❓',
                    amount: byCat[key],
                    percent: totalExp > 0 ? (byCat[key] / totalExp) * 100 : 0
                });
            }
        });

        // Sort by Amount Desc
        catList.sort((a, b) => b.amount - a.amount);

        // Conic Gradient Logic
        let gradientParts = [];
        let currentDeg = 0;
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C', '#2EC4B6', '#E71D36', '#FDFFFC', '#011627'];

        catList.forEach((c, i) => {
            if (c.percent > 0) {
                const deg = (c.percent / 100) * 360;
                gradientParts.push(`${colors[i % colors.length]} ${currentDeg}deg ${currentDeg + deg}deg`);
                currentDeg += deg;
            }
        });

        const conic = gradientParts.length > 0 ? `conic-gradient(${gradientParts.join(', ')})` : 'conic-gradient(#333 0deg 360deg)';


        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>تحليل المصاريف 📊</h2>
                    <p class="feature-subtitle">إجمالي المصروفات: <span style="color:var(--danger-red); font-weight:bold;">${totalExp.toLocaleString()} ₪</span></p>
                </div>

                <div class="chart-container-glass" style="margin-bottom: 25px;">
                    <div class="pie-chart" style="background: ${conic}; width: 140px; height: 140px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.1); box-shadow: 0 0 20px rgba(0,0,0,0.3);"></div>
                </div>

                <div class="report-table" style="width: 100%; font-size: 0.95rem;">
                    ${catList.map((c, i) => `
                        <div class="report-row" style="display:flex; align-items:center; justify-content:space-between; padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                                <div style="width:10px; height:10px; border-radius:50%; background:${colors[i % colors.length]};"></div>
                                <span>${c.icon || ''} ${c.name}</span>
                            </div>
                            <div style="text-align:left;">
                                <div style="font-weight:bold;">${c.amount.toLocaleString()} ₪</div>
                                <div style="font-size:0.8rem; opacity:0.7;">${c.percent.toFixed(1)}%</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                 <button class="btn-primary" onclick="window.closeFeatureModal()" style="margin-top:20px;">إغلاق</button>
            </div>
        `;
    },

    renderSettings() {
        return `
             <div class="feature-view">
                <div class="feature-header">
                    <h2>الإعدادات ⚙️</h2>
                    <p class="feature-subtitle">التفضيلات والتنبيهات</p>
                </div>

                <div class="settings-group" style="background:rgba(255,255,255,0.05); border-radius:15px; padding:15px; margin-bottom:15px; text-align:right;">
                    <h3 style="font-size:16px; margin-bottom:15px; color:var(--primary-neon);">🎨 المظهر</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                         <span>لون مميز</span>
                         <input type="color" value="#00f3ff" style="border:none; width:40px; height:40px; cursor:pointer;" onchange="document.documentElement.style.setProperty('--primary-neon', this.value)">
                    </div>
                </div>

                 <div class="settings-group" style="background:rgba(255,255,255,0.05); border-radius:15px; padding:15px; margin-bottom:15px; text-align:right;">
                    <h3 style="font-size:16px; margin-bottom:15px; color:var(--accent-pink);">🔔 التنبيهات</h3>
                     <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                         <span>تذكير يومي بتسجيل المصاريف</span>
                         <label class="switch">
                            <input type="checkbox" checked onchange="window.showToast('تم تحديث إعدادات التنبيهات')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                     <div style="display:flex; justify-content:space-between; align-items:center;">
                         <span>تنبيه تجاوز الميزانية</span>
                         <label class="switch">
                            <input type="checkbox" checked onchange="window.showToast('تم تحديث إعدادات التنبيهات')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div class="settings-group" style="background:rgba(255,255,255,0.05); border-radius:15px; padding:15px; margin-bottom:15px; text-align:right;">
                    <h3 style="font-size:16px; margin-bottom:15px; color:var(--success-green);">💾 البيانات</h3>
                    <button class="glass-btn-sm" style="width:100%; margin-bottom:10px;" onclick="window.handleAppAction('export_csv')"><i class="fa-solid fa-file-csv"></i> تصدير البيانات (Excel/CSV)</button>
                    <button class="glass-btn-sm" style="width:100%; color:var(--danger-red); border-color:var(--danger-red);" onclick="window.handleAppAction('reset_app')"><i class="fa-solid fa-triangle-exclamation"></i> إعادة ضبط المصنع</button>
                </div>

                <button class="btn-primary" onclick="window.closeFeatureModal()">حفظ وإغلاق</button>

                <style>
                    /* Toggle Switch CSS (Mini) */
                    .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
                    .switch input { opacity: 0; width: 0; height: 0; }
                    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
                    .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
                    input:checked + .slider { background-color: var(--primary-neon); }
                    input:checked + .slider:before { transform: translateX(20px); }
                </style>
             </div>
        `;
    },
    // Calc spent this month

};

// Helper for Colors
function getColorForCat(cat) {
    const colors = ['#f72585', '#3fa9f5', '#9d4edd', '#00f5d4', '#ff9f1c'];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
