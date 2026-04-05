// 📚 电子书阅读器 - 简化版（纯HTML模式）

(function() {
    // 全局变量
    let currentBook = null;
    let currentChapter = 0;
    let totalChapters = 0;
    
    // 书籍配置库
    const BOOKS_LIBRARY = {
        'dageju2': typeof DAGEJU2_CONFIG !== 'undefined' ? DAGEJU2_CONFIG : null
    };
    
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        initFontSize();
        initBook();
        setupKeyboardNav();
    });
    
    // 书籍初始化
    function initBook() {
        const urlParams = new URLSearchParams(window.location.search);
        let bookId = urlParams.get('book') || 'dageju2';
        
        // 加载书籍配置
        if (BOOKS_LIBRARY[bookId]) {
            currentBook = BOOKS_LIBRARY[bookId];
        } else if (typeof DAGEJU2_CONFIG !== 'undefined') {
            currentBook = DAGEJU2_CONFIG;
        }
        
        if (!currentBook || !currentBook.chapters) {
            showError('未找到书籍配置');
            return;
        }
        
        totalChapters = currentBook.chapters.length;
        
        // 设置书名
        document.getElementById('bookTitle').textContent = currentBook.title || '电子书';
        
        // 加载目录
        renderToc();
        
        // 恢复阅读进度
        restoreProgress();
        
        // 显示当前章节
        loadChapter(currentChapter);
    }
    
    // 加载章节内容
    function loadChapter(index) {
        if (index < 0 || index >= totalChapters) return;
        
        currentChapter = index;
        const chapter = currentBook.chapters[index];
        const frame = document.getElementById('contentFrame');
        
        if (!frame || !chapter) return;
        
        // 获取设置
        const theme = localStorage.getItem('reader_theme') || 'light';
        const font = localStorage.getItem('reader_font') || 'sans';
        const fontSize = localStorage.getItem('reader_fontsize') || '18';
        
        // 根据主题设置颜色
        let bgColor, textColor, linkColor, borderColor;
        
        if (theme === 'dark') {
            bgColor = '#1e1e28';
            textColor = '#c8c8d0';
            linkColor = '#5dade2';
            borderColor = '#333';
        } else if (theme === 'sepia') {
            bgColor = '#fdf6e3';
            textColor = '#5b4636';
            linkColor = '#8b4513';
            borderColor = '#d4c4a8';
        } else {
            bgColor = '#ffffff';
            textColor = '#2c2c2c';
            linkColor = '#2980b9';
            borderColor = '#ddd';
        }
        
        // 字体设置
        const fontFamily = font === 'serif' 
            ? "'Noto Serif SC', 'PMingLiU', serif" 
            : "'Noto Sans SC', sans-serif";
        
        // 生成HTML内容
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        html, body {
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        }
        
        body {
            font-family: ${fontFamily};
            font-size: ${fontSize}px;
            line-height: 1.85;
            color: ${textColor};
            background: ${bgColor};
            padding: 40px 30px;
            max-width: 800px;
            margin: 0 auto;
            -webkit-text-size-adjust: 100%;
        }
        
        h1 {
            font-size: 1.6em;
            font-weight: 700;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid ${linkColor};
            line-height: 1.4;
        }
        
        h2 {
            font-size: 1.3em;
            font-weight: 600;
            margin: 35px 0 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid ${borderColor};
        }
        
        h3 {
            font-size: 1.15em;
            font-weight: 600;
            margin: 25px 0 15px;
        }
        
        p {
            margin-bottom: 1.2em;
            text-align: justify;
            text-indent: 2em;
        }
        
        a {
            color: ${linkColor};
            text-decoration: none;
        }
        
        ul, ol {
            margin: 20px 0;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 10px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 0.95em;
        }
        
        th {
            background: rgba(128,128,128,0.15);
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 10px 12px;
            border: 1px solid ${borderColor};
        }
        
        blockquote {
            margin: 20px 0;
            padding: 15px 20px;
            border-left: 4px solid ${linkColor};
            background: rgba(128,128,128,0.08);
            font-style: italic;
        }
        
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
        }
        
        strong {
            color: ${linkColor};
        }
        
        /* 滚动时保存位置 */
        .scroll-wrapper {
            min-height: 100%;
        }
    </style>
</head>
<body>
    <div class="scroll-wrapper">
        <h1>${chapter.title}</h1>
        ${chapter.content || ''}
    </div>
    
    <script>
        // 恢复滚动位置
        const savedScroll = localStorage.getItem('reader_scroll_${currentBook.id}_ch${index}');
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll));
        }
        
        // 监听滚动并保存
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                localStorage.setItem('reader_scroll_${currentBook.id}_ch${index}', window.scrollY);
            }, 500);
        });
    <\/script>
</body>
</html>`;
        
        frame.srcdoc = html;
        
        // 更新进度
        updateProgress();
        updateTocHighlight();
        updateNavButtons();
        saveProgress();
        
        // 关闭侧边栏
        closeSidebar();
    }
    
    // 导航功能
    function nextChapter() {
        if (currentChapter < totalChapters - 1) {
            loadChapter(currentChapter + 1);
        }
    }
    
    function prevChapter() {
        if (currentChapter > 0) {
            loadChapter(currentChapter - 1);
        }
    }
    
    function seekTo(value) {
        const index = Math.floor((value / 100) * (totalChapters - 1));
        loadChapter(index);
    }
    
    function goToChapter(index) {
        if (index >= 0 && index < totalChapters) {
            loadChapter(index);
        }
    }
    
    // 更新进度
    function updateProgress() {
        if (totalChapters === 0) return;
        
        const progress = ((currentChapter + 1) / totalChapters) * 100;
        
        const progressBar = document.getElementById('progressBar');
        const progressSlider = document.getElementById('progressSlider');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressSlider) progressSlider.value = progress;
        if (progressText) progressText.textContent = Math.round(progress) + '%';
    }
    
    // 更新导航按钮
    function updateNavButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.disabled = currentChapter === 0;
        if (nextBtn) nextBtn.disabled = currentChapter >= totalChapters - 1;
    }
    
    // 渲染目录
    function renderToc() {
        const tocList = document.getElementById('tocList');
        if (!tocList || !currentBook) return;
        
        tocList.innerHTML = '';
        
        currentBook.chapters.forEach((chapter, index) => {
            const li = document.createElement('li');
            li.className = 'toc-item';
            li.onclick = () => goToChapter(index);
            li.innerHTML = `<span class="num">${index + 1}</span> ${chapter.title}`;
            tocList.appendChild(li);
        });
    }
    
    // 更新目录高亮
    function updateTocHighlight() {
        const items = document.querySelectorAll('.toc-item');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === currentChapter);
        });
    }
    
    // 侧边栏
    function toggleSidebar(type) {
        const overlay = document.getElementById('sidebarOverlay');
        
        if (type === 'toc') {
            document.getElementById('tocSidebar').classList.toggle('show');
            document.getElementById('settingsSidebar').classList.remove('show');
        } else if (type === 'settings') {
            document.getElementById('settingsSidebar').classList.toggle('show');
            document.getElementById('tocSidebar').classList.remove('show');
        }
        
        overlay.classList.toggle('show');
    }
    
    function closeSidebar() {
        document.getElementById('tocSidebar').classList.remove('show');
        document.getElementById('settingsSidebar').classList.remove('show');
        document.getElementById('sidebarOverlay').classList.remove('show');
    }
    
    // 设置功能
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('reader_theme', theme);
        
        // 更新按钮状态
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // 重新加载当前章节
        loadChapter(currentChapter);
    }
    
    function setFont(font) {
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('reader_font', font);
        
        document.querySelectorAll('[data-font]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === font);
        });
        
        loadChapter(currentChapter);
    }
    
    function setFontSize(size) {
        localStorage.setItem('reader_fontsize', size);
        document.getElementById('fontSizeSlider').value = size;
        loadChapter(currentChapter);
    }
    
    // 主题初始化
    function initTheme() {
        const savedTheme = localStorage.getItem('reader_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        });
    }
    
    function initFontSize() {
        const saved = localStorage.getItem('reader_fontsize') || '18';
        document.getElementById('fontSizeSlider').value = saved;
    }
    
    // 进度保存/恢复
    function saveProgress() {
        if (!currentBook) return;
        
        const data = {
            bookId: currentBook.id,
            chapter: currentChapter,
            timestamp: Date.now()
        };
        
        localStorage.setItem('reader_progress_' + currentBook.id, JSON.stringify(data));
    }
    
    function restoreProgress() {
        if (!currentBook) return;
        
        try {
            const saved = localStorage.getItem('reader_progress_' + currentBook.id);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.chapter > 0) {
                    currentChapter = data.chapter;
                }
            }
        } catch(e) {}
    }
    
    // 键盘导航
    function setupKeyboardNav() {
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    nextPage();
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    prevPage();
                    e.preventDefault();
                    break;
                case 'Escape':
                    closeSidebar();
                    break;
            }
        });
    }
    
    function nextPage() { nextChapter(); }
    function prevPage() { prevChapter(); }
    
    // 返回
    function goBack() {
        window.location.href = './index.html';
    }
    
    // 错误显示
    function showError(msg) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.innerHTML = `
            <div style="color: #e74c3c; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <div>${msg}</div>
            </div>
        `;
    }
    
    // 暴露全局函数
    window.goToChapter = goToChapter;
    window.nextChapter = nextChapter;
    window.prevChapter = prevChapter;
    window.seekTo = seekTo;
    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
    window.setTheme = setTheme;
    window.setFont = setFont;
    window.setFontSize = setFontSize;
    window.goBack = goBack;
    
    // 隐藏加载中
    setTimeout(function() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }, 500);
    
})();