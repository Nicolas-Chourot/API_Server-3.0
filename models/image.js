const Model = require('./Model');
module.exports = 
class Image extends Model{
    constructor(title, description, created, userId, shared, GUID)
    {
        super();
        this.Title = title !== undefined ? title : "";
        this.Description = description !== undefined ? description : "";
        this.Created = created !== undefined ? created : 0;
        this.UserId = userId !== undefined ? userId : 0;
        this.Shared = shared !== undefined ? shared : false;
        this.GUID = GUID !== undefined ? GUID : "";

        this.addValidator('Title','string');
        this.addValidator('Description','string');
        this.addValidator('UserId', 'integer');
        this.addValidator('Shared','boolean');
        this.addValidator('Created','integer');
    }
}