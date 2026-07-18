const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8'
};

const routeMap = {
  '/courses': '/courses.html',
  '/course-quran': '/course-quran.html',
  '/course-arabic': '/course-arabic.html',
  '/course-islamic': '/course-islamic.html',
  '/enroll': '/enroll.html',
  '/thank-you': '/thank-you.html'
};

function getFilePath(requestPath) {
  const normalizedPath = decodeURIComponent(requestPath.split('?')[0]);

  if (normalizedPath === '/') {
    return path.join(rootDir, 'index.html');
  }

  if (routeMap[normalizedPath]) {
    return path.join(rootDir, routeMap[normalizedPath].replace(/^\//, ''));
  }

  const candidate = path.join(rootDir, normalizedPath.replace(/^\//, ''));
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return path.join(candidate, 'index.html');
  }

  return candidate;
}

function sendResponse(res, statusCode, content, contentType) {
  res.writeHead(statusCode, {
    'Content-Type': contentType || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache'
  });
  res.end(content);
}

const server = http.createServer((req, res) => {
  const requestPath = req.url || '/';
  const filePath = getFilePath(requestPath);
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || 'application/octet-stream';

  if (req.method === 'HEAD') {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end();
      return;
    }

    sendResponse(res, 404, 'Not Found', 'text/plain; charset=utf-8');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        sendResponse(res, 500, 'Internal Server Error');
        return;
      }
      sendResponse(res, 200, data, contentType);
    });
    return;
  }

  const fallbackPath = path.join(rootDir, '404.html');
  if (fs.existsSync(fallbackPath)) {
    fs.readFile(fallbackPath, (err, data) => {
      if (err) {
        sendResponse(res, 404, 'Page not found');
        return;
      }
      sendResponse(res, 404, data, mimeTypes['.html']);
    });
    return;
  }

  sendResponse(res, 404, 'Page not found');
});

server.listen(port, () => {
  console.log(`Local site server running at http://localhost:${port}`);
});
