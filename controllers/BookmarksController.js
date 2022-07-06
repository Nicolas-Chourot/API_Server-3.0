const Repository = require('../models/repository');
const Bookmark = require('../models/bookmark');

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params, false /* needAuthorization */);
            this.bookmarksRepository = new Repository('Bookmarks', true /* cached */);
            this.bookmarksRepository.setBindExtraDataMethod(this.resolveUserName);
        }
        
        resolveUserName(bookmark) {
            let users = new Repository('Users'); 
            let user = users.get(bookmark.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            let bookmarkWithUsername = { ...bookmark };
            bookmarkWithUsername["Username"] = username;
            return bookmarkWithUsername;
        }

        head() {
            console.log("Bookmarks ETag request:", this.bookmarksRepository.ETag);
            this.response.ETag(this.bookmarksRepository.ETag);
        }

        // GET: api/bookmarks
        // GET: api/bookmarks?sort=key&key=value....
        // GET: api/bookmarks/{id}
        get(id) {
            if (this.params) {
                if (Object.keys(this.params).length > 0) {
                    this.response.JSON(this.bookmarksRepository.getAll(this.params), this.bookmarksRepository.ETag);
                } else {
                    this.queryStringHelp();
                }
            }
            else {
                if (!isNaN(id)) {
                    this.response.JSON(this.bookmarksRepository.get(id));
                }
                else {
                    this.response.JSON(this.bookmarksRepository.getAll(), this.bookmarksRepository.ETag);
                }
            }
        }
        post(bookmark) {
            if (this.requestActionAuthorized()) {
                // validate bookmark before insertion
                if (Bookmark.valid(bookmark)) {
                    // avoid duplicate names
                    if (this.bookmarksRepository.findByField('Name', bookmark.Name) !== null) {
                        this.response.conflict();
                    } else {
                        let newBookmark = this.bookmarksRepository.add(bookmark);
                        if (newBookmark)
                            this.response.created(newBookmark);
                        else
                            this.response.internalError();
                    }
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }
        // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "...", "UserId": ..}]
        put(bookmark) {
            if (this.requestActionAuthorized()) {
                // validate bookmark before updating
                if (Bookmark.valid(bookmark)) {
                    let foundBookmark = this.bookmarksRepository.findByField('Name', bookmark.Name);
                    if (foundBookmark != null) {
                        if (foundBookmark.Id != bookmark.Id) {
                            this.response.conflict();
                            return;
                        }
                    }
                    if (this.bookmarksRepository.update(bookmark))
                        this.response.ok();
                    else
                        this.response.notFound();
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }
        // DELETE: api/bookmarks/{id}
        remove(id) {
            if (this.requestActionAuthorized()) {
                if (this.bookmarksRepository.remove(id))
                    this.response.accepted();
                else
                    this.response.notFound();
            } else
                this.response.unAuthorized();
        }
    }