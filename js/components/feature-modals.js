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

    renderBudget(transactions, currentBudget) {
        // Calc spent this month
        const now = new Date();
        const monthTx = transactions.filter(tx => {
            const d = new Date(tx.timestamp || tx.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && tx.type === 'expense';
        });

        const totalSpent = monthTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const percent = Math.min((totalSpent / currentBudget) * 100, 100);
        const remaining = currentBudget - totalSpent;
        const statusColor = remaining < 0 ? 'var(--danger-red)' : 'var(--success-green)';

        return `
             <div class="feature-view">
                <div class="feature-header">
                    <h2>الميزانية الشهرية 💸</h2>
                </div>
                
                <div class="budget-card" style="background:var(--bg-card); padding:20px; border-radius:20px; text-align:center; border:1px solid rgba(255,255,255,0.1);">
                    <div style="font-size:12px; color:var(--text-dim)">الميزانية المحددة</div>
                    <div style="font-size:24px; font-weight:bold; font-family:var(--font-num)" id="budget-display" contenteditable="true" onblur="window.handleAppAction('set_budget', this.innerText)">${currentBudget}</div>
                    <div style="font-size:10px; opacity:0.6;">(اضغط للرقم للتعديل)</div>
                    
                    <div class="progress-bar-mini" style="height:12px; margin: 20px 0; background:rgba(255,255,255,0.05)">
                        <div class="progress-fill" style="width: ${percent}%; background: ${remaining < 0 ? 'red' : 'var(--primary-neon)'}"></div>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; margin-top:10px;">
                        <div style="text-align:right">
                            <div style="font-size:10px; color:var(--text-dim)">مصروف</div>
                            <div style="font-family:var(--font-num); color:var(--danger-red)">${totalSpent.toLocaleString()}</div>
                        </div>
                         <div style="text-align:left">
                            <div style="font-size:10px; color:var(--text-dim)">متبقي</div>
                            <div style="font-family:var(--font-num); color:${statusColor}">${remaining.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                 <button class="btn-primary" style="margin-top:20px" onclick="window.closeFeatureModal()">إغلاق</button>
             </div>
        `;
    }
};

// Helper for Colors
function getColorForCat(cat) {
    const colors = ['#f72585', '#3fa9f5', '#9d4edd', '#00f5d4', '#ff9f1c'];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
