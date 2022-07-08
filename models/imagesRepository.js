
const Repository = require('./repository');
const usersRepository = require('./usersRepository');

const ImageFilesRepository = require('./imageFilesRepository.js');
const Image = require('./image.js');
const utilities = require("../utilities");
var host = require('../APIServer').getHttpContext().host;

module.exports =
    class ImagesRepository extends Repository {
        constructor() {
            super(new Image(), true /* cached */);
            this.usersRepository = new usersRepository();
            this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
        }
        bindUsernameAndImageURL(image) {
            if (image) {
                let user = this.usersRepository.get(image.UserId);
                let username = "unknown";
                if (user)
                    username = user.Name;
                let bindedImage = { ...image };
                bindedImage["Username"] = username;
                bindedImage["Date"] = utilities.secondsToDateString(image["Created"]);
                if (image["GUID"] != "") {
                    bindedImage["OriginalURL"] = "http://" + host + ImageFilesRepository.getImageFileURL(image["GUID"]);
                    bindedImage["ThumbnailURL"] = "http://" + host + ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
                } else {
                    bindedImage["OriginalURL"] = "";
                    bindedImage["ThumbnailURL"] = "";
                }
                return bindedImage;
            }
            return null;
        }
        add(image) {
            if (this.model.valid(image)) {
                image["Created"] = utilities.nowInSeconds();
                image["GUID"] = ImageFilesRepository.storeImageData("", image["ImageData"]);
                delete image["ImageData"];
                return this.bindUsernameAndImageURL(super.add(image));
            }
            return null;
        }
        update(image) {
            if (this.model.valid(image)) {
                image["Created"] = utilities.nowInSeconds();
                image["GUID"] = ImageFilesRepository.storeImageData(image["GUID"], image["ImageData"]);
                delete image["ImageData"];
                return super.update(image);
            }
            return false;
        }
        remove(id) {
            let foundImage = super.get(id);
            if (foundImage) {
                ImageFilesRepository.removeImageFile(foundImage["GUID"]);
                return super.remove(id);
            }
            return false;
        }
    }