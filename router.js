const utilities = require('./utilities.js');
var clc = require("cli-color");

const Response = require('./response.js');

function isJSONContent(req, res) {
    if (req.headers['content-type'] !== "application/json") {
        let response = new Response(res);
        response.unsupported();
        return false;
    }
    return true;
}
function getJSONBody(req) {
    return new Promise((resolve) => {
        let body = [];
        req.on('data', chunk => {
            body.push(chunk);
        }).on('end', () => {
            resolve(JSON.parse(body));
        });
    })
}
function makeControllerName(modelName) {
    if (modelName != undefined)
        // by convention controller name -> NameController
        return utilities.capitalizeFirstLetter(modelName) + 'Controller';
    return undefined;
}

exports.Cached_EndPoint = function (req, res) {
    return new Promise(async (resolve) => {
        if (req.method == 'GET') {
            const Cache = require('./getRequestsCacheManager');
            let cacheFound = Cache.find(req.url);
            if (cacheFound != null) {
                res.writeHead(200, { 'content-type': 'application/json', 'ETag': cacheFound.ETag });
                res.end(cacheFound.content);
                resolve(true);
            }
        }
        resolve(false);
    });
}
exports.TOKEN_EndPoint = function (req, res) {
    return new Promise(async (resolve) => {
        let url = utilities.removeQueryString(req.url);
        if (url == '/token' && req.method == "POST") {
            try {
                const AccountsController = require('./controllers/AccountsController');
                let accountsController = new AccountsController(req, res);
                if (isJSONContent(req, res)) {
                    let JSONBody = await getJSONBody(req);
                    accountsController.login(JSONBody);
                }
                resolve(true);
            } catch (error) {
                console.log(clc.redBright('AccountsController is missing'));
                console.log(clc.redBright('-----------------------------'));
                console.log((clc.red(error)));
                let response = new Response(res);
                response.notFound();
                resolve(true);
            }
        }
        // request not consumed
        // must be handled by another middleware
        resolve(false);
    });
}

// {method, ControllerName, Action}
exports.Registered_EndPoint = function (req, res) {
    return new Promise(async (resolve) => {
        const RouteRegister = require('./routeRegister');
        let response = new Response(res);
        let route = RouteRegister.find(req);
        if (route != null) {
            try {
                // dynamically import the targeted controller
                // if it does not exist the catch section will be called
                let controllerName = makeControllerName(route.modelName);
                const Controller = require('./controllers/' + makeControllerName(route.modelName));
                // instanciate the controller       
                let controller = new Controller(req, res);

                if (route.method === 'POST' || route.method === 'PUT') {
                    if (isJSONContent(req, res)) {
                        let JSONBody = await getJSONBody(req);
                        controller[route.actionName](JSONBody);
                    }
                }
                else {
                    controller[route.actionName](route.id);
                }
                resolve(true);
            } catch (error) {
                // catch likely called because of missing controller class
                // i.e. require('./' + controllerName) failed
                // but also any unhandled error...
                console.log(clc.redBright('endpoint not found'));
                console.log(clc.redBright('------------------'));
                console.log((clc.red(error)));
                response.notFound();
                resolve(true);
            }
        } else
        // not an registered endpoint
        // request not consumed
        // must be handled by another middleware
        resolve(false);
    });
}

//////////////////////////////////////////////////////////////////////
// dispatch_API_EndPoint middleware
// parse the req.url that must have the following format:
// /api/{ressource name} or
// /api/{ressource name}/{id}
// then select the targeted controller
// using the http verb (req.method) and optionnal id
// call the right controller function (action)
// warning: this function does not handle sub resource
// of like the following : api/resource/id/subresource/id?....
//
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
/////////////////////////////////////////////////////////////////////
exports.API_EndPoint = function (req, res) {
    return new Promise(async (resolve) => {
        let exit = false;
        if (req.url == "/api") {
            const Endpoints = require('./endpoints');
            Endpoints.list(res);
            // request consumed
            resolve(true);
            exit = true;
        }

        if (!exit) {
            let path = utilities.decomposePath(req.url);

            if (!path.isAPI) {
                resolve(false);
            } else {

                let controllerName = makeControllerName(path.model);
                let id = path.id;

                if (controllerName != undefined) {
                    let response = new Response(res);
                    try {
                        // dynamically import the targeted controller
                        // if the controllerName does not exist the catch section will be called
                        const Controller = require('./controllers/' + controllerName);
                        // instanciate the controller       
                        let controller = new Controller(req, res, path.params);


                        switch (req.method) {
                            case 'HEAD':
                                controller.head();
                                resolve(true);
                                break;
                            case 'GET':
                                controller.get(id);
                                resolve(true);
                                break;
                            case 'POST':
                                if (isJSONContent(req, res)) {
                                    let JSONBody = await getJSONBody(req);
                                    controller.post(JSONBody);
                                }
                                resolve(true);
                                break;
                            case 'PUT':
                                if (isJSONContent(req, res)) {
                                    let JSONBody = await getJSONBody(req);
                                    controller.put(JSONBody);
                                }
                                resolve(true);
                                break;
                            case 'DELETE':
                                controller.remove(id);
                                resolve(true);
                                break;
                            default:
                                response.notImplemented();
                                resolve(true);
                                break;
                        }
                    } catch (error) {
                        // catch likely called because of missing controller class
                        // i.e. require('./' + controllerName) failed
                        // but also any unhandled error...
                        console.log(clc.redBright('endpoint not found'));
                        console.log(clc.redBright('------------------'));
                        console.log((clc.red(error)));
                        response.notFound();
                        resolve(true);
                    }
                } else {
                    // not an API endpoint
                    // must be handled by another middleware
                    resolve(false);
                }
            }
        }
    });
}
