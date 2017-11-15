import {communicator} from "./communicator";
import {executeExploit} from "./exploit";
import {setupUI} from "./ui";

setupUI();

setTimeout(function () {
    communicator.log("Startinn");
    executeExploit();
}, 100);

window.addEventListener("error", function (object) {
    console.log(object);
    alert(object.message);
    communicator.error({
        message: object.message,
        url: object.filename,
        line: object.lineno
    });
});