import { consoleStyles } from './styles/consoleStyles.js';

// 更新时间
function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    document.querySelector('.status span:last-child').innerHTML = 
        `<i class="fas fa-clock"></i> ${timeString}`;
}

// 每秒更新时间
setInterval(updateTime, 1000);
updateTime();

// 控制面板功能
const settingsToggle = document.getElementById('settings-toggle');
const controlPanel = document.querySelector('.control-panel');
const foregroundBlurRange = document.getElementById('foreground-blur-range');
const blurRange = document.getElementById('blur-range');
const zoomRange = document.getElementById('zoom-range');
const positionYRange = document.getElementById('position-y-range');
const positionXRange = document.getElementById('position-x-range');
const foregroundBlurValue = foregroundBlurRange.nextElementSibling;
const blurValue = blurRange.nextElementSibling;
const zoomValue = zoomRange.nextElementSibling;
const positionYValue = positionYRange.nextElementSibling;
const positionXValue = positionXRange.nextElementSibling;
const bgImage = document.querySelector('.bg-image');

// 设置按钮点击事件
settingsToggle.addEventListener('click', () => {
    controlPanel.classList.toggle('show');
    settingsToggle.style.transform = controlPanel.classList.contains('show') ? 'rotate(45deg)' : 'rotate(0deg)';
});

// 点击其他区域关闭控制面板
document.addEventListener('click', (e) => {
    if (!controlPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
        controlPanel.classList.remove('show');
        settingsToggle.style.transform = 'rotate(0deg)';
    }
});

// 更新前景毛玻璃效果
function updateForegroundBlur(value) {
    // 设置 CSS 变量
    document.documentElement.style.setProperty('--foreground-blur', `${value}px`);
    
    // 更新显示值
    const valueDisplay = document.querySelector('#foreground-blur-range').nextElementSibling;
    if (valueDisplay) {
        valueDisplay.textContent = `${value}px`;
    }

    // 打印调试信息
    // console.log('前景毛玻璃效果更新:', value + 'px');
}

// 更新背景毛玻璃效果
function updateBlurEffect(value) {
    document.documentElement.style.setProperty('--blur-amount', `${value}px`);
    bgImage.style.filter = `blur(${value}px)`;
    blurValue.textContent = `${value}px`;
}

// 更新背景缩放
function updateBackgroundZoom(value) {
    document.documentElement.style.setProperty('--zoom-amount', `${value}%`);
    bgImage.style.backgroundSize = `${value}%`;
    zoomValue.textContent = `${value}%`;
}

// 更新垂直位置
function updateVerticalPosition(value) {
    const position = value <= 25 ? '偏上' : value >= 75 ? '偏下' : '居中';
    bgImage.style.backgroundPositionY = `${value}%`;
    positionYValue.textContent = position;
}

// 更新水平位置
function updateHorizontalPosition(value) {
    const position = value <= 25 ? '偏左' : value >= 75 ? '偏右' : '居中';
    bgImage.style.backgroundPositionX = `${value}%`;
    positionXValue.textContent = position;
}

// 监听滑块变化
foregroundBlurRange.addEventListener('input', (e) => {
    updateForegroundBlur(e.target.value);
});

blurRange.addEventListener('input', (e) => {
    updateBlurEffect(e.target.value);
});

zoomRange.addEventListener('input', (e) => {
    updateBackgroundZoom(e.target.value);
});

positionYRange.addEventListener('input', (e) => {
    updateVerticalPosition(e.target.value);
});

positionXRange.addEventListener('input', (e) => {
    updateHorizontalPosition(e.target.value);
});

// 初始化控制面板的值
updateForegroundBlur(foregroundBlurRange.value);
updateBlurEffect(blurRange.value);
updateBackgroundZoom(zoomRange.value);
updateVerticalPosition(positionYRange.value);
updateHorizontalPosition(positionXRange.value);

// 音乐播放器状态
let playlist = [];
let currentTrackIndex = 0;
let audioPlayer;
let isPlaying = false;
let isChangingTrack = false;
let hasUserInteracted = false; // 新增：标记用户是否已交互

// 监听用户交互
document.addEventListener('click', function() {
    hasUserInteracted = true;
});

// 头像动画控制
const rotationContainer = document.querySelector('.rotation-container');
const beatContainer = document.querySelector('.beat-container');

function updateAvatarAnimation(playing) {
    console.log('%c🎵 更新头像动画状态', consoleStyles.info);
    console.log('%c当前播放状态:', consoleStyles.info, playing);
    
    // 根据音乐播放状态控制动画
    if (playing) {
        rotationContainer.classList.add('rotating');
        beatContainer.classList.add('music-playing');
        console.log('%c添加旋转和律动动画', consoleStyles.success);
    } else {
        rotationContainer.classList.remove('rotating');
        beatContainer.classList.remove('music-playing');
        console.log('%c移除所有动画', consoleStyles.warning);
    }
    
    // 输出调试信息
    console.log('%c旋转容器类列表:', consoleStyles.info, rotationContainer.classList.toString());
    console.log('%c律动容器类列表:', consoleStyles.info, beatContainer.classList.toString());
    
    // 检查计算后的样式
    const rotationStyle = window.getComputedStyle(rotationContainer);
    const beatStyle = window.getComputedStyle(beatContainer);
    console.log('%c旋转动画:', consoleStyles.info, rotationStyle.animation);
    console.log('%c律动动画:', consoleStyles.info, beatStyle.animation);
}

// 打印欢迎信息
console.log('%cWelcome to Zimmer!', consoleStyles.title);
console.log('%c个人主页 v1.0.0', consoleStyles.info);
console.log('%c作者: Zimmer Yan', consoleStyles.info);
console.log('%c©2024 All Rights Reserved', consoleStyles.info);
console.log('\n');

// 加载播放列表
async function loadPlaylist() {
    try {
        console.log('%c🎵 正在加载播放列表...', consoleStyles.info);
        const response = await fetch('data/playlist.json');
        const data = await response.json();
        playlist = data.playlist;
        
        // 从 localStorage 恢复播放状态
        const savedState = JSON.parse(localStorage.getItem('musicPlayerState') || '{}');
        currentTrackIndex = savedState.currentTrackIndex || 0;
        const currentTime = savedState.currentTime || 0;
        isPlaying = savedState.isPlaying || false;

        console.log('%c✨ 播放列表加载完成', consoleStyles.success);

        // 加载音轨
        await loadTrack(currentTrackIndex, currentTime);

        // 设置播放进度和状态
        if (isPlaying && hasUserInteracted) {
            try {
                await audioPlayer.play();
                updatePlayButton(true);
                console.log('%c▶️ 恢复播放: ' + playlist[currentTrackIndex].name, consoleStyles.success);
            } catch (error) {
                console.log('%c⚠️ 等待用户交互后继续播放', consoleStyles.warning);
                isPlaying = false;
                updatePlayButton(false);
            }
        }

        // 每2秒保存一次播放状态
        setInterval(savePlaybackState, 2000);

    } catch (error) {
        console.log('%c❌ 加载播放列表失败: ' + error.message, consoleStyles.error);
    }
}

// 保存播放状态
function savePlaybackState() {
    if (!audioPlayer) return;
    
    // 只在非切换状态时保存进度
    if (!isChangingTrack) {
    const state = {
        currentTrackIndex: currentTrackIndex,
        currentTime: audioPlayer.currentTime,
        isPlaying: !audioPlayer.paused
    };
    localStorage.setItem('musicPlayerState', JSON.stringify(state));
    }
}

// 播放下一首
async function playNext() {
    try {
        if (!playlist || playlist.length === 0) {
            console.log('%c⚠️ 播放列表为空', consoleStyles.warning);
            return;
        }
        
        isChangingTrack = true;
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        
        console.log('%c⏭️ 切换到下一曲: ' + playlist[currentTrackIndex].name, consoleStyles.info);
        await loadTrack(currentTrackIndex, 0);
        
        if (isPlaying && hasUserInteracted) {
            try {
                await audioPlayer.play();
                updatePlayButton(true);
                console.log('%c▶️ 开始播放', consoleStyles.success);
            } catch (error) {
                console.log('%c❌ 自动播放失败: ' + error.message, consoleStyles.error);
                isPlaying = false;
                updatePlayButton(false);
            }
        }
        
        isChangingTrack = false;
        savePlaybackState();
        
    } catch (error) {
        console.log('%c❌ 切换下一曲失败: ' + error.message, consoleStyles.error);
        isPlaying = false;
        updatePlayButton(false);
        isChangingTrack = false;
    }
}

// 加载音轨
async function loadTrack(index, startTime = 0) {
    if (!playlist[index]) {
        console.log('%c❌ 无效的音轨索引: ' + index, consoleStyles.error);
        return;
    }
    
    const track = playlist[index];
    console.log('%c🎵 正在加载音轨: ' + track.name, consoleStyles.info);
    
    try {
    audioPlayer = document.getElementById('audio-player');
    const trackName = document.querySelector('.track-name');
    
        // 添加音频事件监听
        audioPlayer.addEventListener('play', () => {
            console.log('%c▶️ 音频开始播放', consoleStyles.success);
            updateAvatarAnimation(true);
        });
        
        audioPlayer.addEventListener('pause', () => {
            console.log('%c⏸️ 音频已暂停', consoleStyles.warning);
            updateAvatarAnimation(false);
        });
        
        audioPlayer.addEventListener('ended', () => {
            console.log('%c⏹️ 音频播放结束', consoleStyles.info);
            updateAvatarAnimation(false);
        });
        
        await audioPlayer.pause();
        audioPlayer.currentTime = 0;
        
        audioPlayer.onloadedmetadata = null;
        audioPlayer.ontimeupdate = null;
        audioPlayer.onended = null;
        
        audioPlayer.src = track.file;
        trackName.textContent = track.name;
        
        document.querySelector('.progress').style.width = '0%';
        document.querySelector('.current-time').textContent = '0:00';
        
        await audioPlayer.load();
        
        audioPlayer.onloadedmetadata = () => {
            document.querySelector('.total-time').textContent = formatTime(audioPlayer.duration);
            if (!isChangingTrack) {
                audioPlayer.currentTime = startTime;
            }
            console.log('%c✨ 音轨加载完成: ' + track.name, consoleStyles.success);
            console.log('%c⏱️ 时长: ' + formatTime(audioPlayer.duration), consoleStyles.info);
        };
        
        audioPlayer.ontimeupdate = updateProgress;
        
        audioPlayer.onended = async () => {
            if (audioPlayer.currentTime >= audioPlayer.duration) {
                console.log('%c🔄 播放完成，切换下一曲', consoleStyles.info);
                isChangingTrack = true;
            try {
                await playNext();
                } catch (error) {
                    console.log('%c❌ 自动播放下一曲失败: ' + error.message, consoleStyles.error);
                    isPlaying = false;
                    updatePlayButton(false);
                }
                isChangingTrack = false;
        }
        };

    } catch (error) {
        console.log('%c❌ 加载音轨失败: ' + error.message, consoleStyles.error);
        isPlaying = false;
        updatePlayButton(false);
    }
}

// 更新播放按钮状态
function updatePlayButton(playing) {
    console.log('%c更新播放按钮状态', consoleStyles.info);
    console.log('%c播放状态:', consoleStyles.info, playing);
    
    const playBtn = document.querySelector('.play-btn');
    const playIcon = playBtn.querySelector('i');
    
    if (playing) {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    } else {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    }
    
    // 更新头像动画状态
    updateAvatarAnimation(playing);
}

// 播放/暂停切换
async function togglePlay() {
    if (!audioPlayer) return;
    
    try {
        if (audioPlayer.paused) {
            await audioPlayer.play();
            isPlaying = true;
            console.log('%c▶️ 开始播放: ' + playlist[currentTrackIndex].name, consoleStyles.success);
        } else {
            audioPlayer.pause();
            isPlaying = false;
            console.log('%c⏸️ 暂停播放: ' + playlist[currentTrackIndex].name, consoleStyles.info);
        }
        updatePlayButton(!audioPlayer.paused);
        savePlaybackState();
    } catch (error) {
        console.log('%c❌ 切换播放状态失败: ' + error.message, consoleStyles.error);
        isPlaying = false;
        updatePlayButton(false);
    }
}

// 播放上一首
async function playPrev() {
    try {
        if (!playlist || playlist.length === 0) {
            console.log('%c⚠️ 播放列表为空', consoleStyles.warning);
            return;
        }
        
        isChangingTrack = true;
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        
        console.log('%c⏮️ 切换到上一曲: ' + playlist[currentTrackIndex].name, consoleStyles.info);
        await loadTrack(currentTrackIndex, 0);
        
        if (isPlaying && hasUserInteracted) {
            try {
                await audioPlayer.play();
                updatePlayButton(true);
                console.log('%c▶️ 开始播放', consoleStyles.success);
            } catch (error) {
                console.log('%c❌ 自动播放失败: ' + error.message, consoleStyles.error);
                isPlaying = false;
                updatePlayButton(false);
            }
        }
        
        isChangingTrack = false;
    savePlaybackState();
        
    } catch (error) {
        console.log('%c❌ 切换上一曲失败: ' + error.message, consoleStyles.error);
        isPlaying = false;
        updatePlayButton(false);
        isChangingTrack = false;
    }
}

// 更新进度条
function updateProgress() {
    if (!audioPlayer || !audioPlayer.duration) return;
    
    const progress = document.querySelector('.progress');
    const currentTime = document.querySelector('.current-time');
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = percent + '%';
    currentTime.textContent = formatTime(audioPlayer.currentTime);
}

// 格式化时间
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 设置进度条点击事件
document.querySelector('.progress-bar').addEventListener('click', function(e) {
    if (!audioPlayer || !audioPlayer.duration) return;
    
    const progressBar = this;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = clickPosition * audioPlayer.duration;
    updateProgress();
    savePlaybackState();
});

// 设置播放控制按钮事件
document.querySelector('.play-btn').addEventListener('click', togglePlay);
document.querySelector('.next-btn').addEventListener('click', playNext);
document.querySelector('.prev-btn').addEventListener('click', playPrev);

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', loadPlaylist);

// 加载个人资料数据
async function loadProfileData() {
    try {
        const response = await fetch('data/profile.json');
        const data = await response.json();
        return data.profile;
    } catch (error) {
        console.error('加载个人资料数据失败:', error);
        return null;
    }
}

// 渲染个人资料
async function renderProfile() {
    const profile = await loadProfileData();
    if (!profile) return;

    // 更新头像
    document.querySelector('.avatar').src = profile.avatar;
    
    // 更新名字
    document.querySelector('.profile-name').textContent = profile.name;
    
    // 更新位置
    document.querySelector('.status span:first-child').innerHTML = 
        `<i class="fas fa-map-marker-alt"></i> ${profile.location}`;
    
    // 更新社交链接
    const socialLinksContainer = document.querySelector('.social-links');
    socialLinksContainer.innerHTML = '';
    
    Object.entries(profile.social).forEach(([platform, data]) => {
        const link = document.createElement('a');
        link.className = 'social-link';
        
        if (platform === 'qq' || platform === 'wechat') {
            link.href = 'javascript:void(0)';
            link.setAttribute('data-qrcode', data.qrcode);
            link.addEventListener('click', () => {
                const modal = document.getElementById(`${platform}-modal`);
                if (modal) modal.style.display = 'block';
            });
        } else {
            link.href = data.url;
            link.target = '_blank';
        }
        
        const icon = document.createElement('i');
        icon.className = data.icon;
        link.appendChild(icon);
        
        socialLinksContainer.appendChild(link);
    });
    
    // 更新技能标签
    const skillsContainer = document.querySelector('.skills');
    skillsContainer.innerHTML = '';
    
    profile.skills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        skillsContainer.appendChild(skillTag);
    });
    
    // 更新音乐播放器
    if (profile.music && profile.music.currentTrack) {
        const audioPlayer = document.getElementById('audio-player');
        const trackName = document.querySelector('.track-name');
        
        audioPlayer.src = profile.music.currentTrack.file;
        trackName.textContent = profile.music.currentTrack.name;
    }
}

// 加载控制面板设置
async function loadControlSettings() {
    try {
        // 从服务器加载设置
        const response = await fetch('http://localhost:3000/api/settings');
        const settings = await response.json();
        const userSettings = settings.user;
        
        // 应用设置
        foregroundBlurRange.value = userSettings.foregroundBlur;
        blurRange.value = userSettings.blur;
        zoomRange.value = userSettings.zoom;
        positionYRange.value = userSettings.positionY;
        positionXRange.value = userSettings.positionX;

        // 更新显示
        updateForegroundBlur(userSettings.foregroundBlur);
        updateBlurEffect(userSettings.blur);
        updateBackgroundZoom(userSettings.zoom);
        updateVerticalPosition(userSettings.positionY);
        updateHorizontalPosition(userSettings.positionX);

        return settings;
    } catch (error) {
        console.error('加载设置失败:', error);
        return null;
    }
}

async function saveControlSettings() {
    try {
        // 先获取当前的设置
        const response = await fetch('http://localhost:3000/api/settings');
        const settings = await response.json();
        
        // 更新用户设置
        settings.user = {
            foregroundBlur: parseInt(foregroundBlurRange.value),
            blur: parseInt(blurRange.value),
            zoom: parseInt(zoomRange.value),
            positionY: parseInt(positionYRange.value),
            positionX: parseInt(positionXRange.value)
        };

        // 保存到服务器
        const saveResponse = await fetch('http://localhost:3000/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });

        if (!saveResponse.ok) {
            throw new Error('保存设置失败');
        }

        console.log('设置已保存到服务器');
    } catch (error) {
        console.error('保存设置失败:', error);
    }
}

// 使用防抖函数来避免频繁保存
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 创建防抖版本的保存函数
const debouncedSave = debounce(saveControlSettings, 500);

// 监听滑块的 input 事件，使用防抖函数来保存设置
foregroundBlurRange.addEventListener('input', debouncedSave);
blurRange.addEventListener('input', debouncedSave);
zoomRange.addEventListener('input', debouncedSave);
positionYRange.addEventListener('input', debouncedSave);
positionXRange.addEventListener('input', debouncedSave);

// 重置为默认值
async function resetToDefault() {
    try {
        // 从服务器加载设置
        const response = await fetch('http://localhost:3000/api/settings');
        const settings = await response.json();
        const defaultSettings = settings.default;

        // 重置滑块值
        foregroundBlurRange.value = defaultSettings.foregroundBlur;
        blurRange.value = defaultSettings.blur;
        zoomRange.value = defaultSettings.zoom;
        positionYRange.value = defaultSettings.positionY;
        positionXRange.value = defaultSettings.positionX;

        // 更新显示
        updateForegroundBlur(defaultSettings.foregroundBlur);
        updateBlurEffect(defaultSettings.blur);
        updateBackgroundZoom(defaultSettings.zoom);
        updateVerticalPosition(defaultSettings.positionY);
        updateHorizontalPosition(defaultSettings.positionX);

        // 保存默认设置为当前用户设置
        await saveControlSettings();
    } catch (error) {
        console.error('重置设置失败:', error);
    }
}

// 获取位置描述
function getPositionDescription(value, positions) {
    for (const [range, description] of Object.entries(positions)) {
        const [min, max] = range.split('-').map(Number);
        if (value >= min && value <= max) {
            return description;
        }
    }
    return '居中';
}

// 渲染控制面板
function renderControlPanel() {
    // 获取重置按钮并添加事件监听
    const resetButton = document.querySelector('.reset-button');
    if (resetButton) {
        resetButton.onclick = resetToDefault;
    }
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadControlSettings();
    renderControlPanel();
});

// 加载技能标签
async function loadSkills() {
    try {
        const response = await fetch('data/profile.json');
        const data = await response.json();
        const skillsContainer = document.getElementById('skills-container');
        
        // 清空现有内容
        skillsContainer.innerHTML = '';
        
        // 添加技能标签
        data.profile.skills.forEach(skill => {
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
        });
    } catch (error) {
        console.error('加载技能标签失败:', error);
    }
}

// 获取平台显示名称
function getPlatformDisplayName(platform) {
    const nameMap = {
        'qq': 'QQ',
        'wechat': '微信',
        'github': 'GitHub',
        'twitter': 'Twitter',
        'bilibili': 'Bilibili'
    };
    return nameMap[platform] || platform;
}

// 加载社交链接
async function loadSocialLinks() {
    try {
        const response = await fetch('data/profile.json');
        const data = await response.json();
        const socialLinksContainer = document.getElementById('social-links');
        const social = data.profile.social;

        // 清空现有内容
        socialLinksContainer.innerHTML = '';

        // 添加社交链接
        Object.entries(social).forEach(([platform, info]) => {
            const link = document.createElement('a');
            link.className = 'social-link';
            
            // 创建图标
            const icon = document.createElement('i');
            icon.className = info.icon;
            link.appendChild(icon);

            // 根据类型设置点击行为
            if (info.qrcode) {
                // 二维码类型（如微信、QQ）
                link.onclick = () => {
                    const modal = document.getElementById('qr-modal');
                    const modalTitle = document.getElementById('modal-title');
                    const modalQR = document.getElementById('modal-qr');
                    
                    modalTitle.textContent = getPlatformDisplayName(platform);
                    modalQR.src = info.qrcode;
                    modal.style.display = 'flex';
                };
            } else if (info.url) {
                // URL类型（如GitHub、Twitter）
                link.href = info.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }

            socialLinksContainer.appendChild(link);
        });

    } catch (error) {
        console.error('加载社交链接失败:', error);
    }
}

// 二维码弹窗控制
function setupQRModal() {
    const modal = document.getElementById('qr-modal');
    const closeBtn = modal.querySelector('.close');
    
    // 点击关闭按钮关闭弹窗
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    // 点击弹窗外部区域关闭弹窗
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}

// 加载个人资料信息
async function loadProfile() {
    try {
        const response = await fetch('data/profile.json');
        const data = await response.json();
        
        // 设置页面标题
        document.title = data.profile.title;
        
        // 设置头像
        const avatarImg = document.querySelector('.avatar');
        if (avatarImg) {
            avatarImg.src = data.profile.avatar;
        }
        
        // 设置名字
        const nameElement = document.querySelector('.profile-name');
        if (nameElement) {
            nameElement.textContent = data.profile.name;
        }
        
        // 设置位置信息
        const locationSpan = document.querySelector('.status span:first-child');
        if (locationSpan) {
            locationSpan.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.profile.location}`;
        }

        // 加载技能标签
        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer && data.profile.skills) {
            skillsContainer.innerHTML = '';
            data.profile.skills.forEach(skill => {
                const skillTag = document.createElement('div');
                skillTag.className = 'skill-tag';
                skillTag.textContent = skill;
                skillsContainer.appendChild(skillTag);
            });
        }

        // 加载社交链接
        const socialLinksContainer = document.getElementById('social-links');
        if (socialLinksContainer && data.profile.social) {
            socialLinksContainer.innerHTML = '';
            Object.entries(data.profile.social).forEach(([platform, info]) => {
                const link = document.createElement('a');
                link.className = 'social-link';
                
                const icon = document.createElement('i');
                icon.className = info.icon;
                link.appendChild(icon);

                if (info.qrcode) {
                    link.onclick = () => {
                        const modal = document.getElementById('qr-modal');
                        const modalTitle = document.getElementById('modal-title');
                        const modalQR = document.getElementById('modal-qr');
                        
                        modalTitle.textContent = getPlatformDisplayName(platform);
                        modalQR.src = info.qrcode;
                        modal.style.display = 'flex';
                    };
                } else if (info.url) {
                    link.href = info.url;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }

                socialLinksContainer.appendChild(link);
            });
        }

    } catch (error) {
        console.error('加载个人资料失败:', error);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();  // 加载所有个人资料信息
    setupQRModal();
    // ... existing code ...
}); 