class MessageQueue {

    /**
     * Creates and empty MessageQueue
     */
    constructor() {
        this.messages = [];
        this.interval = null;
    }

    /**
     * Adds the message to the queue and and start the processing if it isn't started
     * @param message
     */
    add(message) {
        this.messages.push(message);
        if (this.interval === null) {
            this.process();
            LOCK = true;
        }
    }

    /**
     * Start the processing loop
     */
    process() {
        const classInstance = this;
        this.interval = setInterval(function () {
            classInstance.processInterval();
        }, 300)
    }

    /**
     * Send the message and stops processing if the queue is empty
     */
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
     * Finds the root of the RedBlackTree, processes it and adds it to the queue
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

    /**
     * Creates an empty node with color RED with the given key
     * @param key
     */
    constructor(key) {
        this.Left = null;
        this.Right = null;
        this.Parent = null;
        this.color = RED;
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
        const temp = Node.key;
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
     * @returns {RedBlackNode|null}
     */
    getSibling() {
        if (this.Parent === null)
            return null;

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
        while (Cursor.Left !== null) {
            Cursor = Cursor.Left;
        }

        return Cursor;
    }

    /**
     * Check if the node has at least a RED child
     * @returns {boolean}
     */
    hasRedChild() {
        return (this.Left !== null && this.Left.color === RED) || (this.Right !== null && this.Right.color === RED);
    }

    /**
     * Checks if a node is BLACK
     * @param Node {RedBlackNode}
     */
    static isBlack(Node) {
        if (Node === null) {
            return true;
        }
        return Node.color === BLACK;
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

    /**
     * Finds the node with the given key
     * @param key
     * @returns {RedBlackNode|null}
     */
    find(key) {
        let Cursor = this.Root;
        while (Cursor !== null) {
            if (Cursor.key === key) {
                return Cursor;
            } else if (key < Cursor.key) {
                Cursor = Cursor.Left;
            } else {
                Cursor = Cursor.Right;
            }
        }
        return Cursor;
    }

    /**
     * Inserts a new node with the given key if it doesn't exists
     * @param key
     */
    insert(key) {
        if (this.find(key) === null) {
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
        if (Node !== null) {
            this.deleteNode(Node);
        }
    }

    /**
     * @param Node {RedBlackNode}
     */
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

    /**
     * @param Node {RedBlackNode}
     */
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
            let GrandParent = Node.Parent.Parent;

            /*  Case : A
                Parent of pt is Left child of Grand-Parent of pt */
            if (Parent === GrandParent.Left) {

                let Uncle = GrandParent.Right;

                /* Case : 1
                   The uncle of pt is also red
                   Only Recoloring required */
                if (Uncle != null && Uncle.color === RED) {
                    GrandParent.color = RED;
                    Parent.color = BLACK;
                    Uncle.color = BLACK;
                    Node = GrandParent;
                    MessageSender.sendChanges(this.Root);
                } else {
                    /* Case : 2
                       pt is right child of its Parent
                       Left-rotation required */
                    if (Node === Parent.Right) {
                        this.rotateLeft(Parent);
                        Node = Parent;
                        Parent = Node.Parent;
                        MessageSender.sendChanges(this.Root);
                    }

                    /* Case : 3
                       pt is Left child of its Parent
                       Right-rotation required */
                    this.rotateRight(GrandParent);
                    Parent.swapColor(GrandParent);
                    Node = Parent;
                    MessageSender.sendChanges(this.Root);
                }
            }

            /* Case : B
               Parent of pt is right child of Grand-Parent of pt */
            else {
                let Uncle = GrandParent.Left;

                /*  Case : 1
                    The uncle of pt is also red
                    Only Recoloring required */
                if ((Uncle !== null) && (Uncle.color === RED)) {
                    GrandParent.color = RED;
                    Parent.color = BLACK;
                    Uncle.color = BLACK;
                    Node = GrandParent;
                    MessageSender.sendChanges(this.Root);
                } else {
                    /* Case : 2
                       pt is Left child of its Parent
                       Right-rotation required */
                    if (Node === Parent.Left) {
                        this.rotateRight(Parent);
                        Node = Parent;
                        Parent = Node.Parent;
                        MessageSender.sendChanges(this.Root);
                    }

                    /* Case : 3
                       pt is right child of its Parent
                       Left-rotation required */
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
        if (this.Root === null) {
            this.Root = Node;
            MessageSender.sendChanges(this.Root);
            return Node;
        }
        let Cursor = this.Root;
        while (true) {
            if (Node.key < Cursor.key) {
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

// find node that replaces a deleted node in BST 
    static binarySearchTreeReplace(Node) {
        // when node have 2 children
        if (Node.Left !== null && Node.Right != null) {
            return Node.Right.getSuccessor();
        }

        // when leaf
        if (Node.Left === null && Node.Right == null) {
            return null;
        }

        // when single child
        if (Node.Left !== null) {
            return Node.Left;
        } else {
            return Node.right;
        }
    }

    /**
     * @param Node {RedBlackNode}
     */
    deleteNode(Node) {
        let Replacement = RedBlackTree.binarySearchTreeReplace(Node);

        // True when Replacement and Node are both black
        let blackBlack = RedBlackNode.isBlack(Replacement) && Node.color === BLACK;
        let Parent = Node.Parent;

        if (Replacement == null) {
            // Replacement is null therefore Node is leaf
            if (Node === this.Root) {
                // Node is root, making root null
                this.Root = null;
            } else {
                if (blackBlack) {
                    // Replacement and Node both black
                    // Node is leaf, fix double black at Node
                    this.fixDoubleBlack(Node);
                } else {
                    // Replacement or Node is red
                    if (Node.getSibling() != null)
                    // sibling is not null, make it red"
                        Node.getSibling().color = RED;
                }

                // delete Node from the tree
                if (Node.isOnLeft()) {
                    Parent.Left = null;
                } else {
                    Parent.Right = null;
                }
            }
            MessageSender.sendChanges(this.Root);
            return;
        }

        if (Node.Left == null || Node.Right === null) {
            // Node has 1 child
            if (Node === this.Root) {
                // Node is root, assign the value of Replacement to Node, and delete Replacement
                Node.key = Replacement.key;
                Node.Left = Node.Right = null;
            } else {
                // Detach Node from tree and move Replacement up
                if (Node.isOnLeft()) {
                    Parent.Left = Replacement;
                } else {
                    Parent.right = Replacement;
                }
                Replacement.Parent = Parent;
                if (blackBlack) {
                    // Replacement and Node both black, fix double black at Replacement
                    this.fixDoubleBlack(Replacement);
                } else {
                    // Replacement or Node red, color Replacement black
                    Replacement.color = BLACK;
                }
            }
            MessageSender.sendChanges(this.Root);
            return;
        }

        // Node has 2 children, swap values with successor and recurse
        Replacement.swapValues(Node);
        MessageSender.sendChanges(this.Root);
        this.deleteNode(Replacement);
    }

    fixDoubleBlack(Node) {
        if (Node === this.Root) {
            return;
        }

        let Sibling = Node.getSibling(), Parent = Node.Parent;
        if (Sibling == null) {
            // No Sibling, double black pushed up
            this.fixDoubleBlack(Parent);
        } else {
            if (Sibling.color === RED) {
                // Sibling red
                Parent.color = RED;
                Sibling.color = BLACK;
                if (Sibling.isOnLeft()) {
                    // Left case
                    this.rotateRight(Parent);
                    MessageSender.sendChanges(this.Root);
                } else {
                    // right case
                    this.rotateLeft(Parent);
                    MessageSender.sendChanges(this.Root);
                }
                this.fixDoubleBlack(Node);
            } else {
                // Sibling black
                if (Sibling.hasRedChild()) {
                    // at least 1 red children
                    if (Sibling.Left != null && Sibling.Left.color === RED) {
                        if (Sibling.isOnLeft()) {
                            // Left Left
                            Sibling.Left.color = Sibling.color;
                            Sibling.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateRight(Parent);
                            MessageSender.sendChanges(this.Root);
                        } else {
                            // right Left
                            Sibling.Left.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateRight(Sibling);
                            MessageSender.sendChanges(this.Root);
                            this.rotateLeft(Parent);
                            MessageSender.sendChanges(this.Root);
                        }
                    } else {
                        if (Sibling.isOnLeft()) {
                            // Left right
                            Sibling.right.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateLeft(Sibling);
                            MessageSender.sendChanges(this.Root);
                            this.rotateRight(Parent);
                            MessageSender.sendChanges(this.Root);
                        } else {
                            // right right
                            Sibling.right.color = Sibling.color;
                            Sibling.color = Parent.color;
                            MessageSender.sendChanges(this.Root);
                            this.rotateLeft(Parent);
                            MessageSender.sendChanges(this.Root);
                        }
                    }
                    Parent.color = BLACK;
                    MessageSender.sendChanges(this.Root);
                } else {
                    // 2 black children
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

