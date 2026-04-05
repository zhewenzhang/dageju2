// 📚 书籍配置中心
// 用于管理所有书籍的元信息

const BOOKS_CONFIG = [
    // ===== 大棋局系列 =====
    {
        id: "dageju2",
        title: "大棋局 2",
        subtitle: "從 1997 到 2026——地緣政治的演變與重構",
        author: "續寫自布熱津斯基《<n>大棋局</n>》",
        category: "地緣政治",
        tags: ["國際關係", "中美競爭", "台灣問題"],
        cover: "♟️",
        coverColor: "linear-gradient(145deg, #2c3e50 0%, #1a252f 100%)",
        description: "從單極到兩極：中美競合時代的地緣政治演變",
        chapters: 8,
        words: "約37萬字",
        status: "completed",
        path: "./md/dageju2/",
        readerPath: "./reader.html?book=dageju2",
        sort: 1,
        publishDate: "2026-03-25",
        lastRead: null
    },
    
    // ===== 添加更多书籍在这里 =====
    // 格式：
    // {
    //     id: "book-id",
    //     title: "书名",
    //     subtitle: "副标题",
    //     author: "作者",
    //     category: "分类",
    //     tags: ["标签1", "标签2"],
    //     cover: "📖",
    //     coverColor: "linear-gradient(...)",
    //     description: "简介",
    //     chapters: 章节数,
    //     words: "字数",
    //     status: "completed" | "writing" | "planning",
    //     path: "./md/book-id/",
    //     readerPath: "./reader.html?book=book-id",
    //     sort: 排序数字,
    //     publishDate: "YYYY-MM-DD",
    //     lastRead: null
    // }
    
    // ===== 示例书籍（正式上线时删除）=====
    {
        id: "sample-book",
        title: "示例书籍",
        subtitle: "这是一本示例书籍",
        author: "示例作者",
        category: "示例分类",
        tags: ["示例", "测试"],
        cover: "📚",
        coverColor: "linear-gradient(145deg, #3498db 0%, #2980b9 100%)",
        description: "这是示例书籍的简介，用于演示系统功能。",
        chapters: 10,
        words: "約10萬字",
        status: "completed",
        path: "./md/sample-book/",
        readerPath: "./reader.html?book=sample-book",
        sort: 99,
        publishDate: "2026-04-01",
        lastRead: null
    }
];

// ===== 分类列表（自动生成）=====
function getCategories() {
    const categories = new Set();
    BOOKS_CONFIG.forEach(book => {
        if (book.category) categories.add(book.category);
    });
    return Array.from(categories).sort();
}

// ===== 获取书籍列表（支持筛选和排序）=====
function getBooks(options = {}) {
    let books = [...BOOKS_CONFIG];
    
    // 筛选分类
    if (options.category && options.category !== 'all') {
        books = books.filter(b => b.category === options.category);
    }
    
    // 筛选状态
    if (options.status && options.status !== 'all') {
        books = books.filter(b => b.status === options.status);
    }
    
    // 搜索
    if (options.search) {
        const keyword = options.search.toLowerCase();
        books = books.filter(b => 
            b.title.toLowerCase().includes(keyword) ||
            b.author.toLowerCase().includes(keyword) ||
            b.description.toLowerCase().includes(keyword) ||
            (b.tags && b.tags.some(t => t.toLowerCase().includes(keyword)))
        );
    }
    
    // 排序
    if (options.sort === 'newest') {
        books.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    } else if (options.sort === 'oldest') {
        books.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
    } else if (options.sort === 'title') {
        books.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    } else {
        // 默认：按 sort 字段排序
        books.sort((a, b) => (a.sort || 999) - (b.sort || 999));
    }
    
    return books;
}

// ===== 获取单本书信息 =====
function getBook(id) {
    return BOOKS_CONFIG.find(b => b.id === id);
}

// ===== 更新最近阅读 =====
function updateLastRead(bookId) {
    const book = getBook(bookId);
    if (book) {
        book.lastRead = new Date().toISOString();
        // 保存到 localStorage
        try {
            const reads = JSON.parse(localStorage.getItem('recent_reads') || '{}');
            reads[bookId] = new Date().toISOString();
            localStorage.setItem('recent_reads', JSON.stringify(reads));
        } catch(e) {}
    }
}

// ===== 获取最近阅读的书籍 =====
function getRecentReads(limit = 5) {
    try {
        const reads = JSON.parse(localStorage.getItem('recent_reads') || '{}');
        const sorted = Object.entries(reads)
            .sort((a, b) => new Date(b[1]) - new Date(a[1]))
            .slice(0, limit);
        return sorted.map(([id]) => getBook(id)).filter(Boolean);
    } catch {
        return [];
    }
}

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BOOKS_CONFIG, getCategories, getBooks, getBook, getRecentReads, updateLastRead };
}