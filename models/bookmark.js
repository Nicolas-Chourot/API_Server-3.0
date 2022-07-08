const Model = require('./Model');
module.exports = 
class Bookmark extends Model{
    constructor(name, url, category, userId)
    {
        super();
        this.Name = name !== undefined ? name : "";
        this.Url = url !== undefined ? url : "";
        this.Category = category !== undefined ? category : "";

        this.setKey("Name");
        this.addValidator('Id','integer');
        this.addValidator('Name','string');
        this.addValidator('Url','url');
        this.addValidator('Category','string');
    }
}