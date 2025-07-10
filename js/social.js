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

// 渲染社交链接
function renderSocialLinks(links) {
    const container = document.querySelector('.social-links');
    if (!container) return;

    container.innerHTML = '';

    links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.className = 'social-link';
        
        if (link.url) {
            linkElement.href = link.url;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
        }

        // 处理图标
        if (link.customIcon) {
            // 使用自定义SVG图标
            fetch(link.customIcon)
                .then(response => response.text())
                .then(svgContent => {
                    linkElement.innerHTML = svgContent;
                    const svg = linkElement.querySelector('svg');
                    if (svg) {
                        svg.style.width = '24px';
                        svg.style.height = '24px';
                    }
                })
                .catch(error => {
                    console.error('加载自定义图标失败:', error);
                    // 如果加载失败，使用默认图标
                    const icon = document.createElement('i');
                    icon.className = link.icon;
                    linkElement.appendChild(icon);
                });
        } else {
            // 使用Font Awesome图标
            const icon = document.createElement('i');
            icon.className = link.icon;
            linkElement.appendChild(icon);
        }

        // 处理二维码
        if (link.qrcode) {
            linkElement.onclick = (e) => {
                e.preventDefault();
                showQRCode(link.qrcode.title, link.qrcode.image);
            };
        }

        container.appendChild(linkElement);
    });
}

// 显示二维码
function showQRCode(title, image) {
    const modal = document.getElementById('qr-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalQR = document.getElementById('modal-qr');
    
    if (modal && modalTitle && modalQR) {
        modalTitle.textContent = title;
        modalQR.src = image;
        modal.style.display = 'flex';
    }
}

// 关闭二维码
document.addEventListener('click', (e) => {
    const modal = document.getElementById('qr-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', loadSocialLinks); 