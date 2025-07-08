// 加载社交媒体数据
async function loadSocialLinks() {
    try {
        const response = await fetch('data/social.json');
        const data = await response.json();
        renderSocialLinks(data.social_links);
    } catch (error) {
        console.error('加载社交媒体数据失败:', error);
    }
}

// 渲染社交媒体链接
function renderSocialLinks(links) {
    const container = document.getElementById('social-links');
    container.innerHTML = ''; // 清空容器
    
    links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.className = 'social-link';
        
        // 创建图标元素
        const icon = document.createElement('i');
        icon.className = link.icon;
        
        // 创建文本节点
        const text = document.createTextNode(link.label);
        
        // 添加图标和文本
        linkElement.appendChild(icon);
        linkElement.appendChild(text);

        if (link.qrcode) {
            // 对于需要显示二维码的链接
            linkElement.href = 'javascript:void(0)';
            linkElement.addEventListener('click', () => showQRCode(link.qrcode));
        } else if (link.url) {
            // 对于直接跳转的链接
            linkElement.href = link.url;
            linkElement.target = '_blank';
        }

        container.appendChild(linkElement);
    });
}

// 显示二维码
function showQRCode(qrcode) {
    const modal = document.getElementById('qr-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalQR = document.getElementById('modal-qr');
    
    modalTitle.textContent = qrcode.title;
    modalQR.src = qrcode.image;
    modalQR.alt = qrcode.title;
    
    modal.style.display = 'block';

    // 关闭按钮事件
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.style.display = 'none';

    // 点击模态框外部关闭
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', loadSocialLinks); 