class Communicator {
    constructor() {
        this.socket = io();
    }

    //Logs messages to the Daemon using socket.io
    log() {
        //Convert arguments object to array to make it more generic and to lose the length argument
        let argumentArray = Array.prototype.slice.call(arguments);
        console.log(argumentArray);

        let message = "";
        for (let i in argumentArray) {
            message += argumentArray[i].toString();
            if (i < argumentArray.length - 1)
                message += " ";
        }

        //alert(message);
        this.socket.emit("log", message);
    }

    //Sends errors to the Daemon using socket.io
    error(err) {
        this.socket.emit("jsError", err);
    }
}

export let communicator = new Communicator();