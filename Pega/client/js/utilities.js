//Takes low and high byte, turns into an address string
export function padAddress(lo, hi) {
    if (arguments.length === 1) {
        hi = lo[1];
        lo = lo[0];
    }

    return '0x' + ('0'.repeat(8) + hi.toString(16)).slice(-8) + ('0'.repeat(8) + lo.toString(16)).slice(-8);
}

//Parses an address string back to it's low and high byte
export function parseAddress(address) {
    address = "0".repeat(16) + address.replace('0x', '');
    address = address.slice(address.length - 16);

    let array = [address.slice(0, 8), address.slice(8, 16)];
    return [parseInt(array[1], 16), parseInt(array[0], 16)];
}

//Returns true of address is a null pointer
export function isNullPtr(address) {
    if (typeof address === "string")
        address = parseAddress(address);
    return address[0] === 0 && address[1] === 0;
}

//Returns true if address a == address b
export function addressEquals(a, b) {
    if (typeof a === "string")
        a = parseAddress(a);
    if (typeof b === "string")
        b = parseAddress(b);
    return a[0] === b[0] && a[1] === b[1];
}

//Adds 2 addresses together, returns the resulting address
export function addressAdd(address, offset) {
    if (typeof offset === "number") {
        if (offset >= 0) {
            offset = [offset, 0];
        } else {
            offset = [(0xFFFFFFFF + offset + 1) >>> 0, 0xFFFFFFFF];
        }
    }
    if (typeof address === "string")
        address = parseAddress(address);

    let resultLo = ((address[0] + offset[0]) & 0xFFFFFFFF) >>> 0;
    let resultHi = ((address[1] + offset[1]) & 0xFFFFFFFF) >>> 0;

    //Check if resultLo has overflown/underflown
    if ((resultLo < address[0] && offset[0] > 0) || (resultLo === address[0] && offset[0] !== 0))
        resultHi = ((resultHi + 1) & 0xFFFFFFFF) >>> 0;
    else if (resultLo > address[0] && offset[0] < 0)
        resultHi = ((resultHi - 1) & 0xFFFFFFFF) >>> 0;

    return [resultLo, resultHi];
}

//Will ask the browser to fullscreenify an element, will only work if called by user events like onclick
export function setFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}