module.exports =
    class MiddlewaresPipeline {
        constructor() {
            this.middlewares = [];
        }

        add(middleware) {
            this.middlewares.push(middleware);
        }

        async handleHttpRequest(req, res) {
            for (let middleware of this.middlewares) {
                if (await(middleware(req, res))) return true;
            }
            return false;
        }
    }