// 加载内容数据
async function loadContent() {
    try {
        const response = await fetch('data/content.json');
        const data = await response.json();
        await renderContent(data);
    } catch (error) {
        console.error('加载内容失败:', error);
        // 尝试使用默认内容
        try {
            const defaultResponse = await fetch('data/defaults/content.json');
            const defaultData = await defaultResponse.json();
            await renderContent(defaultData);
        } catch (defaultError) {
            console.error('加载默认内容也失败:', defaultError);
        }
    }
}

// 渲染内容到页面
async function renderContent(data) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        console.error('mainContent element not found');
        return;
    }
    
    mainContent.innerHTML = ''; // 清空现有内容

    // 渲染年历格子
    if (data.year_grid) {
        const titleDiv = document.createElement('div');
        titleDiv.className = 'nav-title';
        titleDiv.innerHTML = `
            <span class="nav-emoji"><i class="${data.year_grid.icon}"></i></span>
            ${data.year_grid.title}
        `;
        mainContent.appendChild(titleDiv);

        const yearGridDiv = document.createElement('div');
        yearGridDiv.className = 'year-grid-container';
        const canvas = document.createElement('canvas');
        canvas.id = 'yearCanvas';
        yearGridDiv.appendChild(canvas);
        mainContent.appendChild(yearGridDiv);
    }

    // 渲染链接部分
    if (Array.isArray(data.links)) {
        data.links.forEach(section => {
            // 创建标题
            const titleDiv = document.createElement('div');
            titleDiv.className = 'nav-title';
            titleDiv.innerHTML = `
                <span class="nav-emoji"><i class="${section.icon || 'fas fa-link'}"></i></span>
                ${section.title}
            `;
            mainContent.appendChild(titleDiv);

            // 如果没有 items，就不创建卡片容器
            if (!section.items || !Array.isArray(section.items)) return;

            // 创建卡片容器
            const containerDiv = document.createElement('div');
            containerDiv.className = 'links-container';

            // 渲染卡片
            section.items.forEach(item => {
                const cardLink = document.createElement('a');
                cardLink.href = item.link;
                cardLink.className = 'glass-card';
                
                // 处理外部链接
                if (!item.link.startsWith('javascript:')) {
                    cardLink.target = '_blank';
                    cardLink.rel = 'noopener noreferrer';
                }

                cardLink.innerHTML = `
                    <div class="card-icon">${item.icon}</div>
                    <div class="card-content">
                        <h3>${item.title}</h3>
                    </div>
                `;
                containerDiv.appendChild(cardLink);
            });

            mainContent.appendChild(containerDiv);
        });
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadContent); 