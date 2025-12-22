export const Features = {
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

    renderBudget(transactions, categoryBudgets = {}) {
        // 1. Calculate Spent per Category
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7);
        const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

        const spentByCat = {};
        let totalSpent = 0;
        expenses.forEach(t => {
            const c = t.category || 'غير مصنف';
            const amt = parseFloat(t.amount || 0);
            spentByCat[c] = (spentByCat[c] || 0) + amt;
            totalSpent += amt;
        });

        // 2. Get All Categories
        const categories = JSON.parse(localStorage.getItem('moneyfy_categories') || '[]');

        // 3. Render List
        const listHtml = categories.map(cat => {
            const spent = spentByCat[cat.name] || 0;
            const limit = parseFloat(categoryBudgets[cat.name] || 0);
            const percent = limit > 0 ? (spent / limit) * 100 : 0;

            // Analyze Status & AI Tip
            let statusColor = 'var(--success-green)';
            let tip = 'ممتاز! وضعك بالسليم 🟢';
            let barWidth = Math.min(percent, 100);

            if (limit === 0) {
                statusColor = '#888';
                tip = 'لم يتم تحديد ميزانية بعد ⚪';
            } else if (percent >= 100) {
                statusColor = 'var(--danger-red)';
                tip = 'تجاوزت الحد المسموح! 🚨 حاول تقليل المصاريف فوراً';
            } else if (percent >= 85) {
                statusColor = 'var(--accent-pink)'; // Orange-ish
                tip = 'انتبه! أوشكت الميزانية على الانتهاء 🛑';
            } else if (percent >= 50) {
                statusColor = 'var(--primary-neon)';
                tip = 'وصلت لمنتصف الميزانية، راقب صرفك 🟡';
            }

            return `
                <div class="budget-card-glass" style="background:rgba(255,255,255,0.05); border-radius:15px; padding:15px; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                             <div class="goal-icon">${cat.icon}</div>
                             <div style="font-weight:bold;">${cat.name}</div>
                        </div>
                        <div style="background:rgba(0,0,0,0.3); padding:5px 10px; border-radius:10px; font-size:0.9rem;">
                             ${spent.toLocaleString()} / 
                             <input type="number" 
                                    style="width:70px; background:none; border:none; color:white; border-bottom:1px solid rgba(255,255,255,0.3); text-align:center;" 
                                    placeholder="0" 
                                    value="${limit || ''}" 
                                    onchange="window.handleAppAction('set_category_budget', {category: '${cat.name}', amount: this.value})"> ₪
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden; margin-bottom:10px;">
                        <div style="height:100%; width:${barWidth}%; background:${statusColor}; transition:width 0.5s ease;"></div>
                    </div>

                    <!-- AI Tip -->
                    <div style="font-size:0.8rem; opacity:0.8; color:${statusColor === 'var(--success-green)' ? '#aaffaa' : statusColor}; display:flex; align-items:center; gap:5px;">
                         <i class="fa-solid fa-circle-info"></i> ${tip}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>الميزانية الذكية 🧠</h2>
                    <p class="feature-subtitle">راقب مصاريفك لكل فئة بدقة</p>
                </div>

                <div class="budget-list">
                    ${listHtml}
                </div>

                <div style="margin-top:20px; text-align:center; font-size:0.9rem; opacity:0.6;">
                    💡 نصيحة: حدد مبلغاً لكل فئة لتفعيل التنبيهات الذكية
                </div>

                <button class="btn-primary" onclick="window.closeFeatureModal()" style="margin-top:20px;">إغلاق</button>
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


};

// Helper for Colors
function getColorForCat(cat) {
    const colors = ['#f72585', '#3fa9f5', '#9d4edd', '#00f5d4', '#ff9f1c'];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
