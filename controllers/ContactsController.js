const ContactModel = require('../models/contact');
const Sqlite_db = require('../models/sqlite_db');
const getRequestCache = require('../getRequestsCacheManager');

module.exports =
    class ContactsController extends require('./Controller') {
        constructor(HttpContext) {
            //super(HttpContext, new Repository(new contactModel()), false, false);
            super(HttpContext, null, false, false);
            this.contactModel = new ContactModel();
        } 
        clearCache() {
            getRequestCache.clear(this.contactModel.getClassName() + 's');
        }
        async get(id) {
            let rows = await Sqlite_db.get(this.contactModel, id);
            this.HttpContext.response.JSON(rows);
        }

        async post(contact) {
            if (this.contactModel.valid(contact)) {
                console.log(contact);
                this.clearCache();
                let newContact = await Sqlite_db.insert(this.contactModel, contact);
                this.HttpContext.response.created(newContact);
            } else
                this.HttpContext.response.unprocessable();
        }
        async put(contact) {
            if (this.contactModel.valid(contact)) {
                console.log(contact);
                this.clearCache();
                let newContact = await Sqlite_db.update(this.contactModel, contact);
                this.HttpContext.response.created(newContact);
            } else
                this.HttpContext.response.unprocessable();
        }
        async remove(id) {
            if (await Sqlite_db.delete(this.contactModel, id)) {
                this.HttpContext.response.accepted();
                this.clearCache();
            }
            else
                this.HttpContext.response.notFound();
        }
    }