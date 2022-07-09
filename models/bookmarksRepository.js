const BookmarkModel = require('./bookmark');
module.exports =
    class BookmarksRepository extends require('./repository') {
        constructor() {
            super(new BookmarkModel(), true /* cached */);
            const UsersRepository = require('./usersRepository');
            this.usersRepository =  new UsersRepository();
            this.setBindExtraDataMethod(this.resolveUserName);
        }

        resolveUserName(bookmark) {
            let user = this.usersRepository.get(bookmark.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            let bookmarkWithUsername = { ...bookmark };
            bookmarkWithUsername["Username"] = username;
            return bookmarkWithUsername;
        }
    }