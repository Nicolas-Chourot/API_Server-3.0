const Repository = require('../models/repository');
const contactModel = require('../models/contact');

module.exports =
    class ContactsController extends require('./Controller') {
        constructor(HttpContext) {
            super(HttpContext, new Repository(new contactModel()), false, false);
        }
    }