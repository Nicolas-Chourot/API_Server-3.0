const Repository = require('./repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const User = require('./user.js');
const utilities = require("../utilities");
module.exports = 
class UsersRepository extends Repository {
    constructor(req){
        super(new User(), true);
        this.req = req;
    }
    bindAvatarURL(user){
        if (user) {
            let bindedUser = {...user};
            if (user["AvatarGUID"] != ""){
                bindedUser["AvatarURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
            } else {
                bindedUser["AvatarURL"] = "";
            }
            return bindedUser;
        }
        return null;
    }
    bindAvatarURLS(images){
        let bindedUsers = [];
        for(let image of images) {
            bindedUsers.push(this.bindAvatarURL(image));
        };
        return bindedUsers;
    }
    get(id) {
        return this.bindAvatarURL(super.get(id));
    }
    getAll() {
        return this.bindAvatarURLS(super.getAll());
    }
    add(user) {
        user["Created"] = utilities.nowInSeconds();
        if (this.model.valid(user)) {
            user["AvatarGUID"] = ImageFilesRepository.storeImageData("", user["ImageData"]);
            delete user["ImageData"];
            return this.bindAvatarURL(super.add(user));
        }
        return null;
    }
    update(user) {
        if (this.model.valid(user)) {
            let foundUser = super.get(user.Id);
            if (foundUser) {
                user["Created"] = foundUser["Created"];
                user["AvatarGUID"] = ImageFilesRepository.storeImageData(user["AvatarGUID"], user["ImageData"]);
                delete user["ImageData"];
                
                return super.update(user);
            }
        }
        return false;
    }
    remove(id){
        let foundUser = super.get(id);
        if (foundUser) {
            ImageFilesRepository.removeImageFile(foundUser["AvatarGUID"]);
            return super.remove(id);
        }
        return false;
    }
}