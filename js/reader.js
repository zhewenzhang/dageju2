// 📚 电子书阅读器 - 基于 epub.js 增强版

(function() {
    // ========== 全局变量 ==========
    let book = null;
    let rendition = null;
    let currentBook = null;
    let currentChapter = 0;
    let totalChapters = 0;
    let isPaginated = true; // 分页模式
    
    // ========== 书籍配置库 ==========
    const BOOKS_LIBRARY = {
        'dageju2': typeof DAGEJU2_CONFIG !== 'undefined' ? DAGEJU2_CONFIG : null
    };
    
    // ========== 初始化 ==========
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        initFontSize();
        initBook();
    });
    
    // ========== 书籍初始化 ==========
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
        
        // 创建虚拟 EPUB（从 HTML 内容）
        createVirtualEpub();
        
        // 加载目录
        renderToc();
        
        // 恢复进度
        restoreProgress();
        
        // 键盘事件
        setupKeyboardNav();
    }
    
    // ========== 创建虚拟 EPUB ==========
    function createVirtualEpub() {
        // 创建虚拟的 EPUB 包
        const bookData = {
            metadata: {
                title: currentBook.title,
                author: currentBook.author || '未知作者',
                language: 'zh-TW'
            },
            spine: [],
            manifest: {}
        };
        
        // 为每个章节创建 manifest 项
        currentBook.chapters.forEach((chapter, index) => {
            const id = 'chapter-' + index;
            bookData.manifest[id] = {
                id: id,
                href: id + '.html',
                mediaType: 'application/xhtml+xml',
                properties: {}
            };
            bookData.spine.push(id);
        });
        
        // 创建 Book 实例
        book = new ePub.Book(bookData);
        
        // 为每个章节生成 XHTML 内容
        currentBook.chapters.forEach((chapter, index) => {
            const id = 'chapter-' + index;
            const xhtml = generateXhtml(chapter);
            
            // 存储内容
            book.addSpineItem(id, xhtml);
        });
        
        // 渲染书籍
        const viewerElement = document.getElementById('viewer');
        
        rendition = book.renderTo(viewerElement, {
            width: '100%',
            height: '100%',
            spread: 'auto',
            flow: isPaginated ? 'paginated' : 'scrolled',
            manager: isPaginated ? 'default' : 'continuous'
        });
        
        // 生成并显示
        rendition.generate().then(() => {
            // 显示第一页
            rendition.display(0);
            
            // 隐藏加载中
            document.getElementById('loadingOverlay').classList.add('hidden');
            
            // 监听位置变化
            rendition.on('relocated', onLocationChange);
            
            // 初始化进度
            updateProgress();
        }).catch(err => {
            console.error('渲染失败:', err);
            // 如果 epub.js 方法失败，回退到简单 HTML 模式
            fallbackToHtml();
        });
    }
    
    // ========== 生成 XHTML 内容 ==========
    function generateXhtml(chapter) {
        const fontSize = localStorage.getItem('reader_fontsize') || 18;
        const theme = localStorage.getItem('reader_theme') || 'light';
        const font = localStorage.getItem('reader_font') || 'sans';
        
        let bgColor, textColor, linkColor;
        
        if (theme === 'dark') {
            bgColor = '#1e1e28';
            textColor = '#c8c8d0';
            linkColor = '#5dade2';
        } else if (theme === 'sepia') {
            bgColor = '#fdf6e3';
            textColor = '#5b4636';
            linkColor = '#8b4513';
        } else {
            bgColor = '#ffffff';
            textColor = '#2c2c2c';
            linkColor = '#2980b9';
        }
        
        let fontFamily;
        if (font === 'serif') fontFamily = "'Noto Serif SC', 'PMingLiU', serif";
        else if (font === 'ming') fontFamily = "'PMingLiU', serif";
        else fontFamily = "'Noto Sans SC', sans-serif";
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <meta charset="UTF-8"/>
    <title>${chapter.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: ${fontFamily};
            font-size: ${fontSize}px;
            line-height: 1.8;
            color: ${textColor};
            background-color: ${bgColor};
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
            border-bottom: 1px solid rgba(128,128,128,0.3);
        }
        
        h3 {
            font-size: 1.15em;
            font-weight: 600;
            margin: 25px 0 15px;
        }
        
        p {
            margin-bottom: 1.2em;
            text-align: justify;
            text-indent: 0;
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
            margin-bottom: 8px;
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
            border: 1px solid rgba(128,128,128,0.3);
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
        
        .first-letter::first-letter {
            font-size: 1.5em;
            font-weight: 700;
            float: left;
            margin-right: 8px;
            line-height: 1;
        }
    </style>
</head>
<body>
    <h1>${chapter.title}</h1>
    ${chapter.content || ''}
</body>
</html>`;
    }
    
    // ========== 回退到简单 HTML 模式 ==========
    function fallbackToHtml() {
        console.log('回退到 HTML 模式');
        
        const container = document.getElementById('viewer');
        container.innerHTML = `
            <iframe id="contentFrame" style="width:100%;height:100%;border:none;background:var(--bg-reader);"></iframe>
        `;
        
        // 显示第一章
        if (currentBook.chapters.length > 0) {
            loadChapterHtml(0);
        }
        
        // 隐藏加载中
        document.getElementById('loadingOverlay').classList.add('hidden');
        
        // 监听 iframe 滚动
        document.getElementById('contentFrame').addEventListener('load', function() {
            try {
                const frameDoc = this.contentDocument || this.contentWindow.document;
                frameDoc.addEventListener('scroll', function() {
                    updateProgressFromScroll();
                });
            } catch(e) {}
        });
    }
    
    function loadChapterHtml(index) {
        if (index < 0 || index >= totalChapters) return;
        
        currentChapter = index;
        const chapter = currentBook.chapters[index];
        
        const frame = document.getElementById('contentFrame');
        if (frame && chapter) {
            const fontSize = localStorage.getItem('reader_fontsize') || 18;
            const theme = localStorage.getItem('reader_theme') || 'light';
            const font = localStorage.getItem('reader_font') || 'sans';
            
            let bgColor = theme === 'dark' ? '#1e1e28' : (theme === 'sepia' ? '#fdf6e3' : '#ffffff');
            let textColor = theme === 'dark' ? '#c8c8d0' : (theme === 'sepia' ? '#5b4636' : '#2c2c2c');
            let linkColor = theme === 'dark' ? '#5dade2' : (theme === 'sepia' ? '#8b4513' : '#2980b9');
            
            let fontFamily = font === 'serif' ? "'Noto Serif SC', serif" : 
                            font === 'ming' ? "'PMingLiU', serif" : 
                            "'Noto Sans SC', sans-serif";
            
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: ${fontFamily};
                            font-size: ${fontSize}px;
                            line-height: 1.8;
                            color: ${textColor};
                            background: ${bgColor};
                            padding: 30px 20px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        h1 {
                            font-size: 1.6em;
                            font-weight: 700;
                            margin-bottom: 30px;
                            padding-bottom: 15px;
                            border-bottom: 2px solid ${linkColor};
                        }
                        h2 { font-size: 1.3em; margin: 30px 0 15px; }
                        h3 { font-size: 1.15em; margin: 25px 0 12px; }
                        p { margin-bottom: 1.2em; text-align: justify; }
                        a { color: ${linkColor}; }
                        ul, ol { margin: 15px 0; padding-left: 25px; }
                        li { margin-bottom: 6px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 10px; border: 1px solid #ddd; }
                        th { background: rgba(0,0,0,0.05); }
                    </style>
                </head>
                <body>
                    <h1>${chapter.title}</h1>
                    ${chapter.content || ''}
                </body>
                </html>
            `;
            
            frame.srcdoc = html;
        }
        
        updateProgress();
        updateTocHighlight();
    }
    
    // ========== 位置变化回调 ==========
    function onLocationChange(location) {
        if (!location || !location.start) return;
        
        currentChapter = location.start.index || 0;
        updateProgress();
        updateTocHighlight();
        saveProgress();
    }
    
    // ========== 进度更新 ==========
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
    
    function updateProgressFromScroll() {
        // 用于滚动模式的进度计算
        try {
            const frame = document.getElementById('contentFrame');
            if (!frame) return;
            
            const doc = frame.contentDocument || frame.contentWindow.document;
            const scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
            const scrollHeight = doc.documentElement.scrollHeight || doc.body.scrollHeight;
            const clientHeight = doc.documentElement.clientHeight || doc.body.clientHeight;
            
            if (scrollHeight > clientHeight) {
                const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
                
                document.getElementById('progressBar').style.width = progress + '%';
                document.getElementById('progressSlider').value = progress;
                document.getElementById('progressText').textContent = Math.round(progress) + '%';
                
                // 保存滚动位置
                localStorage.setItem('reader_scroll_' + currentBook.id + '_ch' + currentChapter, scrollTop);
            }
        } catch(e) {}
    }
    
    // ========== 导航控制 ==========
    function nextPage() {
        if (rendition) {
            rendition.next();
        } else {
            // 回退模式
            if (currentChapter < totalChapters - 1) {
                loadChapterHtml(currentChapter + 1);
            }
        }
    }
    
    function prevPage() {
        if (rendition) {
            rendition.prev();
        } else {
            // 回退模式
            if (currentChapter > 0) {
                loadChapterHtml(currentChapter - 1);
            }
        }
    }
    
    function seekTo(value) {
        const index = Math.floor((value / 100) * totalChapters);
        
        if (rendition) {
            rendition.display(index);
        } else {
            loadChapterHtml(index);
        }
    }
    
    function goToChapter(index) {
        if (index >= 0 && index < totalChapters) {
            if (rendition) {
                rendition.display(index);
            } else {
                loadChapterHtml(index);
            }
            closeSidebar();
        }
    }
    
    // ========== 目录渲染 ==========
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
    
    function updateTocHighlight() {
        const items = document.querySelectorAll('.toc-item');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === currentChapter);
        });
    }
    
    // ========== 侧边栏 ==========
    function toggleSidebar(type) {
        const overlay = document.getElementById('sidebarOverlay');
        
        if (type === 'toc') {
            const sidebar = document.getElementById('tocSidebar');
            sidebar.classList.toggle('show');
            document.getElementById('settingsSidebar').classList.remove('show');
        } else if (type === 'settings') {
            const sidebar = document.getElementById('settingsSidebar');
            sidebar.classList.toggle('show');
            document.getElementById('tocSidebar').classList.remove('show');
        }
        
        overlay.classList.toggle('show');
    }
    
    function closeSidebar() {
        document.getElementById('tocSidebar').classList.remove('show');
        document.getElementById('settingsSidebar').classList.remove('show');
        document.getElementById('sidebarOverlay').classList.remove('show');
    }
    
    // ========== 设置功能 ==========
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('reader_theme', theme);
        
        // 更新设置面板状态
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // 重新渲染内容
        reloadContent();
    }
    
    function setFont(font) {
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('reader_font', font);
        
        document.querySelectorAll('[data-font]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === font);
        });
        
        reloadContent();
    }
    
    function setFontSize(size) {
        localStorage.setItem('reader_fontsize', size);
        document.getElementById('fontSizeSlider').value = size;
        reloadContent();
    }
    
    function setReadMode(mode) {
        isPaginated = mode === 'paginated';
        
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // 重新初始化书籍
        document.getElementById('loadingOverlay').classList.remove('hidden');
        
        if (rendition) {
            rendition.destroy();
            book = null;
        }
        
        createVirtualEpub();
    }
    
    function reloadContent() {
        // 重新加载当前章节以应用新设置
        document.getElementById('loadingOverlay').classList.remove('hidden');
        
        if (rendition) {
            rendition.destroy();
            book = null;
        }
        
        createVirtualEpub();
    }
    
    // ========== 主题初始化 ==========
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
    
    // ========== 进度保存/恢复 ==========
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
    
    // ========== 键盘导航 ==========
    function setupKeyboardNav() {
        document.addEventListener('keydown', function(e) {
            // 避免在输入框中触发
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                case 'PageDown':
                    nextPage();
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    prevPage();
                    e.preventDefault();
                    break;
                case 'Escape':
                    closeSidebar();
                    break;
            }
        });
    }
    
    // ========== 返回 ==========
    function goBack() {
        window.location.href = './index.html';
    }
    
    // ========== 错误处理 ==========
    function showError(msg) {
        document.getElementById('loadingOverlay').innerHTML = `
            <div style="color: #e74c3c; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <div>${msg}</div>
            </div>
        `;
    }
    
    // ========== 暴露全局函数 ==========
    window.goToChapter = goToChapter;
    window.nextPage = nextPage;
    window.prevPage = prevPage;
    window.seekTo = seekTo;
    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
    window.setTheme = setTheme;
    window.setFont = setFont;
    window.setFontSize = setFontSize;
    window.setReadMode = setReadMode;
    window.goBack = goBack;
    
})();