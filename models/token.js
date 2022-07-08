const Model = require('./Model');
module.exports =
    class Token extends Model {
        constructor(user = null) {
            super();
            if (user) {
                this.Id = 0;
                this.Access_token = makeToken(user.Email);
                this.UserId = user.Id;
                this.Username = user.Name;
            }
        }
    }

function makeToken(text) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    function encrypt(text) {
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex')
        };
    }
    return encrypt(text).encryptedData;
}
