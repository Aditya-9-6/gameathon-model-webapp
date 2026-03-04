const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
};

http.createServer((req, res) => {
    // 1. Determine target file path
    let urlPath = req.url.split('?')[0]; // Remove query strings
    let targetPath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);

    // 2. Helper to serve file
    const sendFile = (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                // If it's a directory or missing, try appending .html
                if (err.code === 'ENOENT' && !filePath.endsWith('.html')) {
                    return sendFile(filePath + '.html');
                }
                res.writeHead(404);
                res.end(`[IronWall] 404 - File Not Found: ${urlPath}`);
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    };

    sendFile(targetPath);
}).listen(PORT, () => {
    console.log(`\x1b[36m🛡️  IronWall+ Static Server LIVE at http://localhost:${PORT}/\x1b[0m`);
    console.log(`\x1b[33m🚀 Serving files from: ${__dirname}\x1b[0m`);
});
