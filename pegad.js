let path = require("path");

let pega = new (require("./Pega/pega"))();

pega.listen(function () {
    console.log("DNS IP", pega.redirectTo);
});