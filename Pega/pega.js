//Built in modules
let events = require("events");
let http = require("http");

//External modules
let dnsd = require("dnsd");
let ip = require("ip");
let io = require("socket.io");
let express = require("express");
let bodyParser = require("body-parser");


class Pega {
    constructor() {
        let self = this;

        //Initialize the event emitter
        this.eventEmitter = new events.EventEmitter();

        //Create an object to store all of our Promises
        this.serverPromises = {};

        //Create a DNS server to redirect the Switch's requests to where we want them to go
        this.redirectTo = ip.address();
        this.dnsServer = dnsd.createServer(function (req, res) {
            self.eventEmitter.emit("dns-request");
            res.end(self.redirectTo);
        });

        //Create an Express application for a nicer web server
        this.expressApplication = express();
        this.expressApplication.use(bodyParser.json());


        //Create an HTTP server
        this.httpServer = http.Server(this.expressApplication);

        //Create a socket server using Socket.IO
        this.socketHandler = io(this.httpServer);
    }

    //Comfy .on on our main class
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    //Tries to call all the server's .listen functions, executes callback on success
    listen(callback, ports) {
        ports = ports || {};

        let self = this;

        this.serverPromises.dnsServer = new Promise(function (resolve, reject) {
            self.dnsServer.on("error", function (error) {
                self.eventEmitter.emit("error", error);
                reject();
            });

            self.dnsServer.listen(ports.dns || 53, "0.0.0.0", function () {
                resolve();
            })
        });

        this.serverPromises.httpServer = new Promise(function (resolve, reject) {
            self.httpServer.on("error", function (error) {
                self.eventEmitter.emit("error", error);
                reject();
            });

            self.httpServer.listen(ports.http || 80, "0.0.0.0", function (error) {
                if (error) {
                    self.eventEmitter.emit("error", error);
                    reject();
                } else {
                    resolve();
                }
            })
        })

        Promise.all(Object.values(this.serverPromises)).then(function () {
            if (callback)
                callback();
        })
    }

    setExploitFolder(folder) {
        this.expressApplication.use("/", express.static(folder));
    }
}

module.exports = Pega;