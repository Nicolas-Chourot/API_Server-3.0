module.exports =
    class Model {
        constructor() {
            this.Id = 0;
            const Validator = require('./validator');
            this.validator = new Validator();
            this.addValidator('Id','integer');
            this.key = null;
        }
        setKey(key){
            this.key = key;
        }
        getClassName() {
            return this.constructor.name;
        }
        addValidator(propertyName, porpertyType){
            this.validator.addField(propertyName, porpertyType);
        }
        valid(instance) {
            return this.validator.test(instance);
        }
    }