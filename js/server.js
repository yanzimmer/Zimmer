const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const app = express();
const port = 3000;

// 防止重复更新的标志
let isUpdating = false;

// 控制台颜色
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

// 打印带颜色的消息
function log(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    switch(type) {
        case 'info':
            console.log(`${colors.cyan}[${timestamp}] ℹ️ ${colors.bright}${message}${colors.reset}`);
            break;
        case 'success':
            console.log(`${colors.green}[${timestamp}] ✅ ${colors.bright}${message}${colors.reset}`);
            break;
        case 'warning':
            console.log(`${colors.yellow}[${timestamp}] ⚠️ ${colors.bright}${message}${colors.reset}`);
            break;
        case 'error':
            console.log(`${colors.red}[${timestamp}] ❌ ${colors.bright}${message}${colors.reset}`);
            break;
        case 'admin':
            console.log(`${colors.magenta}[${timestamp}] 👑 ${colors.bright}${message}${colors.reset}`);
            break;
    }
}

// 打印启动横幅
function printBanner() {
    console.log(`${colors.cyan}
╔════════════════════════════════════════════════════╗
║                                                    ║
║     ${colors.yellow}Zimmer ${colors.green}个人主页服务${colors.cyan}                          ║
║                                                    ║
║     ${colors.white}作者: Your Name${colors.cyan}                               ║
║     ${colors.white}版本: 1.0.0${colors.cyan}                                  ║
║     ${colors.white}启动时间: ${new Date().toLocaleString()}${colors.cyan}     ║
║                                                    ║
╚════════════════════════════════════════════════════╝${colors.reset}
`);
}

// 允许跨域请求
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 静态文件服务
app.use(express.static('.'));
app.use(express.json());

// 更新播放列表函数
async function updatePlaylist() {
    if (isUpdating) return;
    
    try {
        isUpdating = true;
        const musicDir = path.join(__dirname, '..', 'music');
        const files = await fs.readdir(musicDir);

        const musicFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp3', '.wav', '.m4a', '.ogg'].includes(ext);
        });

        const playlist = {
            currentTrack: 0,
            playlist: musicFiles.map(file => ({
                name: path.parse(file).name,
                file: `music/${file}`
            }))
        };

        const playlistPath = path.join(__dirname, '..', 'data', 'playlist.json');
        await fs.writeFile(playlistPath, JSON.stringify(playlist, null, 4));

        log('success', `已找到 ${musicFiles.length} 首歌曲`);
        
        // 打印歌曲列表
        if (musicFiles.length > 0) {
            log('info', '播放列表:');
            musicFiles.forEach((file, index) => {
                console.log(`${colors.dim}   ${index + 1}. ${path.parse(file).name}${colors.reset}`);
            });
        }
    } catch (error) {
        log('error', `更新播放列表失败: ${error.message}`);
    } finally {
        isUpdating = false;
    }
}

// 监听 music 目录的变化
const watcher = chokidar.watch(path.join(__dirname, '..', 'music'), {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    }
});

// 当文件发生变化时更新播放列表
watcher
    .on('add', (path) => {
        log('info', `检测到新音乐: ${path.split('\\').pop()}`);
        updatePlaylist();
    })
    .on('unlink', (path) => {
        log('warning', `音乐被移除: ${path.split('\\').pop()}`);
        updatePlaylist();
    });

// 获取系统信息
function getSystemInfo() {
    const os = require('os');
    return {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
            total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            free: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB'
        },
        uptime: (os.uptime() / 3600).toFixed(2) + ' 小时'
    };
}

// 打印系统信息
function printSystemInfo() {
    const sysInfo = getSystemInfo();
    log('admin', '系统信息:');
    console.log(`${colors.dim}   • 平台: ${sysInfo.platform} (${sysInfo.arch})`);
    console.log(`   • CPU核心数: ${sysInfo.cpus}`);
    console.log(`   • 内存: 总共 ${sysInfo.memory.total} / 可用 ${sysInfo.memory.free}`);
    console.log(`   • 运行时间: ${sysInfo.uptime}${colors.reset}`);
}

// API路由
app.get('/api/settings', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, '..', 'data', 'settings.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        log('error', `读取设置失败: ${error.message}`);
        res.status(500).json({ error: '读取设置失败' });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
        const currentData = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
        settings.default = currentData.default;
        
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 4));
        log('success', '设置已更新');
        res.json({ message: '设置已保存' });
    } catch (error) {
        log('error', `保存设置失败: ${error.message}`);
        res.status(500).json({ error: '保存设置失败' });
    }
});

app.post('/api/update-playlist', async (req, res) => {
    try {
        await updatePlaylist();
        res.json({ message: '播放列表已更新' });
    } catch (error) {
        log('error', `手动更新播放列表失败: ${error.message}`);
        res.status(500).json({ error: '更新播放列表失败' });
    }
});

// 启动服务器
app.listen(port, () => {
    printBanner();
    printSystemInfo();
    log('success', `服务器运行在 http://localhost:${port}`);
    updatePlaylist();
}); 