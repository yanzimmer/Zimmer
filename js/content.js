// 加载内容数据
async function loadContent() {
    try {
        const response = await fetch('data/content.json');
        const data = await response.json();
        await renderContent(data);
        // 延迟初始化年历格子
        setTimeout(() => {
            if (typeof initYearGrid === 'function') {
                initYearGrid();
            }
        }, 100);
    } catch (error) {
        console.error('加载内容失败:', error);
    }
}

// 渲染内容到页面
async function renderContent(data) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = ''; // 清空现有内容

    for (const section of data.sections) {
        // 创建标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'nav-title';
        titleDiv.innerHTML = `
            <span class="nav-emoji"><i class="${section.icon}"></i></span>
            ${section.title}
        `;
        mainContent.appendChild(titleDiv);

        // 处理不同类型的内容
        if (section.content) {
            // 如果是自定义内容
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = section.content;
            mainContent.appendChild(contentDiv);
        } else if (section.cards) {
            // 如果是卡片内容
            const containerDiv = document.createElement('div');
            containerDiv.className = 'links-container';

            section.cards.forEach(card => {
                const cardLink = document.createElement('a');
                cardLink.href = card.link;
                cardLink.className = 'glass-card';
                
                // 如果是外部链接且不是javascript:开头的链接
                if (!card.link.startsWith('javascript:')) {
                    cardLink.target = '_blank';
                    cardLink.rel = 'noopener noreferrer';
                }

                cardLink.innerHTML = `
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-content">
                        <h3>${card.title}</h3>
                        <p>${card.description}</p>
                    </div>
                `;
                containerDiv.appendChild(cardLink);
            });

            mainContent.appendChild(containerDiv);
        }
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadContent); 