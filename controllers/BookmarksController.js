const Repository = require('../models/repository');
const Bookmark = require('../models/bookmark');
const User = require('../models/user');
module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params);
            this.repository = new Repository(new Bookmark(), true /* cached */);
            this.repository.setBindExtraDataMethod(this.resolveUserName);
            this.needWriteAuthorization = false;
        }
        
        resolveUserName(bookmark) {
            let users = new Repository(new User()); 
            let user = users.get(bookmark.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            let bookmarkWithUsername = { ...bookmark };
            bookmarkWithUsername["Username"] = username;
            return bookmarkWithUsername;
        }
    }