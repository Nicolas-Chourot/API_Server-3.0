function factorial(n){
    if(n===0||n===1){
      return 1;
    }
    return n*factorial(n-1);
}
function isPrime(value) {
    for(var i = 2; i < value; i++) {
        if(value % i === 0) {
            return false;
        }
    }
    return value > 1;
}
function findPrime(n){
    let primeNumer = 0;
    for ( let i=0; i < n; i++){
        primeNumer++;
        while (!isPrime(primeNumer)){
            primeNumer++;
        }
    }
    return primeNumer;
}
module.exports = 
class MathsController extends require('./Controller') {
    constructor(HttpContext) {
        super(HttpContext);
    }
    error(params, message){
        params["error"] = message;
        this.HttpContext.response.JSON(params);
        return false;
    }
    result(params, value){
        if (value === Infinity) value = "Infinity";
        if (isNaN(value)) value = "NaN";
        params["value"] = value;
        this.HttpContext.response.JSON(params);
    }
    checkParams(params){
        if ('op' in params) {
            if (params.op === ' ')
                params.op = '+';
            switch (params.op){
                case '+': // add operation             
                case '-': // substract operation
                case '*': // multiply operation
                case '/': // divide operation
                case '%': // modulo operation
                    if ('x' in params) {
                        if (!isNaN(parseFloat(params.x))) {
                            if ('y' in params) {
                                if (!isNaN(parseFloat(params.y))) {
                                    if (Object.keys(params).length > 3) {
                                        return this.error(params, "too many parameters");
                                    }
                                } else {
                                    return this.error(params, "'y' parameter is not a number");
                                }
                            } else {
                                return this.error(params, "'y' parameter is missing");
                            }
                        } else {
                            return this.error(params, "'x' parameter is not a number");
                        }
                    } else {
                        return this.error(params, "'x' parameter is missing");
                    }
                    break;
                case '!': // factorial operation
                case 'p': // is prime number operation
                case 'np': // find nth prime number operation
                    if ('n' in params){
                        let n = parseFloat(params.n);
                        if (!isNaN(n)) {
                            if (n > 0) {
                                if (Object.keys(params).length > 2) {
                                    return this.error(params, "too many parameters");
                                }
                            } else {
                                return this.error(params, "'n' parameter must be a integer > 0");
                            }
                        } else {
                            return this.error(params, "'n' parameter is not a integer");
                        }
                    } else {
                        return this.error(params, "'n' parameter is missing");
                    }
                    break;
                default:
                    return this.error(params, "unknown operation");
            }
        } else {
            return this.error(params, "'op' parameter is missing");
        }
        // all parameters are ok
        return true;
    }
    doOperation(params){
        switch (params.op){
            case '+': // add operation
                  this.result(params, parseFloat(params.x) + parseFloat(params.y));
                break;              
            case '-': // substract operation
                this.result(params, parseFloat(params.x) - parseFloat(params.y));
                break;
            case '*': // multiply operation
                this.result(params, parseFloat(params.x) * parseFloat(params.y));
                break;
            case '/': // divide operation
                this.result(params,parseFloat(params.x) / parseFloat(params.y));
                break;
            case '%': // modulo operation
                this.result(params, parseFloat(params.x) % parseFloat(params.y));
                break;
            case '!': // factorial operation
                this.result(params, factorial(parseInt(params.n)));
                break;
            case 'p': // is prime number operation
                this.result(params, isPrime(parseInt(params.n)));
                break;
            case 'np': // find the nth prime number operation
                this.result(params, findPrime(parseInt(params.n)));
                break;
        }
    }
    help() {
        // expose all the possible query strings
        let content = "<div style=font-family:arial>";
        content += "<h3>GET : Maths endpoint  <br> List of possible query strings:</h3><hr>";
        content += "<h4>? op = + & x = number & y = number <br>return {\"op\":\"+\", \"x\":number, \"y\":number, \"value\": x + y} </h4>";
        content += "<h4>? op = - & x = number & y = number <br>return {\"op\":\"-\", \"x\":number, \"y\":number, \"value\": x - y} </h4>";
        content += "<h4>? op = * & x = number & y = number <br>return {\"op\":\"*\", \"x\":number, \"y\":number, \"value\": x * y} </h4>";
        content += "<h4>? op = / & x = number & y = number <br>return {\"op\":\"/\", \"x\":number, \"y\":number, \"value\": x / y} </h4>";
        content += "<h4>? op = % & x = number & y = number <br>return {\"op\":\"%\", \"x\":number, \"y\":number, \"value\": x % y} </h4>";
        content += "<h4>? op = ! & n = integer <br>return {\"op\":\"%\",\"n\":integer, \"value\": n!} </h4>";
        content += "<h4>? op = p & n = integer <br>return {\"op\":\"p\",\"n\":integer, \"value\": true if n is a prime number} </h4>";
        content += "<h4>? op = np & n = integer <br>return {\"op\":\"n\",\"n\":integer, \"value\": nth prime number} </h4>";
        this.HttpContext.response.HTML(content + "</div>");
    }
    get(){
        // if we have no parameter, expose the list of possible query strings
        if (Object.keys(this.params).length === 0) {
           this.help();
        } else {
            if (this.checkParams(this.params)) {
                this.doOperation(this.params);
            }
        }
    }
}