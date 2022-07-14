const Cache = require('./getRequestsCacheManager');

module.exports =
    class Response {
        constructor(HttpContext, cacheableResponse = true) {
            this.HttpContext = HttpContext;
            this.res = HttpContext.res;
            if (cacheableResponse) {
                this.APIendpoint_url = this.makeCacheableAPIendpoint_url();
                this.APIendpoint_urlBase = this.makeAPIendpoint_urlBase();
            } else {
                this.APIendpoint_url = "";
                this.APIendpoint_urlBase = "";
            }
        }
        makeCacheableAPIendpoint_url() {
            // do not cache api/models/id!=undefined
            if (this.HttpContext.path.isAPI && this.HttpContext.path.id == undefined)
                return this.HttpContext.req.url;
            // not cacheable
            return "";
        }
        makeAPIendpoint_urlBase() {
            // defined querystring less api/models url
            return (this.HttpContext.path.isAPI ? "/api" : "") + "/" + this.HttpContext.path.model;
        }
        clearCache() {
            Cache.clear(this.APIendpoint_urlBase);
        }
        AddInCache(jsonObj, ETag) {
            Cache.add(this.APIendpoint_url, jsonObj, ETag);
        }
        status(number) {
            this.res.writeHead(number, { 'content-type': 'text/plain' });
            this.end();
        }
        end(content = null) {
            if (content)
                this.res.end(content);
            else
                this.res.end();
        }
        ok() {
            // ok status
            this.status(200);
            this.clearCache();
        }
        accepted() {
            // accepted status
            this.status(202);
            this.clearCache();
        }
        created(jsonObj) {
            this.res.writeHead(201, { 'content-type': 'application/json' });
            this.end(JSON.stringify(jsonObj));
            this.clearCache();
        }
        JSON(jsonObj, ETag = "", fromCache = false) {
            if (ETag != "")
                this.res.writeHead(200, { 'content-type': 'application/json', 'ETag': ETag });
            else
                this.res.writeHead(200, { 'content-type': 'application/json' });
            if (jsonObj != null) {
                if (!fromCache) // prevent from cache it again
                    this.AddInCache(jsonObj, ETag);
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
            this.clearCache();
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