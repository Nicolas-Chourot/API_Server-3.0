var clc = require("cli-color");
const utilities = require('./utilities');
const Cache = require('./getRequestsCacheManager');

module.exports =
    class Response {
        constructor(req, res) {
            this.res = res;
            this.endpoint = this.makeCacheableEndpoint(req.url);
            this.urlBase = this.makeUrlBase(req.url);
        }
        makeCacheableEndpoint(url) {
            if (url != "") {
                let path = utilities.decomposePath(url);
                if (path.isAPI && path.id == undefined)
                    return url;
            }
            // not cacheable
            return "";
        }
        makeUrlBase(url) {
            if (url != "") {
                let path = utilities.decomposePath(url);
                return (path.isAPI ? "/api" : "") + "/" + path.model;
            }
            return "";
        }
        status(number) {
            this.res.writeHead(number, { 'content-type': 'text/plain' });
            this.end();
        }
        end(content = null) {
            // console.log(clc.bold(clc.green(`[${this.url}]response completed`)));
            if (content)
                this.res.end(content);
            else
                this.res.end();
        }
        ok() {
            // ok status
            this.status(200);
            Cache.clear(this.urlBase);
        }
        accepted() {
            // accepted status
            this.status(202);
            Cache.clear(this.urlBase);
        }
        created(jsonObj) {
            this.res.writeHead(201, { 'content-type': 'application/json' });
            this.end(JSON.stringify(jsonObj));
            Cache.clear(this.urlBase);
        }
        JSON(jsonObj, ETag = "", fromCache = false) {
            if (ETag != "")
                this.res.writeHead(200, { 'content-type': 'application/json', 'ETag': ETag });
            else
                this.res.writeHead(200, { 'content-type': 'application/json' });
            if (jsonObj != null) {
                if (!fromCache)
                    // dont cache it again
                    Cache.add(this.endpoint, jsonObj, ETag);
                let content = JSON.stringify(jsonObj);
                this.end(content);
            } else {
                this.end();
            }
        }
        HTML(content) {
            this.content('text/html', content);
        }
        content(contentType, content) {
            this.res.writeHead(200, { 'content-type': contentType });
            this.end(content);
        }
        ETag(ETag) {
            this.res.writeHead(204, { 'ETag': ETag });
            this.end();
        }
        noContent() {
            // no content status
            this.status(204);
            Cache.clear(this.urlBase);
        }
        notFound() {
            // not found status
            this.status(404);
        }
        forbidden() {
            // forbidden status
            this.status(403);
        }
        unAuthorized() {
            // forbidden status
            this.status(401);
        }
        notAloud() {
            // Method not aloud status
            this.status(405);
        }
        conflict() {
            // Conflict status
            this.status(409);
        }
        unsupported() {
            // Unsupported Media Type status
            this.status(415);
        }
        unprocessable() {
            // Unprocessable Entity status
            this.status(422);
        }
        badRequest() {
            // bad request status
            this.status(400);
        }
        internalError() {
            // internal error status
            this.status(500);
        }
        notImplemented() {
            //Not implemented
            this.status(501);
        }
    }