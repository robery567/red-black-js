class MessageQueue {

    constructor() {
        this.messages = [];
        this.interval = null;
    }

    add(message) {
        this.messages.push(message);
        if (this.interval === null) {
            this.process();
            LOCK = true;
        }
    }

    process() {
        const classInstance = this;
        this.interval = setInterval(function () {
            classInstance.processInterval();
        }, 300)
    }

    processInterval() {
        if (this.messages.length !== 0) {
            postMessage(this.messages.shift());
        } else {
            clearInterval(this.interval);
            this.interval = null;
            LOCK = false;
        }
    }

    /**
     * @param Node {RedBlackNode}
     */
    sendChanges(Node) {
        while (Node.Parent !== null) {
            Node = Node.Parent;
        }
        this.add(this._makeTree(Node));
    }

    /**
     * @param Node {RedBlackNode}
     */
    _makeTree(Node) {
        return {
            key: Node.key,
            color: Node.color,
            Left: Node.Left !== null ? this._makeTree(Node.Left) : null,
            Right: Node.Right !== null ? this._makeTree(Node.Right) : null,
            Parent: Node.Parent !== null ? {key: Node.Parent.key} : null
        };
    }

}

const MessageSender = new MessageQueue();

class RedBlackNode {

    constructor(key) {
        this.Left = null;
        this.Right = null;
        this.Parent = null;
        this.color = RED;
        this.key = key;
    }

    /**
     * @param Node {RedBlackNode}
     */
    swapColor(Node) {
        const tmp = this.color;
        this.color = Node.color;
        Node.color = tmp;
    }
}

class RedBlackTree {

    constructor() {
        /**
         * The Root of the Red Black Tree
         * @type {RedBlackNode}
         */
        this.Root = null;
    }


    insert(key) {
        const Node = this.binarySearchTreeInsert(key);
        this.balanceTree(Node);
    }

    rotateLeft(Node) {
        let Right = Node.Right;

        Node.Right = Right.Left;

        if (Node.Right !== null) {
            Node.Right.Parent = Node;
        }
        Right.Parent = Node.Parent;

        if (Node.Parent === null) {
            this.Root = Right;
        } else if (Node === Node.Parent.Left) {
            Node.Parent.Left = Right;
        } else {
            Node.Parent.Right = Right;
        }

        Right.Left = Node;
        Node.Parent = Right;
    }

    rotateRight(Node) {
        let Left = Node.Left;

        Node.Left = Left.Right;

        if (Node.Left !== null) {
            Node.Left.Parent = Node;
        }
        Left.Parent = Node.Parent;

        if (Node.Parent == null) {
            this.Root = Left;
        } else if (Node === Node.Parent.Left) {
            Node.Parent.Left = Left;
        } else {
            Node.Parent.Right = Left;
        }

        Left.Right = Node;
        Node.Parent = Left;
    }

    balanceTree(Node) {
        while (Node !== this.Root && Node.color !== BLACK && Node.Parent.color === RED) {

            let Parent = Node.Parent;
            let Grandparent = Node.Parent.Parent;

            /*  Case : A
                Parent of pt is left child of Grand-parent of pt */
            if (Parent === Grandparent.Left) {

                let Uncle = Grandparent.Right;

                /* Case : 1
                   The uncle of pt is also red
                   Only Recoloring required */
                if (Uncle != null && Uncle.color === RED) {
                    Grandparent.color = RED;
                    Parent.color = BLACK;
                    Uncle.color = BLACK;
                    Node = Grandparent;
                    MessageSender.sendChanges(this.Root);
                } else {
                    /* Case : 2
                       pt is right child of its parent
                       Left-rotation required */
                    if (Node === Parent.Right) {
                        this.rotateLeft(Parent);
                        Node = Parent;
                        Parent = Node.Parent;
                        MessageSender.sendChanges(this.Root);
                    }

                    /* Case : 3
                       pt is left child of its parent
                       Right-rotation required */
                    this.rotateRight(Grandparent);
                    Parent.swapColor(Grandparent);
                    Node = Parent;
                    MessageSender.sendChanges(this.Root);
                }
            }

            /* Case : B
               Parent of pt is right child of Grand-parent of pt */
            else {
                let Uncle = Grandparent.Left;

                /*  Case : 1
                    The uncle of pt is also red
                    Only Recoloring required */
                if ((Uncle !== null) && (Uncle.color === RED)) {
                    Grandparent.color = RED;
                    Parent.color = BLACK;
                    Uncle.color = BLACK;
                    Node = Grandparent;
                    MessageSender.sendChanges(this.Root);
                } else {
                    /* Case : 2
                       pt is left child of its parent
                       Right-rotation required */
                    if (Node === Parent.Left) {
                        this.rotateRight(Parent);
                        Node = Parent;
                        Parent = Node.Parent;
                        MessageSender.sendChanges(this.Root);
                    }

                    /* Case : 3
                       pt is right child of its parent
                       Left-rotation required */
                    this.rotateLeft(Grandparent);
                    Parent.swapColor(Grandparent);
                    Node = Parent;
                    MessageSender.sendChanges(this.Root);
                }
            }
        }

        this.Root.color = BLACK;
        MessageSender.sendChanges(this.Root);
    }


    /**
     * Standard BST insert
     * @param key
     * @returns {RedBlackNode}
     */
    binarySearchTreeInsert(key) {
        const Node = new RedBlackNode(key);
        if (this.Root === null) {
            this.Root = Node;
            MessageSender.sendChanges(this.Root);
            return Node;
        }
        let Cursor = this.Root;
        while (true) {
            if (parseInt(Node.key) < parseInt(Cursor.key)) {
                if (Cursor.Left === null) {
                    Cursor.Left = Node;
                    Node.Parent = Cursor;
                    MessageSender.sendChanges(this.Root);
                    return Node;
                }
                Cursor = Cursor.Left;
            } else {
                if (Cursor.Right === null) {
                    Cursor.Right = Node;
                    Node.Parent = Cursor;
                    MessageSender.sendChanges(this.Root);
                    return Node;
                }
                Cursor = Cursor.Right;
            }
        }
    }

}

