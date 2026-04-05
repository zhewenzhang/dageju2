// 电子书阅读器 - 主脚本

(function() {
    // ========== 全局变量 ==========
    let currentBook = null;
    let currentChapter = 0;
    let totalPages = 0;
    let isScrollMode = false;
    let fontSizeIndex = 1; // 0: small, 1: normal, 2: large
    
    // ========== 书籍配置库 ==========
    const BOOKS_LIBRARY = {
        'dageju2': typeof DAGEJU2_CONFIG !== 'undefined' ? DAGEJU2_CONFIG : null
        // 添加更多书籍配置:
        // 'my-second-book': MY_SECOND_BOOK_CONFIG
    };
    
    // ========== 初始化 ==========
    document.addEventListener('DOMContentLoaded', function() {
        initBook();
        initTheme();
        initFontSize();
        initScrollMode();
        setupEventListeners();
    });
    
    // ========== 书籍初始化 ==========
    function initBook() {
        // 获取 URL 参数中的书籍 ID
        const urlParams = new URLSearchParams(window.location.search);
        let bookId = urlParams.get('book');
        
        // 默认使用大棋局 2
        if (!bookId) {
            bookId = 'dageju2';
        }
        
        // 加载书籍配置
        if (BOOKS_LIBRARY[bookId]) {
            currentBook = BOOKS_LIBRARY[bookId];
        } else if (bookId === 'dageju2' && typeof DAGEJU2_CONFIG !== 'undefined') {
            currentBook = DAGEJU2_CONFIG;
        } else {
            // 尝试动态加载配置
            console.log('尝试加载书籍配置:', bookId);
            currentBook = DAGEJU2_CONFIG; // Fallback
        }
        
        if (!currentBook) {
            alert('未找到书籍配置，请检查书籍配置是否正确加载');
            return;
        }
        
        console.log('加载书籍:', currentBook.title);
        
        // 设置书名
        const titleEl = document.getElementById('bookTitle');
        if (titleEl) {
            // 提取书名（去掉"第 X 章"部分）
            const mainTitle = currentBook.title.split('：')[0] || currentBook.title;
            titleEl.textContent = mainTitle;
        }
        
        // 加载目录
        loadChapterList();
        
        // 加载章节内容
        totalPages = currentBook.chapters.length;
        
        // 恢复上次阅读位置
        restoreProgress();
        
        // 渲染当前章节
        renderChapter(currentChapter);
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
            
            // 章节编号显示
            let chapterNum = '';
            if (index === 0) {
                chapterNum = '📖';
            } else {
                chapterNum = '第' + index + '章';
            }
            
            link.innerHTML = `
                <span class="chapter-num">${chapterNum}</span>
                <span class="chapter-title">${chapter.title}</span>
            `;
            
            if (index === currentChapter) {
                link.classList.add('active');
            }
            
            item.appendChild(link);
            chapterList.appendChild(item);
        });
    }
    
    // ========== 章节渲染 ==========
    function renderChapter(chapterIndex) {
        if (!currentBook || chapterIndex < 0 || chapterIndex >= currentBook.chapters.length) {
            return;
        }
        
        const chapter = currentBook.chapters[chapterIndex];
        const pagesContainer = document.getElementById('pagesContainer');
        
        // 更新目录高亮
        updateChapterHighlight(chapterIndex);
        
        // 创建页面
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'page-wrapper';
        pageWrapper.id = 'chapter-' + chapterIndex;
        
        const bookPage = document.createElement('div');
        bookPage.className = 'book-page';
        
        bookPage.innerHTML = `
            <div class="page-header">
                <h1>${chapter.title}</h1>
                <div class="subtitle">${chapter.subtitle || ''}</div>
            </div>
            <div class="page-content">
                ${chapter.content}
            </div>
            <div class="page-footer">
                <span class="page-num">第 ${chapterIndex + 1} 頁 / 共 ${totalPages} 章</span>
                <div class="page-nav">
                    ${chapterIndex > 0 ? `<button class="page-nav-btn" onclick="prevPage()">← 上一頁</button>` : ''}
                    ${chapterIndex < totalPages - 1 ? `<button class="page-nav-btn" onclick="nextPage()">下一頁 →</button>` : ''}
                </div>
            </div>
        `;
        
        pageWrapper.appendChild(bookPage);
        
        // 清空并添加新页面
        pagesContainer.innerHTML = '';
        pagesContainer.appendChild(pageWrapper);
        
        // 滚动到顶部
        pagesContainer.scrollTop = 0;
        
        // 更新进度
        updateProgressBar();
        updateNavButtons();
        
        // 保存进度
        saveProgress(chapterIndex);
        
        // 关闭侧边栏
        closeSidebar();
    }
    
    // ========== 翻页功能 ==========
    function nextPage() {
        if (currentChapter < totalPages - 1) {
            currentChapter++;
            renderChapter(currentChapter);
            
            // 添加翻页动画
            const pagesContainer = document.getElementById('pagesContainer');
            pagesContainer.classList.add('flip-animation');
            setTimeout(() => {
                pagesContainer.classList.remove('flip-animation');
            }, 400);
        }
    }
    
    function prevPage() {
        if (currentChapter > 0) {
            currentChapter--;
            renderChapter(currentChapter);
        }
    }
    
    function goToChapter(chapterIndex) {
        if (chapterIndex >= 0 && chapterIndex < totalPages) {
            currentChapter = chapterIndex;
            renderChapter(chapterIndex);
        }
    }
    
    // ========== 进度管理 ==========
    function updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar && totalPages > 0) {
            const progress = ((currentChapter + 1) / totalPages) * 100;
            progressBar.style.width = progress + '%';
        }
    }
    
    function updateNavButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = currentChapter === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentChapter >= totalPages - 1;
        }
    }
    
    function updateChapterHighlight(chapterIndex) {
        const links = document.querySelectorAll('.chapter-link');
        links.forEach((link, index) => {
            if (index === chapterIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // ========== 进度保存与恢复 ==========
    function saveProgress(chapterIndex) {
        if (!currentBook) return;
        
        const progress = ((chapterIndex + 1) / totalPages) * 100;
        localStorage.setItem('book-progress-' + currentBook.id, progress);
        localStorage.setItem('book-last-chapter-' + currentBook.id, chapterIndex);
        localStorage.setItem('book-last-read-' + currentBook.id, Date.now());
    }
    
    function restoreProgress() {
        if (!currentBook) return;
        
        const lastChapter = localStorage.getItem('book-last-chapter-' + currentBook.id);
        if (lastChapter !== null) {
            currentChapter = parseInt(lastChapter);
            if (currentChapter >= totalPages) {
                currentChapter = 0;
            }
        }
    }
    
    // ========== 主题切换 ==========
    function initTheme() {
        const savedTheme = localStorage.getItem('reader-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    function toggleTheme() {
        const themes = ['dark', 'light', 'sepia'];
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let currentIndex = themes.indexOf(currentTheme);
        let nextIndex = (currentIndex + 1) % themes.length;
        let nextTheme = themes[nextIndex];
        
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('reader-theme', nextTheme);
        updateThemeIcon(nextTheme);
        
        showToast('主題：' + getThemeName(nextTheme));
    }
    
    function updateThemeIcon(theme) {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            if (theme === 'light') {
                themeIcon.textContent = '☀️';
            } else if (theme === 'sepia') {
                themeIcon.textContent = '📜';
            } else {
                themeIcon.textContent = '🌙';
            }
        }
    }
    
    function getThemeName(theme) {
        const names = {
            'dark': '深色',
            'light': '白色',
            'sepia': '護眼'
        };
        return names[theme] || theme;
    }
    
    // ========== 字体大小 ==========
    function initFontSize() {
        const savedSize = localStorage.getItem('reader-font-size');
        if (savedSize !== null) {
            fontSizeIndex = parseInt(savedSize);
            applyFontSize();
        }
        updateFontSizeIcon();
    }
    
    function toggleFontSize() {
        fontSizeIndex = (fontSizeIndex + 1) % 3;
        applyFontSize();
        saveFontSize();
        updateFontSizeIcon();
        
        const sizes = ['小', '標準', '大'];
        showToast('字體大小：' + sizes[fontSizeIndex]);
    }
    
    function applyFontSize() {
        document.body.classList.remove('font-size-small', 'font-size-large');
        
        if (fontSizeIndex === 0) {
            document.body.classList.add('font-size-small');
        } else if (fontSizeIndex === 2) {
            document.body.classList.add('font-size-large');
        }
    }
    
    function saveFontSize() {
        localStorage.setItem('reader-font-size', fontSizeIndex);
    }
    
    function updateFontSizeIcon() {
        const fontSizeIcon = document.getElementById('fontSizeIcon');
        if (fontSizeIcon) {
            const sizes = ['A<small>', 'A', 'A<large>'];
            fontSizeIcon.innerHTML = sizes[fontSizeIndex];
        }
    }
    
    // ========== 滚动/翻页模式切换 ==========
    function initScrollMode() {
        const savedMode = localStorage.getItem('reader-scroll-mode');
        isScrollMode = savedMode === 'true';
        applyScrollMode();
        updateModeIcon();
    }
    
    function toggleScrollMode() {
        isScrollMode = !isScrollMode;
        applyScrollMode();
        localStorage.setItem('reader-scroll-mode', isScrollMode);
        updateModeIcon();
        
        showToast(isScrollMode ? '滾動模式' : '翻頁模式');
    }
    
    function applyScrollMode() {
        const readerMain = document.getElementById('readerMain');
        const pageNavButtons = document.getElementById('pageNavButtons');
        
        if (isScrollMode) {
            readerMain.classList.add('scroll-mode');
            pageNavButtons.classList.add('hide');
        } else {
            readerMain.classList.remove('scroll-mode');
            pageNavButtons.classList.remove('hide');
        }
    }
    
    function updateModeIcon() {
        const modeIcon = document.getElementById('modeIcon');
        if (modeIcon) {
            modeIcon.textContent = isScrollMode ? '📖' : '📜';
        }
    }
    
    // ========== 提示框 ==========
    function showToast(message) {
        const toast = document.getElementById('modeToast');
        const toastText = document.getElementById('modeToastText');
        
        if (toast && toastText) {
            toastText.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }
    }
    
    // ========== 侧边栏 ==========
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
        
        if (sidebar && overlay) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        }
    }
    
    // ========== 返回书库 ==========
    function goBack() {
        // 尝试返回书库
        if (document.referrer && document.referrer.includes('index.html')) {
            window.history.back();
        } else {
            window.location.href = './index.html';
        }
    }
    
    // ========== 事件监听 ==========
    function setupEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            // 如果侧边栏打开，按 ESC 关闭
            if (e.key === 'Escape') {
                closeSidebar();
                return;
            }
            
            // 滚动模式下不使用方向键翻页
            if (isScrollMode) return;
            
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    nextPage();
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    prevPage();
                    e.preventDefault();
                    break;
                case 'Home':
                    currentChapter = 0;
                    renderChapter(currentChapter);
                    e.preventDefault();
                    break;
                case 'End':
                    currentChapter = totalPages - 1;
                    renderChapter(currentChapter);
                    e.preventDefault();
                    break;
            }
        });
        
        // 触摸滑动支持
        let touchStartX = 0;
        let touchEndX = 0;
        
        const readerMain = document.getElementById('readerMain');
        
        if (readerMain) {
            readerMain.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            readerMain.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }
        
        function handleSwipe() {
            if (isScrollMode) return;
            
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // 向左滑动 - 下一页
                    nextPage();
                } else {
                    // 向右滑动 - 上一页
                    prevPage();
                }
            }
        }
        
        // 点击左右区域翻页
        const flipZones = document.createElement('div');
        flipZones.className = 'flip-zones';
        flipZones.innerHTML = `
            <div class="flip-zone left" onclick="prevPage()">
                <div class="flip-arrow">←</div>
            </div>
            <div class="flip-zone right" onclick="nextPage()">
                <div class="flip-arrow">→</div>
            </div>
        `;
        document.body.appendChild(flipZones);
    }
    
    // ========== 导出全局函数 ==========
    window.nextPage = nextPage;
    window.prevPage = prevPage;
    window.goToChapter = goToChapter;
    window.toggleSidebar = toggleSidebar;
    window.toggleTheme = toggleTheme;
    window.toggleFontSize = toggleFontSize;
    window.toggleScrollMode = toggleScrollMode;
    window.goBack = goBack;
    
})();
