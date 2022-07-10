const ImageFilesRepository = require('./imageFilesRepository.js');
const UserModel = require('./user.js');
const Cache = require('../getRequestsCacheManager');
const utilities = require("../utilities");
const HttpContext = require('../httpContext').get();

module.exports = 
class UsersRepository extends require('./repository') {
    constructor(){
        super(new UserModel(), true);
    }
    bindAvatarURL(user){
        if (user) {
            let bindedUser = {...user};
            bindedUser.Password = "********";
            if (user["AvatarGUID"] != ""){
                bindedUser["AvatarURL"] = HttpContext.host + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
            } else {
                bindedUser["AvatarURL"] = "";
            }
            return bindedUser;
        }
        return null;
    }
    bindAvatarURLS(users){
        let bindedUsers = [];
        for(let user of users) {
            bindedUsers.push(this.bindAvatarURL(user));
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
    
    deleteAllUsersBookmarks(userId) {
        const BookmarksRepository = require('./bookmarksRepository.js');
        let bookmarksRepository = new BookmarksRepository(bookmarkModel, true);
        let bookmarks = bookmarksRepository.getAll();
        let indexToDelete = [];
        let index = 0;
        for (let bookmark of bookmarks) {
            if (bookmark.UserId == userId)
                indexToDelete.push(index);
            index++;
        }
        bookmarksRepository.removeByIndex(indexToDelete);
        Cache.clear('bookmarks');
    }
    deleteAllUsersImages(userId) {
        const ImagesRepository = require('./imagesRepository.js');
        let imagesRepository = new ImagesRepository();
        let images = imagesRepository.getAll();
        let indexToDelete = [];
        let index = 0;
        for (let image of images) {
            if (image.UserId == userId)
                indexToDelete.push(index);
            index++;
        }
        imagesRepository.removeByIndex(indexToDelete);
        Cache.clear('images');
    }

    remove(id){
        let foundUser = super.get(id);
        if (foundUser) {
            ImageFilesRepository.removeImageFile(foundUser["AvatarGUID"]);
            this.deleteAllUsersBookmarks(id);
            this.deleteAllUsersImages(id);
            return super.remove(id);
        }
        return false;
    }
}