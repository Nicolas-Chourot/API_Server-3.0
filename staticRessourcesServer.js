const path = require('path');
const fs = require('fs');
const mimes = require('./mimes.json');
let wwwroot = 'wwwroot';
let defaultRessource = 'index.html';

function requestedStaticRessource(url) {
    let ressourceName = url === '/' ? defaultRessource : url;
    return path.join(__dirname, wwwroot, ressourceName);
}

function extToContentType(filePath) {
    let extension = path.extname(filePath).replace('.','');
    let contentType = mimes[extension];
    if (contentType !== undefined)
        return contentType;
    return 'text/html';
}

exports.sendRequestedFile = (req, res) => {
    return new Promise(async (resolve) => {
        let filePath = requestedStaticRessource(req.url);
        let contentType = extToContentType(filePath);
        try {
            let content = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
            resolve(true);
        } catch (error) {
            if (error.code === 'ENOENT') {
                resolve(false);
            } else {
                res.writeHead(500);
                res.end(`Server error: ${err.code}`);
                resolve(true);
            }
        }
    })
}