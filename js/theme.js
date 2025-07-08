// 主题切换
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const moonIcon = themeToggle.querySelector('.fa-moon');

// 从localStorage获取主题设置
const savedTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
document.body.className = savedTheme;

// 更新图标
function updateThemeIcon() {
    moonIcon.classList.toggle('fa-sun', document.body.classList.contains('dark'));
}

// 初始化图标
updateThemeIcon();

// 切换主题
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.className);
    updateThemeIcon();
});

// 监听系统主题变化
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        document.body.className = e.matches ? 'dark' : 'light';
        updateThemeIcon();
    }
}); 