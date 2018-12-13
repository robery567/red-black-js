const WebWorker = new Worker('js/worker.js');

const AddInput = $('.js-add-input');
$('.js-add-button').on('click', function (event) {
    if (AddInput.val() !== "" && !nodeExists(AddInput.val())) {
        let message = {};
        message.action = 'INSERT';
        message.key = AddInput.val();
        WebWorker.postMessage(message);
    }
});

WebWorker.onmessage = function (message) {
    console.log(message.data);
    $('.js-red-black-container > .js-child-left.js-child-right').html('');
    drawTree(message.data);
};

/**
 * @param node {RedBlackNode}
 */
function createNode(node) {
    return `
    <div data-key="${node.key}" class="node">
        <span class="node__key node__key--${node.color}">${node.key}</span>
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

/**
 * @param node {RedBlackNode}
 */
function findNode(node) {
    if (node === null) {
        return $('.js-red-black-container');
    }
    return $('.node[data-key="' + node.key + '"]')
}


/**
 * @param node {RedBlackNode}
 */
function drawTree(node) {
    if(node !== null){
        const $parent = findNode(node.Parent);
        const $node = createNode(node);
        let nodeSide = '.node__children:first > .js-child-left';
        if (node.Parent !== null && parseInt(node.key) > parseInt(node.Parent.key)) {
            nodeSide = '.node__children:first > .js-child-right'
        }
        $parent.find(nodeSide).first().html($node);
        if(node.Left !== null){
            drawTree(node.Left);
        }
        if(node.Right !== null){
            drawTree(node.Right);
        }
    }
}
