const utilities = require('./utilities.js');
const Response = require('./response');
let httpContextSingleton = null;

module.exports =
    class HttpContext {
        constructor(req, res) {
            this.req = req;
            this.res = res;
            this.path = utilities.decomposePath(req.url);
            this.params = this.path.params;
            this.response = new Response(req, res);
            this.secure = req.headers['x-forwarded-proto'] != undefined;
            this.host = (this.secure ? "https://" : "http://") + req.headers["host"];
            this.payload = null;
            httpContextSingleton = this;
        }
        static get() { return httpContextSingleton; }

        isJSONContent() {
            if (this.req.headers['content-type'] !== "application/json") {
                this.response.unsupported();
                return false;
            }
            return true;
        }
        getJSONPayload() {
            return new Promise((resolve) => {
                if (this.req.headers['content-type'] == "application/json") {
                    let body = [];
                    this.req.on('data', chunk => {
                        body.push(chunk);
                    }).on('end', () => {
                        this.payload = JSON.parse(body);
                        resolve(this.payload);
                    });
                    this.payload = null;
                } else resolve(null);
            })
        }
    }