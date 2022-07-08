const usersRepository = require('../models/usersRepository');
const ImagesRepository = require('../models/imagesRepository');
const TokenManager = require('../tokenManager');
const utilities = require("../utilities");
const User = require('../models/user');

module.exports =
    class AccountsController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.repository = new usersRepository();
            this.model = new User();
        }
        // list of users with masked password
        index(id) {
            if (!isNaN(id)) {
                let user = this.repository.get(id);
                if (user != null) {
                    let userClone = { ...user };
                    userClone.Password = "********";
                    this.response.JSON(userClone);
                }
            }
            else {
                let users = this.repository.getAll();
                let usersClone = users.map(user => ({ ...user }));
                for (let user of usersClone) {
                    user.Password = "********";
                }
                this.response.JSON(usersClone);
            }
        }
        // POST: /token body payload[{"Email": "...", "Password": "...", "grant-type":"password"}]
        login(loginInfo) {
            // to do assure that grant-type is present in the request header
            let user = this.repository.findByField("Email", loginInfo.Email);
            if (user != null) {
                if (user.Password == loginInfo.Password) {
                    let newToken = TokenManager.create(user);
                    this.response.JSON(newToken);
                } else
                    this.response.badRequest();
            } else
                this.response.badRequest();
        }
        logout(user) {
            if (this.requestActionAuthorized()) {
                TokenManager.logout(user.Id);
                this.response.accepted();
            }
            else
                this.response.unAuthorized();
        }
        // POST: account/register body payload[{"Id": 0, "Name": "...", "Email": "...", "Password": "..."}]
        register(user) {
            user.Created = utilities.nowInSeconds();
            let newUser = this.repository.add(user);
            if (newUser) {
                if (!newUser.conflict) {
                    // mask password in the json object response
                    newUser.Password = "********";
                    this.response.created(newUser);
                } else
                    this.response.conflict();
            } else
                this.response.unprocessable();
        }
        modify(user) {
            user.Created = utilities.nowInSeconds();
            this.put(user);
            let imagesRepository = new ImagesRepository();
            imagesRepository.newETag();
        }
        remove(id){
            super.remove(id);
        }
    }