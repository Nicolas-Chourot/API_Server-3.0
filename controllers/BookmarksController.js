const BookmarksRepository = require('../models/bookmarksRepository');
module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(HttpContext) {
            super(HttpContext, new BookmarksRepository());
        }
    }