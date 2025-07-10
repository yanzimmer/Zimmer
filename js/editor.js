// 编辑器配置和状态
let editor;
let currentFile = 'content.json'; // 默认文件
let currentZoom = 100; // 当前缩放级别
let isDarkTheme = true; // 当前主题状态
const MIN_ZOOM = 50; // 最小缩放级别
const MAX_ZOOM = 200; // 最大缩放级别
const ZOOM_STEP = 10; // 每次缩放的步长

// 配置 Monaco Editor
require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
    }
});

// 防止加载 worker
window.MonacoEnvironment = {
    getWorkerUrl: function () {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
                baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/'
            };
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/base/worker/workerMain.js');`
        )}`;
    }
};

// 初始化编辑器
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
            enabled: true
        },
        fontSize: 14,
        tabSize: 4,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: true
    });

    // 加载默认文件
    loadFile();

    // 恢复保存的主题
    const savedTheme = localStorage.getItem('editorTheme');
    if (savedTheme) {
        isDarkTheme = savedTheme === 'dark';
        document.getElementById('themeToggle').checked = isDarkTheme;
        updateTheme(false);
    }

    // 恢复保存的缩放级别
    const savedZoom = localStorage.getItem('editorZoom');
    if (savedZoom) {
        currentZoom = parseInt(savedZoom, 10);
        updateZoom();
        // 更新滑块值
        document.getElementById('zoomSlider').value = currentZoom;
    }

    // 添加键盘快捷键支持
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + 加号键放大
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            if (currentZoom < MAX_ZOOM) {
                currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
                updateZoom();
            }
        }
        // Ctrl/Cmd + 减号键缩小
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            if (currentZoom > MIN_ZOOM) {
                currentZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
                updateZoom();
            }
        }
        // Ctrl/Cmd + 0 重置缩放
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            currentZoom = 100;
            updateZoom();
        }
    });
});

// 加载文件
async function loadFile() {
    currentFile = document.getElementById('fileSelect').value;
    try {
        const response = await fetch(`data/${currentFile}`);
        const content = await response.text();
        
        // 尝试格式化 JSON
        try {
            const formatted = JSON.stringify(JSON.parse(content), null, 4);
            editor.setValue(formatted);
        } catch {
            editor.setValue(content);
        }
        
        showMessage('文件加载成功', 'success');
    } catch (error) {
        console.error('加载文件失败:', error);
        showMessage('加载文件失败: ' + error.message, 'error');
        
        // 尝试加载默认文件
        try {
            const defaultResponse = await fetch(`data/defaults/${currentFile}`);
            const defaultContent = await defaultResponse.text();
            editor.setValue(defaultContent);
            showMessage('已加载默认配置', 'info');
        } catch (defaultError) {
            console.error('加载默认文件失败:', defaultError);
            showMessage('加载默认配置失败', 'error');
        }
    }
}

// 保存更改
async function saveChanges() {
    try {
        // 验证 JSON 格式
        const content = editor.getValue();
        JSON.parse(content); // 如果格式错误会抛出异常
        
        const response = await fetch(`/api/save-file`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: currentFile,
                content: content
            })
        });
        
        if (!response.ok) {
            throw new Error('保存失败: ' + response.statusText);
        }
        
        showMessage('保存成功', 'success');
    } catch (error) {
        console.error('保存失败:', error);
        showMessage('保存失败: ' + (error.message || '未知错误'), 'error');
    }
}

// 加载默认配置
async function loadDefault() {
    try {
        const response = await fetch(`data/defaults/${currentFile}`);
        const content = await response.text();
        editor.setValue(content);
        showMessage('已加载默认配置', 'info');
    } catch (error) {
        console.error('加载默认配置失败:', error);
        showMessage('加载默认配置失败: ' + error.message, 'error');
    }
}

// 显示消息
function showMessage(text, type = 'info') {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// 显示进度条
function showProgress(show, percent = 0) {
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = progressDiv.querySelector('.progress-bar');
    const progressText = progressDiv.querySelector('.progress-text');
    
    if (show) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
        progressText.textContent = Math.round(percent) + '%';
    } else {
        progressDiv.style.display = 'none';
    }
}

// 处理文件选择
async function handleFileSelect(input) {
    if (!input.files || input.files.length === 0) {
        return;
    }
    const file = input.files[0];
    console.log('选择的文件名:', file.name);
    
    // 检查文件类型
    if (!file.type.includes('audio/mp3') && !file.name.toLowerCase().endsWith('.mp3')) {
        showMessage('只能上传 MP3 文件', 'error');
        return;
    }

    // 检查文件大小（20MB = 20 * 1024 * 1024 字节）
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessage('文件大小不能超过 20MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('music', file);

    // 显示上传进度容器
    showProgress(true, 0);

    try {
        const xhr = new XMLHttpRequest();
        
        // 处理上传进度
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                showProgress(true, percentComplete);
            }
        };

        // 处理上传完成
        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    showMessage('音乐上传成功！', 'success');
                    if (currentFile === 'playlist.json') {
                        loadFile();
                    }
                } catch (e) {
                    showMessage('解析服务器响应失败', 'error');
                }
            } else {
                let errorMsg = '上传失败';
                try {
                    const error = JSON.parse(xhr.responseText);
                    errorMsg = error.error || errorMsg;
                } catch (e) {}
                showMessage(errorMsg, 'error');
            }
            // 延迟隐藏进度条，让用户能看到100%
            setTimeout(() => showProgress(false), 500);
        };

        // 处理上传错误
        xhr.onerror = () => {
            showProgress(false);
            showMessage('上传出错，请检查网络连接', 'error');
        };

        // 处理上传中断
        xhr.onabort = () => {
            showProgress(false);
            showMessage('上传已取消', 'info');
        };

        // 开始上传
        xhr.open('POST', '/api/upload-music', true);
        xhr.send(formData);

    } catch (error) {
        showProgress(false);
        showMessage('上传出错：' + error.message, 'error');
    }
} 

// 切换主题
function toggleTheme() {
    isDarkTheme = document.getElementById('themeToggle').checked;
    updateTheme(true);
}

// 更新主题
function updateTheme(animate = true) {
    const body = document.body;

    // 更新 body 类
    if (animate) {
        body.style.transition = 'background-color 0.3s, color 0.3s';
    } else {
        body.style.transition = 'none';
    }

    if (isDarkTheme) {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        editor.updateOptions({ theme: 'vs-dark' });
    } else {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        editor.updateOptions({ theme: 'vs-light' });
    }

    // 保存主题设置
    localStorage.setItem('editorTheme', isDarkTheme ? 'dark' : 'light');

    // 恢复过渡效果
    if (!animate) {
        setTimeout(() => {
            body.style.transition = 'background-color 0.3s, color 0.3s';
        }, 0);
    }
}

// 扫描音乐文件
async function scanMusic() {
    try {
        const button = document.querySelector('.btn-info i');
        button.classList.add('fa-spin'); // 添加旋转动画
        
        const response = await fetch('/api/music-list');
        if (!response.ok) {
            throw new Error('扫描失败: ' + response.statusText);
        }
        
        const data = await response.json();
        showMessage(`扫描完成，共发现 ${data.playlist.length} 首歌曲`, 'success');
    } catch (error) {
        console.error('扫描失败:', error);
        showMessage('扫描失败: ' + (error.message || '未知错误'), 'error');
    } finally {
        const button = document.querySelector('.btn-info i');
        button.classList.remove('fa-spin'); // 移除旋转动画
    }
}

// 在页面加载时恢复保存的缩放级别
document.addEventListener('DOMContentLoaded', function() {
    const savedZoom = localStorage.getItem('editorZoom');
    if (savedZoom) {
        currentZoom = parseInt(savedZoom, 10);
        updateZoom();
    }
}); 

// 从滑块更新缩放级别
function updateZoomFromSlider(value) {
    currentZoom = parseInt(value, 10);
    updateZoom();
}

// 更新缩放级别
function updateZoom() {
    if (!editor) return; // 如果编辑器未初始化，直接返回

    // 更新编辑器字体大小
    const fontSize = Math.round(14 * (currentZoom / 100));
    editor.updateOptions({
        fontSize: fontSize
    });
    
    // 更新显示的缩放级别
    document.getElementById('zoomLevel').textContent = `${currentZoom}%`;
    
    // 保存缩放级别到 localStorage
    localStorage.setItem('editorZoom', currentZoom);
} 