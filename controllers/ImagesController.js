const ImagesRepository = require('../models/imagesRepository');
module.exports = 
class ImagesController extends require('./Controller') {
    constructor(req, res, params){
        super(req, res, params);
        this.repository = new ImagesRepository();
    }
}