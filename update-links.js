const fs = require('fs');
const path = require('path');

// الامتدادات التي سنقوم بالبحث داخلها
const targetExtensions = ['.html', '.xml'];

// قواعد الاستبدال للروابط (تدعم وجود الهاش # والمتغيرات ?)
const replacements = [
    // الروابط النسبية (Relative URLs)
    { regex: /href="index\.html([\#\?][^"]*)?"/g, replacement: 'href="/$1"' },
    { regex: /href="courses\.html([\#\?][^"]*)?"/g, replacement: 'href="/courses$1"' },
    { regex: /href="course-quran\.html([\#\?][^"]*)?"/g, replacement: 'href="/course-quran$1"' },
    { regex: /href="course-arabic\.html([\#\?][^"]*)?"/g, replacement: 'href="/course-arabic$1"' },
    { regex: /href="course-islamic\.html([\#\?][^"]*)?"/g, replacement: 'href="/course-islamic$1"' },
    { regex: /href="enroll\.html([\#\?][^"]*)?"/g, replacement: 'href="/enroll$1"' },
    { regex: /href="thank-you\.html([\#\?][^"]*)?"/g, replacement: 'href="/thank-you$1"' },
    
    // الروابط المطلقة (Absolute URLs) الموجودة في sitemap و tags SEO
    { regex: /https:\/\/sadidacademy\.netlify\.app\/index\.html([\#\?][^<"]*)?/g, replacement: 'https://sadidacademy.netlify.app/$1' },
    { regex: /https:\/\/sadidacademy\.netlify\.app\/courses\.html([\#\?][^<"]*)?/g, replacement: 'https://sadidacademy.netlify.app/courses$1' },
    { regex: /https:\/\/sadidacademy\.netlify\.app\/course-quran\.html([\#\?][^<"]*)?/g, replacement: 'https://sadidacademy.netlify.app/course-quran$1' },
    { regex: /https:\/\/sadidacademy\.netlify\.app\/course-arabic\.html([\#\?][^<"]*)?/g, replacement: 'https://sadidacademy.netlify.app/course-arabic$1' },
    { regex: /https:\/\/sadidacademy\.netlify\.app\/course-islamic\.html([\#\?][^<"]*)?/g, replacement: 'https://sadidacademy.netlify.app/course-islamic$1' },
    { regex: /https:\/\/sadidacademy\.netlify\.app\/enroll\.html([\#\?][^<"]*)?/g, replacement: 'https://sadidacademy.netlify.app/enroll$1' },
    { regex: /https:\/\/sadidacademy\.netlify\.app\/thank-you\.html([\#\?][^<"]*)?/g, replacement: 'https://sadidacademy.netlify.app/thank-you$1' }
];

function cleanUrls(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // الدخول للمجلدات الفرعية مع تجاهل مجلدات النظام
        if (stat.isDirectory() && !['node_modules', '.git', '.github'].includes(file)) {
            cleanUrls(filePath);
        } else if (stat.isFile() && targetExtensions.includes(path.extname(file))) {
            let content = fs.readFileSync(filePath, 'utf8');
            let updatedContent = content;
            replacements.forEach(({ regex, replacement }) => {
                updatedContent = updatedContent.replace(regex, (match, p1) => replacement.replace('$1', p1 || ''));
            });
            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`✅ تم تحديث الروابط في ملف: ${file}`);
            }
        }
    });
}
console.log("🚀 جاري فحص الملفات وتحديث الروابط...");
cleanUrls(__dirname);
console.log("🎉 اكتمل تحديث جميع الروابط بنجاح!");