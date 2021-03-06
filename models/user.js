const Model = require('./model');
module.exports = 
class User extends Model{
    constructor(name, email, password, avatarGUID)
    {
        super();
        this.Name = name !== undefined ? name : "";
        this.Email = email !== undefined ? email : "";
        this.Password = password !== undefined ? password : "";
        this.Created = 0;
        this.AvatarGUID = avatarGUID !== undefined ? avatarGUID : "";
        this.key = "Email";

        this.addValidator('Name','string');
        this.addValidator('Email','email');
        this.addValidator('Created','integer');
    }
}