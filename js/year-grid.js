// 年历格子初始化
function initYearGrid() {
    const canvas = document.getElementById('yearCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const container = canvas.parentElement;
    if (!container || !container.clientWidth) {
        console.error('Container not ready');
        return;
    }

    const ctx = canvas.getContext('2d');
    const year = 2025;
    const today = new Date();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

    // 调整行数和列数以获得更好的布局
    const rows = 7;
    const cols = Math.ceil(totalDays / rows);

    // 根据容器宽度调整格子大小
    const containerWidth = container.clientWidth - 40; // 减去容器内边距
    const containerHeight = container.clientHeight - 40;

    // 计算合适的格子大小
    const cellSizeByWidth = Math.floor((containerWidth - (cols - 1) * 3) / cols); // 3px为间距
    const cellSize = Math.max(cellSizeByWidth, 12); // 确保最小尺寸

    // 设置固定间距
    const gap = 3;

    // 设置画布大小
    canvas.width = cols * (cellSize + gap) - gap; // 减去最后一个间距
    canvas.height = rows * (cellSize + gap) - gap;

    // 定义颜色
    const futureDayColor = '#1fdb7d'; // 未来：亮绿（希望感）
    const pastDayColor = '#29925e';   // 过去：暗绿（沉淀感）
    const todayColor = '#00f179';     // 今天：中亮绿（视觉焦点）
    const todayColorDim = '#29925e';  // 今天闪烁暗色

    // 存储当天格子的位置
    let todayX = 0;
    let todayY = 0;
    let foundToday = false;

    function drawGrid(todayBright = true) {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let dayIndex = 0;

        // 绘制所有格子
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const row = dayIndex % rows;
            const col = Math.floor(dayIndex / rows);

            const x = col * (cellSize + gap);
            const y = row * (cellSize + gap);

            // 设置填充颜色
            if (d.toDateString() === today.toDateString()) {
                if (!foundToday) {
                    todayX = x;
                    todayY = y;
                    foundToday = true;
                }
                ctx.fillStyle = todayBright ? todayColor : todayColorDim;
            } else if (d < today) {
                ctx.fillStyle = pastDayColor;
            } else {
                ctx.fillStyle = futureDayColor;
            }

            // 绘制圆角矩形
            const radius = 2;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + cellSize - radius, y);
            ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius);
            ctx.lineTo(x + cellSize, y + cellSize - radius);
            ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize);
            ctx.lineTo(x + radius, y + cellSize);
            ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();

            dayIndex++;
        }
    }

    // 初始绘制
    drawGrid(true);

    // 设置闪烁动画
    let bright = true;
    const blinkInterval = setInterval(() => {
        bright = !bright;
        drawGrid(bright);
    }, 1000);

    // 清理函数
    function cleanup() {
        clearInterval(blinkInterval);
    }

    // 在window对象上存储清理函数
    if (window._yearGridCleanup) {
        window._yearGridCleanup();
    }
    window._yearGridCleanup = cleanup;
}

// 监听主题切换
document.addEventListener('themeChanged', initYearGrid);

// 监听窗口大小变化
let resizeTimeout;
window.addEventListener('resize', () => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(initYearGrid, 250);
});

// 监听canvas元素的创建
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            const canvas = document.getElementById('yearCanvas');
            if (canvas) {
                observer.disconnect();
                initYearGrid();
                break;
            }
        }
    }
});

// 开始监听DOM变化
observer.observe(document.body, {
    childList: true,
    subtree: true
}); 