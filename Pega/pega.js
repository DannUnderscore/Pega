//Built in modules
let events = require("events");
let http = require("http");
let path = require("path");
let fs = require("fs");

//External modules
let dnsd = require("dnsd");
let ip = require("ip");
let io = require("socket.io");
let express = require("express");
let bodyParser = require("body-parser");
let morgan = require("morgan");
let rollup = require("rollup");
let rollupBabel = require("rollup-plugin-babel");


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
        //this.expressApplication.use(morgan("tiny"));

        this.expressApplication.use(express.static(path.join(__dirname, "client")));

        //Transpiles all JS6 to JS5 on the go so the browser will actually accept it
        this.expressApplication.get("/js/pega.js", function (req, res) {
            rollup.rollup({
                input: path.join(__dirname, "client", "js", "main.js"),
                plugins: [
                    rollupBabel({
                        presets: [["env", {
                            modules: false
                        }]],
                        plugins: ["external-helpers"]
                    })
                ]
            }).then(function (bundle) {
                bundle.generate({
                    format: "iife"
                }).then(function (result) {
                    res.end(result.code);
                })
            })
        });

        //404 handler
        this.expressApplication.use(function (req, res) {
            console.log("404");
            res.status(404).send("404");
        });


        //Create an HTTP server
        this.httpServer = http.Server(this.expressApplication);

        //Create a socket server using Socket.IO
        this.socketHandler = io(this.httpServer);

        this.socketHandler.on("connection", function (socket) {
            socket.on("log", function (message) {
                console.log(message);
            })
        })
    }

    //Comfy .on on our main class
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    //Tries to call all the server's .listen functions, executes callback on success
    listen(callback, ports) {
        ports = ports || {};

        let self = this;

        //Tries to start DNS server
        this.serverPromises.dnsServer = new Promise(function (resolve, reject) {
            self.dnsServer.on("error", function (error) {
                self.eventEmitter.emit("error", error);
                reject();
            });

            self.dnsServer.listen(ports.dns || 53, "0.0.0.0", function () {
                resolve();
            })
        });

        //Tries to start HTTP server
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
        });

        //Executes callback if and when all Promises get resolved
        Promise.all(Object.values(this.serverPromises)).then(function () {
            if (callback)
                callback();
        })
    }
}

module.exports = Pega;