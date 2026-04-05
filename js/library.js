// 电子书库 - 主脚本

// 主题切换
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const themeIcon = document.querySelector('.theme-icon');
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('library-theme', newTheme);
    
    if (themeIcon) {
        themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('library-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'light' ? '☀️' : '🌙';
    }
}

// 书籍数据 - 在这里添加新书
const BOOKS_DATA = [
    {
        id: "dageju2",
        title: "大棋局 2",
        subtitle: "從 1997 到 2026——地緣政治的演變與重構",
        author: "續寫自布熱津斯基《大棋局》",
        coverIcon: "♟️",
        coverGradient: "linear-gradient(145deg, #2c3e50 0%, #1a252f 100%)",
        edition: "第二版",
        format: "markdown",
        readerPath: "./reader.html",
        chapters: 7,
        words: "37 萬字",
        category: "reading", // reading, finished, to-read
        description: "地緣政治經典續作，分析中美雙極格局下的世界新秩序",
        tags: ["地緣政治", "國際關係", "中美競爭"],
        dateAdded: "2026-03-24",
        lastRead: null,
        progress: 0
    },
    // 添加新书示例 - 取消注释并使用
    // {
    //     id: "my-second-book",
    //     title: "我的第二本書",
    //     subtitle: "副標題",
    //     author: "作者名",
    //     coverIcon: "📖",
    //     coverGradient: "linear-gradient(145deg, #3498db 0%, #2980b9 100%)",
    //     edition: "第一版",
    //     format: "markdown",
    //     readerPath: "./reader.html?book=my-second-book",
    //     chapters: 10,
    //     words: "20 萬字",
    //     category: "to-read",
    //     description: "書籍描述",
    //     tags: ["標籤 1", "標籤 2"],
    //     dateAdded: "2026-04-01",
    //     lastRead: null,
    //     progress: 0
    // }
];

// 当前分类筛选
let currentCategory = 'all';

// 加载书籍列表
function loadBookshelf() {
    const bookshelf = document.getElementById('bookshelf');
    if (!bookshelf) return;
    
    bookshelf.innerHTML = '';
    
    // 筛选书籍
    let books = BOOKS_DATA;
    if (currentCategory !== 'all') {
        books = BOOKS_DATA.filter(book => book.category === currentCategory);
    }
    
    if (books.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        return;
    }
    
    document.getElementById('emptyState').style.display = 'none';
    
    books.forEach(book => {
        const progress = getBookProgress(book.id);
        const bookCard = createBookCard(book, progress);
        bookshelf.appendChild(bookCard);
    });
}

// 创建书籍卡片
function createBookCard(book, progress) {
    const card = document.createElement('a');
    card.className = 'book-card';
    card.href = book.readerPath + '?book=' + book.id;
    
    card.innerHTML = `
        <div class="book-cover" style="background: ${book.coverGradient}">
            <span class="edition-badge">${book.edition}</span>
            <div class="book-cover-icon">${book.coverIcon}</div>
            <div class="book-cover-title">${book.title}</div>
            ${book.subtitle ? `<div class="book-cover-subtitle">${book.subtitle}</div>` : ''}
            <div class="progress-indicator">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        </div>
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-meta">
                <span>📖 ${book.chapters}章</span>
                <span>📝 ${book.words}</span>
                ${progress > 0 ? `<span>📊 已讀 ${Math.round(progress)}%</span>` : ''}
            </div>
            ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
            ${book.tags && book.tags.length > 0 ? `
                <div class="book-tags">
                    ${book.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

// 获取阅读进度
function getBookProgress(bookId) {
    const progress = localStorage.getItem('book-progress-' + bookId);
    return progress ? parseFloat(progress) : 0;
}

// 分类切换
function initCategoryTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            loadBookshelf();
        });
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initCategoryTabs();
    loadBookshelf();
});
