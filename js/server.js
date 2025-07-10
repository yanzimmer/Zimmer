const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

const app = express();
app.use(express.json());

// 定义目录路径
const musicDir = path.join(__dirname, '../music');
const dataDir = path.join(__dirname, '../data');
const playlistFile = path.join(dataDir, 'playlist.json');
const settingsFile = path.join(dataDir, 'settings.json');

// 确保目录存在
if (!fs.existsSync(musicDir)) {
    fs.mkdirSync(musicDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 确保设置文件存在
if (!fs.existsSync(settingsFile)) {
    const defaultSettings = {
        "backgroundBlur": 10,
        "foregroundBlur": 0,
        "backgroundZoom": 100,
        "verticalPosition": 50,
        "horizontalPosition": 50
    };
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 4), 'utf8');
}

// 同步播放列表
function syncPlaylist() {
    try {
        // 读取音乐目录中的所有文件
        const musicFiles = fs.readdirSync(musicDir)
            .filter(file => file.toLowerCase().endsWith('.mp3'));
        
        // 读取现有的播放列表
        let playlist = { currentTrack: 0, playlist: [] };
        if (fs.existsSync(playlistFile)) {
            const playlistContent = fs.readFileSync(playlistFile, 'utf8');
            try {
                playlist = JSON.parse(playlistContent);
            } catch (e) {
                console.error('播放列表解析失败，将重新创建:', e);
            }
        }

        // 过滤掉不存在的文件
        playlist.playlist = playlist.playlist.filter(track => 
            musicFiles.includes(track.file.replace(/^music\//, '')));

        // 添加新文件
        const existingFiles = new Set(playlist.playlist.map(track => 
            track.file.replace(/^music\//, '')));

        for (const file of musicFiles) {
            if (!existingFiles.has(file)) {
                // 去掉扩展名作为显示名称
                const name = file.replace(/\.mp3$/i, '');
                playlist.playlist.push({
                    name: name,
                    file: `music/${file}`
                });
            }
        }

        // 重置 currentTrack 如果它超出范围
        if (playlist.currentTrack >= playlist.playlist.length) {
            playlist.currentTrack = 0;
        }

        // 保存更新后的播放列表
        fs.writeFileSync(playlistFile, JSON.stringify(playlist, null, 4), 'utf8');
        return playlist;
    } catch (error) {
        console.error('同步播放列表失败:', error);
        throw error;
    }
}

// 配置 multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, musicDir);
    },
    filename: function (req, file, cb) {
        try {
            // 解码文件名
            let fileName = file.originalname;
            
            // 如果是 URL 编码的文件名，先解码
            try {
                fileName = decodeURIComponent(fileName);
            } catch (e) {
                console.log('不是 URL 编码的文件名');
            }

            // 如果文件名是 Buffer 或二进制字符串，转换为 UTF-8
            if (Buffer.isBuffer(fileName)) {
                fileName = fileName.toString('utf8');
            } else if (typeof fileName === 'string') {
                // 尝试不同的编码方式
                try {
                    // 先尝试 UTF-8
                    const utf8Name = Buffer.from(fileName, 'binary').toString('utf8');
                    if (/[\u4e00-\u9fa5]/.test(utf8Name)) {
                        fileName = utf8Name;
                    } else {
                        // 如果 UTF-8 解码后没有中文字符，尝试 GBK
                        fileName = iconv.decode(Buffer.from(fileName, 'binary'), 'gbk');
                    }
                } catch (e) {
                    console.error('编码转换失败:', e);
                }
            }

            console.log('最终文件名:', fileName);
            cb(null, fileName);
        } catch (error) {
            console.error('文件名处理错误:', error);
            cb(error);
        }
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
        files: 1
    }
});

// 配置静态文件服务
app.use(express.static(path.join(__dirname, '..'))); // 根目录

// 自定义音乐文件的静态服务
app.use('/music', (req, res, next) => {
    try {
        // 解码请求路径，移除开头的斜杠和可能存在的 music/ 前缀
        let fileName = decodeURIComponent(req.path.slice(1))
            .replace(/^music\//, ''); // 移除可能存在的 music/ 前缀
        console.log('请求的文件名:', fileName);

        // 构建文件路径
        let filePath = path.join(musicDir, fileName);
        console.log('完整文件路径:', filePath);
        
        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
            console.log('文件存在，开始发送');
            res.sendFile(filePath);
        } else {
            console.error('文件不存在:', filePath);
            res.status(404).send('File not found');
        }
    } catch (error) {
        console.error('处理音乐文件请求错误:', error);
        res.status(500).send('Internal server error');
    }
});

// 获取音乐列表的路由（手动扫描）
app.get('/api/music-list', (req, res) => {
    try {
        const playlist = syncPlaylist();
        res.json(playlist);
    } catch (error) {
        console.error('获取音乐列表失败:', error);
        res.status(500).json({ error: '获取音乐列表失败: ' + error.message });
    }
});

// 获取设置的路由
app.get('/api/settings', (req, res) => {
    try {
        if (fs.existsSync(settingsFile)) {
            const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
            res.json(settings);
        } else {
            const defaultSettings = {
                "backgroundBlur": 10,
                "foregroundBlur": 0,
                "backgroundZoom": 100,
                "verticalPosition": 50,
                "horizontalPosition": 50
            };
            fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 4), 'utf8');
            res.json(defaultSettings);
        }
    } catch (error) {
        console.error('获取设置失败:', error);
        res.status(500).json({ error: '获取设置失败: ' + error.message });
    }
});

// 保存文件的路由
app.post('/api/save-file', (req, res) => {
    try {
        const { filename, content } = req.body;
        
        // 验证文件名
        if (!filename || !filename.match(/^[a-zA-Z0-9_-]+\.json$/)) {
            throw new Error('无效的文件名');
        }
        
        // 验证内容是否为有效的 JSON
        JSON.parse(content);
        
        // 保存文件
        const filePath = path.join(dataDir, filename);
        fs.writeFileSync(filePath, content, 'utf8');
        
        res.json({ message: '保存成功' });
    } catch (error) {
        console.error('保存文件失败:', error);
        res.status(500).json({ error: '保存失败: ' + error.message });
    }
});

// 保存设置的路由
app.post('/api/settings', (req, res) => {
    try {
        const settings = req.body;
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 4), 'utf8');
        res.json({ success: true, message: '设置保存成功' });
    } catch (error) {
        console.error('保存设置失败:', error);
        res.status(500).json({ error: '保存设置失败: ' + error.message });
    }
});

// 文件上传路由
app.post('/api/upload-music', upload.single('music'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('没有接收到文件');
        }
        res.json({ message: '文件上传成功' });
    } catch (error) {
        console.error('上传文件失败:', error);
        res.status(500).json({ error: '上传失败: ' + error.message });
    }
});

// 删除音乐文件的路由
app.delete('/api/delete-music/:filename', (req, res) => {
    try {
        const fileName = decodeURIComponent(req.params.filename);
        const filePath = path.join(musicDir, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            // 同步播放列表
            syncPlaylist();
            res.json({ success: true, message: '文件删除成功' });
        } else {
            res.status(404).json({ error: '文件不存在' });
        }
    } catch (error) {
        console.error('删除文件错误:', error);
        res.status(500).json({ error: '文件删除失败: ' + error.message });
    }
});

// 添加主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// 添加编辑器页面路由
app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, '../edit.html'));
});

const port = 80;

// 获取系统信息
function getSystemInfo() {
    const os = require('os');
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100;
    const freeMemory = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100;
    const uptime = Math.round(os.uptime() / 3600 * 100) / 100;
    
    return {
        platform: `${os.platform()} (${os.arch()})`,
        cpuCount: os.cpus().length,
        totalMemory,
        freeMemory,
        uptime
    };
}

// 打印欢迎信息
function printWelcome() {
    const now = new Date();
    const timeString = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║     Zimmer 个人主页服务                             ║
║                                                    ║
║     作者: Yanzimmer                                ║
║     版本: 1.0.0                                     ║
║     启动时间: ${timeString}                         ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

    const sysInfo = getSystemInfo();
    console.log(`[${timeString.split(' ')[1]}] 系统信息:`);
    console.log(`   • 平台: ${sysInfo.platform}`);
    console.log(`   • CPU核心数: ${sysInfo.cpuCount}`);
    console.log(`   • 内存: 总共 ${sysInfo.totalMemory} GB / 可用 ${sysInfo.freeMemory} GB`);
    console.log(`   • 运行时间: ${sysInfo.uptime} 小时`);
}

app.listen(port, () => {
    printWelcome();
    console.log(`[${new Date().toLocaleTimeString()}] ✅ 服务器运行在 http://localhost:${port}`);
}); 