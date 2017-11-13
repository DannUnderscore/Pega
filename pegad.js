let path = require("path");

let pega = new (require("./Pega/pega"))();

pega.listen(function () {
    pega.setExploitFolder(path.join(__dirname, "exploit"))
    console.log("DNS IP", pega.redirectTo);
});

let dnsCount = 0;
pega.on("dns-request", function () {
    dnsCount++;
    console.log(dnsCount);
})