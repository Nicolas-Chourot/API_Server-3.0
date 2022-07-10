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
        constructor(HttpContext, repository, needReadAuthorization = false, needWriteAuthorization = true) {
            // if true, will require a valid bearer token from request header
            this.needReadAuthorization = needReadAuthorization;
            this.needWriteAuthorization = needWriteAuthorization;
            this.repository = repository;
            this.HttpContext = HttpContext;
        }
        readAuthorization() {
            if (this.needReadAuthorization) {
                if (TokenManager.requestAuthorized(this.HttpContext.req))
                    return true;
                else {
                    this.HttpContext.response.unAuthorized();
                    return false;
                }
            }
            return true;
        }
        writeAuthorization() {
            if (this.needWriteAuthorization) {
                if (TokenManager.requestAuthorized(this.HttpContext.req))
                    return true;
                else {
                    this.HttpContext.response.unAuthorized();
                    return false;
                }
            }
            return true;
        }

        requestActionAuthorized() {
            return TokenManager.requestAuthorized(this.HttpContext.req);
        }
        queryStringParamsList() {
            let content = "<div style=font-family:arial>";
            content += "<h4>List of parameters in query strings:</h4>";
            content += "<h4>? sort=key <br> return all words sorted by key values (word)</h4>";
            content += "<h4>? sort=key,desc <br> return all words sorted by descending key values</h4>";
            content += "<h4>? key=value <br> return the word with key value = value</h4>";
            content += "<h4>? key=value* <br> return the word with key value that start with value</h4>";
            content += "<h4>? key=*value* <br> return the word with key value that contains value</h4>";
            content += "<h4>? key=*value <br> return the word with key value end with value</h4>";
            content += "<h4>page?limit=int&offset=int <br> return limit words of page offset</h4>";
            content += "</div>";
            return content;
        }
        queryStringHelp() {
            // expose all the possible query strings
            this.HttpContext.response.HTML(this.queryStringParamsList());
        }
        paramsError(params, message) {
            if (params) {
                params["error"] = message;
                this.HttpContext.response.JSON(params);
            } else {
                this.HttpContext.response.JSON(message);
            }
            return false;
        }
        head() {
            if (this.repository != null) {
                this.HttpContext.response.JSON(null, this.repository.ETag);
            } else
                this.HttpContext.response.notImplemented();
        }

        get(id) {
            if (this.repository != null) {
                if (this.readAuthorization()) {
                    if (this.HttpContext.params === null) {
                        if (!isNaN(id)) {
                            let data = this.repository.get(id);
                            if (data != null)
                                this.HttpContext.response.JSON(data);
                            else
                                this.HttpContext.response.notFound();
                        }
                        else
                            this.HttpContext.response.JSON(this.repository.getAll(),
                                this.repository.ETag);
                    }
                    else {
                        if (Object.keys(this.HttpContext.params).length === 0) /* ? only */ {
                            this.queryStringHelp();
                        } else {
                            this.HttpContext.response.JSON(this.repository.getAll(this.HttpContext.params), this.repository.ETag);
                        }
                    }
                } else
                    this.HttpContext.response.unAuthorized();
            } else
                this.HttpContext.response.notImplemented();
        }
        post(data) {
            if (this.repository != null) {
                if (this.writeAuthorization()) {
                    data = this.repository.add(data);
                    if (data) {
                        if (data.conflict)
                            this.HttpContext.response.conflict();
                        else
                            this.HttpContext.response.created(data);
                    } else
                        this.HttpContext.response.unprocessable();
                } else
                    this.HttpContext.response.unAuthorized();
            } else
                this.HttpContext.response.notImplemented();
        }
        put(data) {
            if (this.repository != null) {
                if (this.writeAuthorization()) {
                    let result = this.repository.update(data);
                    if (result == "ok")
                        this.HttpContext.response.ok();
                    else
                        if (result == "conflict")
                            this.HttpContext.response.conflict();
                        else
                            if (result == "not found")
                                this.HttpContext.response.notFound();
                            else // invalid
                                this.HttpContext.response.unprocessable();
                } else
                    this.HttpContext.response.unAuthorized();
            } else
                this.HttpContext.response.notImplemented();
        }
        remove(id) {
            if (this.repository != null) {
                if (this.writeAuthorization()) {
                    if (this.repository.remove(id))
                        this.HttpContext.response.accepted();
                    else
                        this.HttpContext.response.notFound();
                } else
                    this.HttpContext.response.unAuthorized();
            } else
                this.HttpContext.response.notImplemented();
        }
    }
