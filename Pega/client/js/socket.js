class Communicator {
    constructor() {
        this.socket = io();
    }

    //Logs messages to the Daemon using socket.io
    log() {
        //Convert arguments object to array to make it more generic and to lose the length argument
        let argumentArray = Array.prototype.slice.call(arguments).sort();
        console.log(argumentArray);

        let message = "";
        for (let i in argumentArray) {
            message += argumentArray[i].toString();
            if (i < argumentArray.length - 1)
                message += " ";
        }

        this.socket.emit("log", message);
    }
}

export let communicator = new Communicator();