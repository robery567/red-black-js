const WebWorker = new Worker('js/worker.js');

const AddInput = $('.js-add-input');
$('.js-add-button').on('click', function (event) {
    if (AddInput.val() !== "" && !nodeExists(AddInput.val())) {
        let message = {};
        message.action = 'INSERT';
        message.key = AddInput.val();
        console.log(message);
        WebWorker.postMessage(message);
    }
});

WebWorker.onmessage = function (message) {
    console.log(message);
    const data = message.data;
    let $parent = findNode(data.parent);
    if (nodeExists(data.key)) {
        let $node = findNode(data.key);
        if ($node.parents('.node:first').attr('data-key') === data.parent) {
            let nodeSide = '.js-child-left';
            if (data.key > data.parent) {
                nodeSide = '.js-child-right'
            }
            $parent.find(nodeSide).appendTo($node);
        }
        $node.find('.node__key:first').removeClass('node__key--' + getOppositeColor(data.color)).addClass('node__key--' + data.color);
    } else {
        const node = createNode(data.key, data.color);
        let nodeSide = '.js-child-left';
        if (data.key > data.parent) {
            nodeSide = '.js-child-right'
        }
        $parent.find(nodeSide).html(node);
    }
};

function createNode(key, color) {
    return `
    <div data-key="${key}" class="node">
        <span class="node__key node__key--${color}">${key}</span>
        <div class="node__children">
            <div class="node__children__left js-child-left"></div>
            <div class="node__children__right js-child-right"></div>
        </div>
    </div>
    `;
}

function nodeExists(key) {
    return $('.node[data-key="' + key + '"]').length !== 0;
}

function findNode(key) {
    if (key === null) {
        return $('.js-red-black-container');
    }
    return $('.node[data-key="' + key + '"]')
}

function getOppositeColor(color) {
    if (color === 'red') {
        return 'black';
    }
    return 'red';
}