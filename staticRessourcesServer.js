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
    let extension = path.extname(filePath).replace('.', '');
    let contentType = mimes[extension];
    if (contentType !== undefined)
        return contentType;
    return 'text/html';
}
exports.sendRequestedRessource = (HttpContext) => {
    return new Promise(async (resolve) => {
        let filePath = requestedStaticRessource(HttpContext.req.url);
        let contentType = extToContentType(filePath);
        try {
            let content = fs.readFileSync(filePath);
            HttpContext.response.content(contentType, content);
            resolve(true);
        } catch (error) {
            if (error.code === 'ENOENT') {
                let content = fs.readFileSync(path.join(__dirname, wwwroot, "404.html"));
                HttpContext.response.content(contentType, content);
                resolve(true);
            } else {
                HttpContext.response.res.writeHead(500);
                HttpContext.response.end(`Server error: ${err.code}`);
                resolve(true);
            }
        }
    })
}