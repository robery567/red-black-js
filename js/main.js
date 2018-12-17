const WebWorker = new Worker('js/worker.js');

const AddInput = $('.js-add-input');
$('.js-add-button').on('click', function (event) {
    event.preventDefault();
    if ( !isNaN(AddInput.val()) && !nodeExists(AddInput.val())) {
        let message = {};
        message.action = 'INSERT';
        message.key = AddInput.val();
        WebWorker.postMessage(message);
        AddInput.val('');
    } else {
        alert("You can't add a key that already exists.");
    }
});

const DeleteInput = $('.js-delete-input');
$('.js-delete-button').on('click', function (event) {
    event.preventDefault();
    if ( !isNaN(DeleteInput.val()) && nodeExists(DeleteInput.val())) {
        let message = {};
        message.action = 'DELETE';
        message.key = DeleteInput.val();
        WebWorker.postMessage(message);
        DeleteInput.val('');
    } else {
        alert("You can't delete a key that doesn't exist.");
    }
});

const Overlay = $('.overlay');
WebWorker.onmessage = function (message) {
    if (message.data !== undefined) {
        switch (message.data.action) {
            case 'start' :
                Overlay.addClass('overlay--show');
                break;
            case 'stop':
                Overlay.removeClass('overlay--show');
                break;
            case 'draw':
                $('.js-red-black-container .js-child-left.js-child-right').html('');
                drawTree(message.data);
                calculateAngle();
                break;
        }
    } else {
        $('.js-red-black-container .js-child-left.js-child-right').html('');
    }
};

/**
 * @param node {RedBlackNode}
 */
function createNode(node) {
    return `
    <div data-key="${node.key}" class="node">
        <hr class="node__line">
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
    if (node === undefined) {
        return $('.js-red-black-container');
    }
    return $('.node[data-key="' + node.key + '"]')
}


/**
 * @param node {RedBlackNode}
 */
function drawTree(node) {
    if (node !== undefined) {
        const $parent = findNode(node.Parent);
        const $node = createNode(node);
        let nodeSide = '.node__children:first > .js-child-left';
        if (node.Parent !== undefined && parseInt(node.key) > parseInt(node.Parent.key)) {
            nodeSide = '.node__children:first > .js-child-right'
        }
        $parent.find(nodeSide).first().html($node);
        if (node.Left !== undefined) {
            drawTree(node.Left);
        }
        if (node.Right !== undefined) {
            drawTree(node.Right);
        }
    }
}

function calculateAngle() {
    $('.node__line').each(function () {
        const me = $(this);
        const sign = me.parent().parent().hasClass('js-child-left') ? -1 : 1;
        const angle = sign * Math.atan(25 / me.width());
        me.css('transform', 'rotate(' + angle + 'rad)')
    })
}
