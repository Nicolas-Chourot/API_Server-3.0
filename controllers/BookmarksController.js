const BookmarksRepository = require('../models/bookmarksRepository');
module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params);
            this.repository = new BookmarksRepository();
            this.needWriteAuthorization = false;
        }
    }