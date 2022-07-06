module.exports = 
class Bookmark{
    constructor(name, url, category, userId)
    {
        this.Id = 0;
        this.Name = name !== undefined ? name : "";
        this.Url = url !== undefined ? url : "";
        this.Category = category !== undefined ? category : "";
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Name','string');
        validator.addField('Url','url');
        validator.addField('Category','string');
        return validator.test(instance);
    }
}