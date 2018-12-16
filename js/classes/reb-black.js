class MessageQueue {

    /**
     * Creates and empty MessageQueue
     */
    constructor() {
        this.messages = [];
        /**
         * @type {number}
         */
        this.interval = undefined;
    }

    /**
     * Adds the message to the queue and and start the processing if it isn't started
     * @param message
     */
    add(message) {
        if (this.interval === undefined) {
            this.messages.push({action: 'start'});
            this.process();
            LOCK = true;
        }
        if (message !== undefined) {
            message.action = 'draw';
        }
        this.messages.push(message);
    }

    /**
     * Start the processing loop
     */
    process() {
        const classInstance = this;
        this.interval = setInterval(function () {
            classInstance.processInterval();
        }, 500)
    }

    /**
     * Send the message and stops processing if the queue is empty
     */
    processInterval() {
        if (this.messages.length !== 0) {
            postMessage(this.messages.shift());
        } else {
            postMessage({action: 'stop'});
            clearInterval(this.interval);
            this.interval = undefined;
            LOCK = false;
        }
    }

    /**
     * Finds the root of the RedBlackTree, processes it and adds it to the queue
     * @param Node {RedBlackNode}
     */
    sendChanges(Node) {
        if (Node === undefined) {
            this.add(undefined);
            return;
        }
        while (Node.Parent !== undefined) {
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
            Left: Node.Left !== undefined ? this._makeTree(Node.Left) : undefined,
            Right: Node.Right !== undefined ? this._makeTree(Node.Right) : undefined,
            Parent: Node.Parent !== undefined ? {key: Node.Parent.key} : undefined
        };
    }

}

const MessageSender = new MessageQueue();

class RedBlackNode {

    /**
     * Creates an empty node with color RED with the given key
     * @param key
     */
    constructor(key) {
        /**
         * @type {RedBlackNode}
         */
        this.Left = undefined;
        /**
         * @type {RedBlackNode}
         */
        this.Right = undefined;
        /**
         * @type {RedBlackNode}
         */
        this.Parent = undefined;
        /**
         * @type {string}
         */
        this.color = RED;
        /**
         * @type {number}
         */
        this.key = key;
    }

    /**
     * Swap colors with the given node
     * @param Node {RedBlackNode}
     */
    swapColor(Node) {
        const tmp = this.color;
        this.color = Node.color;
        Node.color = tmp;
    }

    /**
     * Swap keys with the given node
     * @param Node {RedBlackNode}
     */
    swapValues(Node) {
        const temp = this.key;
        this.key = Node.key;
        Node.key = temp;
    }

    /**
     * Check if the node is on the left of its parent
     * @returns {boolean}
     */
    isOnLeft() {
        return this === this.Parent.Left;
    }

    /**
     * Gets the sibling of the node
     * @returns {RedBlackNode|undefined}
     */
    getSibling() {
        if (this.Parent === undefined)
            return undefined;

        if (this.isOnLeft()) {
            return this.Parent.Right;
        } else {
            return this.Parent.Left;
        }
    }

    /**
     * Gets the successor of the node
     * @returns {RedBlackNode}
     */
    getSuccessor() {
        let Cursor = this;
        while (Cursor.Left !== undefined) {
            Cursor = Cursor.Left;
        }

        return Cursor;
    }

    /**
     * Check if the node has at least a RED child
     * @returns {boolean}
     */
    hasRedChild() {
        return (this.Left !== undefined && this.Left.color === RED) || (this.Right !== undefined && this.Right.color === RED);
    }

    /**
     * Checks if a node is BLACK
     * @param Node {RedBlackNode}
     */
    static isBlack(Node) {
        if (Node === undefined) {
            return true;
        }
        return Node.color === BLACK;
    }

    /**
     * Checks if a node is RED
     * @param Node {RedBlackNode}
     */
    static isRed(Node) {
        if (Node === undefined) {
            return false;
        }
        return Node.color === RED;
    }
}

class RedBlackTree {

    constructor() {
        /**
         * The Root of the Red Black Tree
         * @type {RedBlackNode}
         */
        this.Root = undefined;
    }

    /**
     * Finds the node with the given key
     * @param key
     * @returns {RedBlackNode|undefined}
     */
    find(key) {
        let Cursor = this.Root;
        while (Cursor !== undefined) {
            if (Cursor.key === key) {
                return Cursor;
            } else if (key < Cursor.key) {
                Cursor = Cursor.Left;
            } else {
                Cursor = Cursor.Right;
            }
        }
        return undefined;
    }

    /**
     * Inserts a new node with the given key if it doesn't exists
     * @param key
     */
    insert(key) {
        if (this.find(key) === undefined) {
            const Node = this.binarySearchTreeInsert(key);
            this.balanceTree(Node);
        }
    }

    /**
     * Deletes the node with the given key if it exists
     * @param key
     */
    delete(key) {
        const Node = this.find(key);
        if (Node !== undefined) {
            this.deleteNode(Node);
        }
    }

    /**
     * @param Node {RedBlackNode}
     */
    rotateLeft(Node) {
        let Right = Node.Right;

        Node.Right = Right.Left;

        if (Node.Right !== undefined) {
            Node.Right.Parent = Node;
        }
        Right.Parent = Node.Parent;

        if (Node.Parent === undefined) {
            this.Root = Right;
        } else if (Node === Node.Parent.Left) {
            Node.Parent.Left = Right;
        } else {
            Node.Parent.Right = Right;
        }

        Right.Left = Node;
        Node.Parent = Right;
    }

    /**
     * @param Node {RedBlackNode}
     */
    rotateRight(Node) {
        let Left = Node.Left;

        Node.Left = Left.Right;

        if (Node.Left !== undefined) {
            Node.Left.Parent = Node;
        }
        Left.Parent = Node.Parent;

        if (Node.Parent === undefined) {
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
            let GrandParent = Node.Parent.Parent;

            if (Parent === GrandParent.Left) {

                let Uncle = GrandParent.Right;
                if (RedBlackNode.isRed(Uncle)) {
                    GrandParent.color = RED;
                    Parent.color = BLACK;
                    Uncle.color = BLACK;
                    Node = GrandParent;
                    MessageSender.sendChanges(this.Root);
                } else {

                    if (Node === Parent.Right) {
                        this.rotateLeft(Parent);
                        Node = Parent;
                        Parent = Node.Parent;
                        MessageSender.sendChanges(this.Root);
                    }

                    this.rotateRight(GrandParent);
                    Parent.swapColor(GrandParent);
                    Node = Parent;
                    MessageSender.sendChanges(this.Root);
                }

            } else {

                let Uncle = GrandParent.Left;
                if (RedBlackNode.isRed(Uncle)) {
                    GrandParent.color = RED;
                    Parent.color = BLACK;
                    Uncle.color = BLACK;
                    Node = GrandParent;
                    MessageSender.sendChanges(this.Root);
                } else {

                    if (Node === Parent.Left) {
                        this.rotateRight(Parent);
                        Node = Parent;
                        Parent = Node.Parent;
                        MessageSender.sendChanges(this.Root);
                    }

                    this.rotateLeft(GrandParent);
                    Parent.swapColor(GrandParent);
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
        if (this.Root === undefined) {
            this.Root = Node;
            MessageSender.sendChanges(this.Root);
            return Node;
        }
        let Cursor = this.Root;
        while (true) {
            if (Node.key < Cursor.key) {
                if (Cursor.Left === undefined) {
                    Cursor.Left = Node;
                    Node.Parent = Cursor;
                    MessageSender.sendChanges(this.Root);
                    return Node;
                }
                Cursor = Cursor.Left;
            } else {
                if (Cursor.Right === undefined) {
                    Cursor.Right = Node;
                    Node.Parent = Cursor;
                    MessageSender.sendChanges(this.Root);
                    return Node;
                }
                Cursor = Cursor.Right;
            }
        }
    }


    static binarySearchTreeReplace(Node) {

        if (Node.Left !== undefined && Node.Right !== undefined) {
            return Node.Right.getSuccessor();
        }


        if (Node.Left === undefined && Node.Right === undefined) {
            return undefined;
        }


        if (Node.Left !== undefined) {
            return Node.Left;
        } else {
            return Node.Right;
        }
    }

    /**
     * @param Node {RedBlackNode}
     */
    deleteNode(Node) {
        let Replacement = RedBlackTree.binarySearchTreeReplace(Node);

        let blackBlack = RedBlackNode.isBlack(Replacement) && Node.color === BLACK;
        let Parent = Node.Parent;

        if (Replacement === undefined) {

            if (Node === this.Root) {
                this.Root = undefined;
            } else {
                if (blackBlack) {
                    this.fixDoubleBlack(Node);
                } else {
                    let Sibling = Node.getSibling();
                    if (Sibling !== undefined) {
                        Sibling.color = RED;
                    }
                }

                if (Node.isOnLeft()) {
                    Parent.Left = undefined;
                } else {
                    Parent.Right = undefined;
                }
            }
            MessageSender.sendChanges(this.Root);
            return;
        }

        if (Node.Left === undefined || Node.Right === undefined) {

            if (Node === this.Root) {
                Node.key = Replacement.key;
                Node.Left = Node.Right = undefined;
            } else {

                if (Node.isOnLeft()) {
                    Parent.Left = Replacement;
                } else {
                    Parent.Right = Replacement;
                }
                Replacement.Parent = Parent;
                if (blackBlack) {
                    this.fixDoubleBlack(Replacement);
                } else {
                    Replacement.color = BLACK;
                }
            }
            MessageSender.sendChanges(this.Root);
            return;
        }

        Replacement.swapValues(Node);
        MessageSender.sendChanges(this.Root);
        this.deleteNode(Replacement);
    }

    fixDoubleBlack(Node) {
        if (Node === this.Root) {
            return;
        }

        let Sibling = Node.getSibling(), Parent = Node.Parent;
        if (Sibling === undefined) {
            this.fixDoubleBlack(Parent);
        } else {
            if (Sibling.color === RED) {

                Parent.color = RED;
                Sibling.color = BLACK;
                if (Sibling.isOnLeft()) {
                    this.rotateRight(Parent);
                    MessageSender.sendChanges(this.Root);
                } else {
                    this.rotateLeft(Parent);
                    MessageSender.sendChanges(this.Root);
                }
                this.fixDoubleBlack(Node);
            } else {

                if (Sibling.hasRedChild()) {

                    if (Sibling.Left !== undefined && Sibling.Left.color === RED) {
                        if (Sibling.isOnLeft()) {

                            Sibling.Left.color = Sibling.color;
                            Sibling.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateRight(Parent);
                            MessageSender.sendChanges(this.Root);
                        } else {

                            Sibling.Left.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateRight(Sibling);
                            MessageSender.sendChanges(this.Root);
                            this.rotateLeft(Parent);
                            MessageSender.sendChanges(this.Root);
                        }
                    } else {
                        if (Sibling.isOnLeft()) {

                            Sibling.Right.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateLeft(Sibling);
                            MessageSender.sendChanges(this.Root);
                            this.rotateRight(Parent);
                            MessageSender.sendChanges(this.Root);
                        } else {

                            Sibling.Right.color = Sibling.color;
                            Sibling.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateLeft(Parent);
                            MessageSender.sendChanges(this.Root);
                        }
                    }
                    Parent.color = BLACK;
                    MessageSender.sendChanges(this.Root);
                } else {

                    Sibling.color = RED;
                    MessageSender.sendChanges(this.Root);
                    if (Parent.color === BLACK) {
                        this.fixDoubleBlack(Parent);
                    } else {
                        Parent.color = BLACK;
                        MessageSender.sendChanges(this.Root);
                    }
                }
            }
        }
    }

}

