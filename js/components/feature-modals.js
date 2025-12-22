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

        // Generate Chart (Simple CSS/HTML Bars)
        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);

        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>التقارير المالية 📊</h2>
                    <p class="feature-subtitle">تحليل المصاريف لهذا الشهر</p>
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
                                <div class="chart-amt">${amount.toLocaleString()}</div>
                            </div>
                        `;
        }).join('')}
                </div>

                <button class="btn-primary" onclick="window.closeFeatureModal()">إغلاق</button>
            </div>
        `;
    },

    renderGoals() {
        return `
            <div class="feature-view">
                <div class="feature-header">
                    <h2>الأهداف المالية 🎯</h2>
                    <p class="feature-subtitle">خطط لمستقبلك</p>
                </div>

                <div class="goals-list">
                    <div class="goal-card">
                        <div class="goal-icon">🚗</div>
                        <div class="goal-info">
                            <div class="goal-title">شراء سيارة</div>
                            <div class="progress-bar-mini">
                                <div class="progress-fill" style="width: 45%;"></div>
                            </div>
                            <div class="goal-stats">
                                <span>12,000 / 25,000</span>
                                <span>45%</span>
                            </div>
                        </div>
                    </div>

                    <div class="goal-card">
                        <div class="goal-icon">🏝️</div>
                        <div class="goal-info">
                            <div class="goal-title">سفرة الصيف</div>
                            <div class="progress-bar-mini">
                                <div class="progress-fill" style="width: 20%;"></div>
                            </div>
                            <div class="goal-stats">
                                <span>2,000 / 10,000</span>
                                <span>20%</span>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn-dashed">+ إضافة هدف جديد</button>
                </div>

                <button class="btn-primary" onclick="window.closeFeatureModal()">إغلاق</button>
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
                    <p class="feature-subtitle">التزامات شهرية</p>
                </div>

                <div class="goals-list">
                    ${bills.map(bill => `
                        <div class="goal-card">
                            <div class="goal-icon">${bill.icon}</div>
                            <div class="goal-info">
                                <div class="goal-title">${bill.name}</div>
                                <div class="goal-stats">
                                    <span>${bill.amount} ريال</span>
                                    <input type="checkbox" class="checkbox-circle" style="width:20px; height:20px;">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary" onclick="window.closeFeatureModal()">إغلاق</button>
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
