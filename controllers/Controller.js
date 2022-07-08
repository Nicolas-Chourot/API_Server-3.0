const Response = require('../response');
const TokenManager = require('../tokenManager');
/////////////////////////////////////////////////////////////////////
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
// in order to have proper routing from request to controller action
/////////////////////////////////////////////////////////////////////
module.exports =
    class Controller {
        constructor(req, res, params) {
            if (req != null && res != null) {
                this.req = req;
                this.res = res;
                this.response = new Response(res, this.req.url);
                this.params = params;
                // if true, will require a valid bearer token from request header
                this.needReadAuthorization = false;
                this.needWriteAuthorization = true;
                this.repository = null;
                this.model = null;
            }
        }
        readAuthorization() {
            if (this.needReadAuthorization) {
                if (TokenManager.requestAuthorized(this.req))
                    return true;
                else {
                    this.response.unAuthorized();
                    return false;
                }
            }
            return true;
        }
        writeAuthorization() {
            if (this.needWriteAuthorization) {
                if (TokenManager.requestAuthorized(this.req))
                    return true;
                else {
                    this.response.unAuthorized();
                    return false;
                }
            }
            return true;
        }

        requestActionAuthorized() {
            return TokenManager.requestAuthorized(this.req);
        }
        queryStringParamsList() {
            let content = "<div style=font-family:arial>";
            content += "<h4>List of parameters in query strings:</h4>";
            content += "<h4>? sort=key <br> return all words sorted by key values (word)";
            content += "<h4>? sort=key,desc <br> return all words sorted by descending key values";
            content += "<h4>? key=value <br> return the word with key value = value";
            content += "<h4>? key=value* <br> return the word with key value that start with value";
            content += "<h4>? key=*value* <br> return the word with key value that contains value";
            content += "<h4>? key=*value <br> return the word with key value end with value";
            content += "<h4>page?limit=int&offset=int <br> return limit words of page offset";
            content += "</div>";
            return content;
        }
        queryStringHelp() {
            // expose all the possible query strings
            this.res.writeHead(200, { 'content-type': 'text/html' });
            this.res.end(this.queryStringParamsList());
        }
        paramsError(params, message) {
            if (params) {
                params["error"] = message;
                this.response.JSON(params);
            } else {
                this.response.JSON(message);
            }
            return false;
        }
        head() {
            if (this.repository != null) {
                this.response.JSON(null, this.repository.ETag);
            } else
                this.response.notImplemented();
        }

        get(id) {
            if (this.repository != null) {
                if (this.readAuthorization()) {
                    // if we have no parameter, expose the list of possible query strings
                    if (this.params === null) {
                        if (!isNaN(id)) {
                            let data = this.repository.get(id);
                            if (data != null)
                                this.response.JSON(data);
                            else
                                this.response.notFound();
                        }
                        else
                            this.response.JSON(this.repository.getAll(),
                                this.repository.ETag);
                    }
                    else {
                        if (Object.keys(this.params).length === 0) /* ? only */ {
                            this.queryStringHelp();
                        } else {
                            this.response.JSON(this.repository.getAll(this.params), this.repository.ETag);
                        }
                    }
                } else
                    this.response.unAuthorized();
            } else
                this.response.notImplemented();
        }
        post(data) {
            if (this.repository != null) {
                if (this.writeAuthorization()) {
                    data = this.repository.add(data);
                    if (data) {
                        if (data.error == "conflict")
                            this.response.conflict();
                        else
                            this.response.created(data);
                    }
                    else
                        this.response.unprocessable();
                } else
                    this.response.unAuthorized();
            } else
                this.response.notImplemented();
        }
        put(data) {
            if (this.repository != null) {
                if (this.writeAuthorization()) {
                    if (this.repository.update(data) == "ok")
                        this.response.ok();
                    else
                        if (this.repository.update(data) == "conflict")
                            this.response.conflict();
                        else
                            this.response.unprocessable();
                } else
                    this.response.unAuthorized();
            } else
                this.response.notImplemented();
        }
        remove(id) {
            if (this.repository != null) {
                if (this.writeAuthorization()) {
                    if (this.repository.remove(id))
                        this.response.accepted();
                    else
                        this.response.notFound();
                } else
                    this.response.unAuthorized(); F
            } else
                this.response.notImplemented();
        }
    }
