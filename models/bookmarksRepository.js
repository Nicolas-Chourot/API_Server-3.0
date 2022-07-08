const BookmarkModel = require('./bookmark');
module.exports =
    class BookmarksRepository extends require('./repository') {
        constructor() {
            super(new BookmarkModel(), true /* cached */);
            this.setBindExtraDataMethod(this.resolveUserName);
        }

        resolveUserName(bookmark) {
            const UsersRepository = require('./usersRepository');
            let users = new UsersRepository(); 
            let user = users.get(bookmark.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            let bookmarkWithUsername = { ...bookmark };
            bookmarkWithUsername["Username"] = username;
            return bookmarkWithUsername;
        }
    }