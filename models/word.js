const Model = require('./model');
module.exports = 
class Word extends Model{
    constructor(word, definition)
    {
        super();
        this.Word = word !== undefined ? word : "";
        this.Definition = definition !== undefined ? definition : "";

        this.addValidator('Word','string');
        this.addValidator('Definition','string');
    }
}