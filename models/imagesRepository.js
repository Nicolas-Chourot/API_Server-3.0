const Repository = require('./repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const Image = require('./image.js');
const utilities = require("../utilities");
const User = require('./user');
module.exports = 
class ImagesRepository extends Repository {
    constructor(req){
        super(new Image(), true);
        this.users = new Repository(new User());
        this.req = req;
        this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
    }
    bindUsernameAndImageURL(image){
        if (image) {
            let user = this.users.get(image.UserId);
            let username = "unknown";
            if (user)
                username = user.Name;
            let bindedImage = {...image};
            bindedImage["Username"] = username;
            bindedImage["Date"] = utilities.secondsToDateString(image["Created"]);
            if (image["GUID"] != ""){
                bindedImage["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(image["GUID"]);
                bindedImage["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
            } else {
                bindedImage["OriginalURL"] = "";
                bindedImage["ThumbnailURL"] = "";
            }
            return bindedImage;
        }
        return null;
    }
    add(image) {
        image["Created"] = utilities.nowInSeconds();
        let imageData = image["ImageData"];
        delete image["ImageData"];
        let newImage = super.add(image);
        if (!newImage.error) {
            image["GUID"] = ImageFilesRepository.storeImageData("", imageData);
        }
        return newImage;
    } 
    update(image) {
        image["Created"] = utilities.nowInSeconds();
        let imageData = image["ImageData"];
        delete image["ImageData"];
        let result = super.update(image);
        if (result == "ok") {
            image["GUID"] = ImageFilesRepository.storeImageData(image["GUID"], imageData);
        }
        return result;
    }
    remove(id){
        let foundImage = super.get(id);
        if (foundImage) {
            ImageFilesRepository.removeImageFile(foundImage["GUID"]);
            return super.remove(id);
        }
        return false;
    }
}