const Repository = require('../models/repository');
const WordModel = require('../models/word');

module.exports =
    class WordsController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params);
            this.repository = new Repository(new WordModel(), true);
            this.wordsRepository = this.repository;
        }
    }