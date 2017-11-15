let path = require("path");

let pega = new (require("./Pega/pega"))();

pega.listen(function () {
    console.log("DNS IP", pega.redirectTo);
});

pega.on("log", function (message) {
    console.log(message);
});

pega.on("jsError", function (error) {
    console.log(JSON.stringify(error));
});