const usersRepository = require('../models/usersRepository');
const ImagesRepository = require('../models/imagesRepository');
const TokenManager = require('../tokenManager');
const utilities = require("../utilities");

module.exports =
    class AccountsController extends require('./Controller') {
        constructor(HttpContext) {
            super(HttpContext, new usersRepository());
        }
        // list of users with masked password
        index(id) {
            if (!isNaN(id)) {
                let user = this.repository.get(id);
                if (user != null) {
                    let userClone = { ...user };
                    userClone.Password = "********";
                    this.HttpContext.response.JSON(userClone);
                }
            }
            else {
                let users = this.repository.getAll();
                let usersClone = users.map(user => ({ ...user }));
                for (let user of usersClone) {
                    user.Password = "********";
                }
                this.HttpContext.response.JSON(usersClone);
            }
        }
        // POST: /token body payload[{"Email": "...", "Password": "...", "grant-type":"password"}]
        login(loginInfo) {
            // to do assure that grant-type is present in the request header
            let user = this.repository.findByField("Email", loginInfo.Email);
            if (user != null) {
                if (user.Password == loginInfo.Password) {
                    let newToken = TokenManager.create(user);
                    this.HttpContext.response.JSON(newToken);
                } else
                    this.HttpContext.response.badRequest();
            } else
                this.HttpContext.response.badRequest();
        }
        logout(user) {
            if (this.requestActionAuthorized()) {
                TokenManager.logout(user.Id);
                this.HttpContext.response.accepted();
            }
            else
                this.HttpContext.response.unAuthorized();
        }
        // POST: account/register body payload[{"Id": 0, "Name": "...", "Email": "...", "Password": "..."}]
        register(user) {
            user.Created = utilities.nowInSeconds();
            let newUser = this.repository.add(user);
            if (newUser) {
                if (!newUser.conflict) {
                    // mask password in the json object response
                    newUser.Password = "********";
                    this.HttpContext.response.created(newUser);
                } else
                    this.HttpContext.response.conflict();
            } else
                this.HttpContext.response.unprocessable();
        }
        // POST:account/modify body payload[{"Id": 0, "Name": "...", "Email": "...", "Password": "..."}]
        modify(user) {
            user.Created = utilities.nowInSeconds();
            let foundedUser = this.repository.findByField("Id", user.Id);
            if (user.Password == '') {
                user.Password = foundedUser.Password;
            }
            super.put(user);
            let imagesRepository = new ImagesRepository();
            imagesRepository.newETag();
        }
        // GET:account/remove/id
        remove(id) { // warning! this is not an API endpoint
            super.remove(id);
        }
    }