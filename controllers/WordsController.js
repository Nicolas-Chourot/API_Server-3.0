const Repository = require('../models/repository');
const Word = require('../models/word');

module.exports =
    class WordsController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params);
            this.wordsRepository = new Repository('Words', true);
        }
        
        head() {
            this.response.ETag(this.wordsRepository.ETag);
        }
        // GET: api/words
        // GET: api/words?sort=key&key=value....
        // GET: api/words/{id}
        get(id) {
            if (this.params) {
                if (Object.keys(this.params).length > 0) {
                    this.response.JSON(this.wordsRepository.getAll(this.params),
                                       this.wordsRepository.ETag);
                } else {
                    this.queryStringHelp();
                }
            }
            else {
                if (!isNaN(id)) {
                    this.response.JSON(this.wordsRepository.get(id));
                }
                else {
                    this.response.JSON(this.wordsRepository.getAll(),
                                       this.wordsRepository.ETag);
                }
            }
        }
        // POST: api/words body payload[{"Id": ..., "Word": "...", "Definition": "..."}]
        post(word) {
            if (this.requestActionAuthorized()) {
                // validate word before insertion
                if (Word.valid(word)) {
                    // avoid duplicate names
                    if (this.wordsRepository.findByField('Word', word.Word) !== null) {
                        this.response.conflict();
                    } else {
                        let newWord = this.wordsRepository.add(word);
                        if (newWord)
                            this.response.created(newWord);
                        else
                            this.response.internalError();
                    }
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }
        // PUT: api/words body payload[{"Id":..., "Word": "...", "Definition": "..."}]
        put(word) {
            if (this.requestActionAuthorized()) {
                // validate word before updating
                if (Word.valid(word)) {
                    let foundWord = this.wordsRepository.findByField('Word', word.Word);
                    if (foundWord != null) {
                        if (foundWord.Id != word.Id) {
                            this.response.conflict();
                            return;
                        }
                    }
                    if (this.wordsRepository.update(word))
                        this.response.ok();
                    else
                        this.response.notFound();
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }
        // DELETE: api/words/{id}
        remove(id) {
            if (this.requestActionAuthorized()) {
                if (this.wordsRepository.remove(id))
                    this.response.accepted();
                else
                    this.response.notFound();
            } else
                this.response.unAuthorized();
        }
    }