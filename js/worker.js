importScripts('classes/constants.js');
importScripts('classes/reb-black.js');

let LOCK = false;

const RBT = new RedBlackTree();

onmessage = function (event) {
    if (LOCK === true) {
        return;
    }
    LOCK = true;
    switch (event.data.action) {
        case 'INSERT':
            RBT.insert(parseInt(event.data.key));
            break;
        case 'DELETE':
            RBT.delete(parseInt(event.data.key));
            break;
    }
};