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
     * @returns {null|RedBlackNode}
     */
    getUncle() {
        const Parent = this.Parent;
        if (Parent === null) {
            return null;
        }
        const Grandparent = Parent.Parent;
        if (Grandparent === null) {
            return null;
        }
        if (Grandparent.Left === Parent) {
            return Grandparent.Right;
        } else {
            return Grandparent.Left;
        }
    }

    leftLeftCase() {
        let Parent = this.Parent;
        let Grandparent = Parent.Parent;

        Parent.Parent = Grandparent.Parent;
        if (Grandparent.Parent !== null) {
            if (Grandparent.Parent.Left === Grandparent) {
                Grandparent.Parent.Left = Parent;
            } else {
                Grandparent.Parent.Right = Parent
            }
        }

        if (Parent.Right !== null) {
            Parent.Right.Parent = Grandparent;
        }
        Grandparent.Left = Parent.Right;

        Parent.Right = Grandparent;
        Grandparent.Parent = Parent;


        MessageSender.sendChanges(this);
        Parent.color = BLACK;
        Grandparent.color = RED;
        MessageSender.sendChanges(this);
    }

    rightRightCase() {
        let Parent = this.Parent;
        let Grandparent = Parent.Parent;

        Parent.Parent = Grandparent.Parent;
        if (Grandparent.Parent !== null) {
            if (Grandparent.Parent.Left === Grandparent) {
                Grandparent.Parent.Left = Parent;
            } else {
                Grandparent.Parent.Right = Parent
            }
        }

        if (Parent.Left !== null) {
            Parent.Left.Parent = Grandparent;
        }
        Grandparent.Right = Parent.Left;

        Parent.Left = Grandparent;
        Grandparent.Parent = Parent;

        MessageSender.sendChanges(this);
        Parent.color = BLACK;
        Grandparent.color = RED;
        MessageSender.sendChanges(this);
    }

    leftRightCase() {
        let Parent = this.Parent;
        let Grandparent = Parent.Parent;

        this.Parent = Grandparent.Parent;
        if (Grandparent.Parent !== null) {
            if (Grandparent.Parent.Left === Grandparent) {
                Grandparent.Parent.Left = this;
            } else {
                Grandparent.Parent.Right = this
            }
        }

        Grandparent.Parent = this;
        Grandparent.Left = this.Right;
        if (this.Right !== null) {
            this.Right.Parent = Grandparent;
        }
        this.Right = Grandparent;

        Parent.Right = this.Left;
        Parent.Parent = this;
        if (this.Left !== null) {
            this.Left.Parent = Parent;
        }
        this.Left = Parent;

        MessageSender.sendChanges(this);
        this.color = BLACK;
        Grandparent.color = RED;
        MessageSender.sendChanges(this);
    }


    rightLeftCase() {
        let Parent = this.Parent;
        let Grandparent = Parent.Parent;

        this.Parent = Grandparent.Parent;
        if (Grandparent.Parent !== null) {
            if (Grandparent.Parent.Left === Grandparent) {
                Grandparent.Parent.Left = this;
            } else {
                Grandparent.Parent.Right = this
            }
        }

        Grandparent.Parent = this;
        Grandparent.Right = this.Left;
        if (this.Left !== null) {
            this.Left.Parent = Grandparent;
        }
        this.Left = Grandparent;

        Parent.Left = this.Right;
        Parent.Parent = this;
        if (this.Right !== null) {
            this.Right.Parent = Parent;
        }
        this.Right = Parent;

        MessageSender.sendChanges(this);
        this.color = BLACK;
        Grandparent.color = RED;
        MessageSender.sendChanges(this);
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

    recolor(Node) {
        let Uncle = Node.getUncle();
        if (Uncle !== null && Uncle.color === RED) {
            Node.Parent.color = BLACK;
            Uncle.color = BLACK;
            Node.Parent.Parent.color = RED;
            Node = Node.Parent.Parent;
            MessageSender.sendChanges(Node);
            this.balanceTree(Node);
        }
    }

    insert(key) {
        const Node = this.binarySearchTreeInsert(key);
        this.balanceTree(Node);
    }

    /**
     * @param Node {RedBlackNode}
     * @returns {RedBlackNode}
     */
    balanceTree(Node){
        if(Node === this.Root){
            Node.color = BLACK;
            MessageSender.sendChanges(this.Root);
        }
        const Uncle = Node.getUncle();
        if (Uncle !== null) {
            if (Uncle.color === RED) {
                this.recolor(Node);
            } else {
                if (Uncle.Parent.Right === Uncle) {
                    if (Node.Parent.Left === Node) {
                        Node.leftLeftCase();
                    } else {
                        Node.leftRightCase();
                    }
                } else {
                    if (Node.Parent.Right === Node) {
                        Node.rightRightCase();
                    } else {
                        Node.rightLeftCase();
                    }
                }
            }
        }else {
            if(Node.Parent !== null && Node.Parent.Parent !== null){
                if(Node.Parent.Parent.Right === null){
                    Node.leftLeftCase();
                }else {
                    Node.rightRightCase();
                }
            }
        }
        if (Node.Parent === null) {
            this.Root = Node;
            return Node
        }
        if (Node.Parent.Parent === null) {
            this.Root = Node.Parent;
            return Node
        }
        return Node;
    }

    /*
    search(key) {
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
        return Node;
    }
    */

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

