// Market View Component
export function renderMarket(shoppingList, currentUser) {
    // Permission Check: Amal (user_2) cannot buy
    const canBuy = currentUser && currentUser.id !== 'user_2';

    // Load Title
    const savedTitle = localStorage.getItem('market_title') || '🛒 مقاضي البيت';

    // Calculate Progress
    const total = shoppingList.length;
    const completed = shoppingList.filter(i => i.completed).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;

    const listHtml = shoppingList.length === 0
        ? `<div class="empty-state">
             <i class="fa-solid fa-basket-shopping" style="font-size: 40px; opacity: 0.3; margin-bottom:10px;"></i>
             <p>القائمة فارغة</p>
           </div>`
        : shoppingList.map(item => `
            <div class="shop-item ${item.completed ? 'completed' : ''}">
                <!-- Delete Button (Available for All) -->
                <div class="drag-handle" onclick="window.handleMarketAction('delete', '${item.id}')" style="color:var(--danger-red); opacity: 0.7; margin-left:8px; cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </div>
                
                <span class="item-name">${item.name}</span>
                
                <!-- Buy Button (Restricted) -->
                ${canBuy ? `
                    <div class="checkbox-circle ${item.completed ? 'checked' : ''}" 
                         onclick="window.handleMarketAction(this.classList.contains('checked') ? 'restore' : 'buy', '${item.id}', '${item.name}')">
                        ${item.completed ? '<i class="fa-solid fa-check"></i>' : ''}
                    </div>
                ` : `
                    <!-- Read Only State for Wife -->
                    <div style="font-size:12px; opacity:0.5; margin-left:10px;">
                        ${item.completed ? 'تم ✅' : 'مطلوب'}
                    </div>
                `}
            </div>
        `).join('');

    return `
        <!-- Market Header -->
        <div class="market-list-container">
            <div class="market-card-header">
                <div class="list-info">
                    <h2 class="list-name" contenteditable="true" id="market-title" 
                        onblur="localStorage.setItem('market_title', this.innerText)">${savedTitle}</h2>
                    <span class="list-count">${completed}/${total}</span>
                </div>
                
                <div class="progress-bar-mini">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>

                <div class="add-item-row mt-4">
                    <input type="text" id="new-item-input" class="glass-input-sm" placeholder="أضف غرض جديد..." onkeypress="if(event.key === 'Enter') document.getElementById('add-btn').click()">
                    <button id="add-btn" class="add-btn-sm" onclick="window.handleMarketAction('add', null, document.getElementById('new-item-input').value)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    ${total > 0 && canBuy ? `<button class="add-btn-sm" style="background:var(--bg-deep); border:1px solid rgba(255,255,255,0.1); margin-right:8px;" onclick="if(confirm('تنظيف المكتمل؟')) window.handleMarketAction('clear')">
                        <i class="fa-solid fa-broom"></i>
                    </button>` : ''}
                </div>
            </div>

            <!-- List Items -->
             <div class="list-section-title">القائمة الحالية</div>
             ${listHtml}
        </div>
        
        <div style="height: 100px;"></div> <!-- Spacer -->
    `;
}
