// 电子书阅读器 - 全新版本

(function() {
    // ========== 全局变量 ==========
    let currentBook = null;
    let currentChapter = 0;
    let totalChapters = 0;
    let fontSizeLevels = ['font-small', 'normal', 'font-large'];
    let fontSizeIndex = 1;
    
    // ========== 书籍配置库 ==========
    const BOOKS_LIBRARY = {
        'dageju2': typeof DAGEJU2_CONFIG !== 'undefined' ? DAGEJU2_CONFIG : null
    };
    
    // ========== 初始化 ==========
    document.addEventListener('DOMContentLoaded', function() {
        initBook();
        initTheme();
        initFontSize();
        setupEventListeners();
        restoreProgress();
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
        } else {
            alert('未找到书籍配置');
            return;
        }
        
        if (!currentBook || !currentBook.chapters) {
            alert('书籍配置无效');
            return;
        }
        
        totalChapters = currentBook.chapters.length;
        
        // 设置书名
        const titleEl = document.getElementById('bookTitle');
        if (titleEl) {
            titleEl.textContent = currentBook.title || '电子书';
        }
        
        // 加载目录
        loadChapterList();
        
        // 渲染当前章节
        renderChapter(currentChapter);
        updateNavButtons();
    }
    
    // ========== 目录加载 ==========
    function loadChapterList() {
        const chapterList = document.getElementById('chapterList');
        if (!chapterList || !currentBook) return;
        
        chapterList.innerHTML = '';
        
        currentBook.chapters.forEach((chapter, index) => {
            const item = document.createElement('div');
            item.className = 'chapter-item';
            
            const link = document.createElement('a');
            link.className = 'chapter-link';
            link.href = 'javascript:void(0)';
            link.onclick = function() {
                goToChapter(index);
            };
            
            // 章节编号
            let numText = index === 0 ? '📖' : (index + 1);
            link.innerHTML = `<span class="num">${numText}</span> ${chapter.title}`;
            
            item.appendChild(link);
            chapterList.appendChild(item);
        });
    }
    
    // ========== 渲染章节 ==========
    function renderChapter(chapterIndex) {
        if (!currentBook || chapterIndex < 0 || chapterIndex >= totalChapters) return;
        
        currentChapter = chapterIndex;
        
        const container = document.getElementById('chapterContainer');
        const chapter = currentBook.chapters[chapterIndex];
        
        if (!container || !chapter) return;
        
        // 更新目录高亮
        updateChapterHighlight();
        
        // 生成章节 HTML
        let html = `<h1 class="chapter-title">${chapter.title}</h1>`;
        html += `<div class="chapter-body">${chapter.content}</div>`;
        
        container.innerHTML = html;
        
        // 滚动到顶部
        const contentArea = document.getElementById('readerContent');
        if (contentArea) {
            contentArea.scrollTop = 0;
        }
        
        // 更新导航信息
        updateNavButtons();
        
        // 更新进度条
        updateProgress();
        
        // 保存阅读进度
        saveProgress();
        
        // 更新章节信息显示
        const infoEl = document.getElementById('chapterInfo');
        if (infoEl) {
            infoEl.textContent = `第 ${chapterIndex + 1} 章 / 共 ${totalChapters} 章`;
        }
        
        // 关闭侧边栏
        closeSidebar();
    }
    
    // ========== 章节导航 ==========
    function goToChapter(index) {
        if (index >= 0 && index < totalChapters) {
            renderChapter(index);
        }
    }
    
    function nextChapter() {
        if (currentChapter < totalChapters - 1) {
            renderChapter(currentChapter + 1);
        }
    }
    
    function prevChapter() {
        if (currentChapter > 0) {
            renderChapter(currentChapter - 1);
        }
    }
    
    // ========== 更新导航按钮 ==========
    function updateNavButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = currentChapter === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentChapter >= totalChapters - 1;
        }
    }
    
    // ========== 更新章节高亮 ==========
    function updateChapterHighlight() {
        const links = document.querySelectorAll('.chapter-link');
        links.forEach((link, index) => {
            if (index === currentChapter) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // ========== 更新进度条 ==========
    function updateProgress() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar && totalChapters > 0) {
            const progress = ((currentChapter + 1) / totalChapters) * 100;
            progressBar.style.width = progress + '%';
        }
    }
    
    // ========== 保存/恢复进度 ==========
    function saveProgress() {
        if (!currentBook) return;
        
        const progressData = {
            bookId: currentBook.id,
            chapter: currentChapter,
            timestamp: Date.now()
        };
        
        localStorage.setItem('reader_progress_' + currentBook.id, JSON.stringify(progressData));
    }
    
    function restoreProgress() {
        if (!currentBook) return;
        
        try {
            const saved = localStorage.getItem('reader_progress_' + currentBook.id);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.chapter !== undefined && data.chapter > 0) {
                    // 恢复阅读进度，但不立即跳转，等页面加载完成后
                    setTimeout(() => {
                        if (currentChapter === 0 && data.chapter > 0) {
                            renderChapter(data.chapter);
                        }
                    }, 100);
                }
            }
        } catch (e) {
            console.log('恢复进度失败:', e);
        }
    }
    
    // ========== 侧边栏控制 ==========
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        }
    }
    
    function closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    }
    
    // ========== 主题切换 ==========
    function initTheme() {
        const savedTheme = localStorage.getItem('reader_theme') || 'dark';
        setTheme(savedTheme);
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('reader_theme', theme);
        
        // 更新主题图标
        const themeBtn = document.querySelector('[onclick="toggleTheme()"]');
        if (themeBtn) {
            if (theme === 'light') {
                themeBtn.textContent = '☀️';
            } else if (theme === 'sepia') {
                themeBtn.textContent = '📜';
            } else {
                themeBtn.textContent = '◐';
            }
        }
    }
    
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        let next;
        
        if (current === 'dark' || !current) {
            next = 'light';
        } else if (current === 'light') {
            next = 'sepia';
        } else {
            next = 'dark';
        }
        
        setTheme(next);
    }
    
    // ========== 字体大小 ==========
    function initFontSize() {
        const saved = localStorage.getItem('reader_fontsize');
        if (saved) {
            fontSizeIndex = parseInt(saved) || 1;
            setFontSize(fontSizeIndex);
        }
    }
    
    function setFontSize(index) {
        fontSizeIndex = index;
        
        const container = document.getElementById('chapterContainer');
        if (container) {
            container.classList.remove('font-small', 'font-large');
            
            if (index === 0) {
                container.classList.add('font-small');
            } else if (index === 2) {
                container.classList.add('font-large');
            }
        }
        
        localStorage.setItem('reader_fontsize', index);
    }
    
    function adjustFontSize() {
        fontSizeIndex = (fontSizeIndex + 1) % 3;
        setFontSize(fontSizeIndex);
    }
    
    // ========== 返回功能 ==========
    function goBack() {
        // 返回书库首页
        window.location.href = './index.html';
    }
    
    // ========== 事件监听 ==========
    function setupEventListeners() {
        // 键盘导航
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextChapter();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                prevChapter();
            } else if (e.key === 'Escape') {
                closeSidebar();
            }
        });
        
        // 滚动时保存进度（节流）
        let scrollTimeout;
        const contentArea = document.getElementById('readerContent');
        if (contentArea) {
            contentArea.addEventListener('scroll', function() {
                if (scrollTimeout) clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(function() {
                    // 记录滚动位置
                    localStorage.setItem('reader_scroll_' + currentBook.id, contentArea.scrollTop);
                }, 500);
            });
            
            // 恢复滚动位置
            setTimeout(function() {
                const savedScroll = localStorage.getItem('reader_scroll_' + currentBook.id);
                if (savedScroll) {
                    contentArea.scrollTop = parseInt(savedScroll);
                }
            }, 100);
        }
    }
    
    // ========== 暴露全局函数 ==========
    window.goToChapter = goToChapter;
    window.nextChapter = nextChapter;
    window.prevChapter = prevChapter;
    window.toggleSidebar = toggleSidebar;
    window.toggleTheme = toggleTheme;
    window.adjustFontSize = adjustFontSize;
    window.goBack = goBack;
    
})();