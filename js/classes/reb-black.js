const RED = 'RED', BLACK = 'BLACK';

class RedBlackNode {

    constructor(key) {
        this.Left = null;
        this.Right = null;
        this.Parent = null;
        this.color = RED;
        this.key = key;
    }

    /**
     *
     * @returns {null|RedBlackNode}
     */
    getUncle() {
        let Node = this.Parent;
        if (Node === null) {
            return null;
        }
        Node = Node.Parent;
        if (Node === null) {
            return null;
        }
        if (Node.Left === this) {
            return Node.Right;
        } else {
            return Node.Left;
        }
    }

    recolor() {
        let Node = this;
        let Uncle = Node.getUncle();
        while (Uncle !== null && Uncle.color === RED) {
            Node.Parent.color = BLACK;
            Uncle.color = BLACK;
            Node.Parent.Parent.color = RED;
            Node = Node.Parent.Parent;
            Uncle = Node.getUncle();
        }
    }

    rightRotate() {
        if (this.getUncle() !== null) {
            let Parent = this.Parent;
            let Grandparent = Parent.Parent;

            if(Parent.Right !== null){
                Parent.Right.Parent = Grandparent;
            }
            Grandparent.Left = Parent.Right;

            Parent.Parent = Grandparent.Parent;
            if(Grandparent.Parent !== null){
                if(Grandparent.Parent.Left === Grandparent){
                    Grandparent.Parent.Left = Parent;
                }else {
                    Grandparent.Parent.Right = Parent
                }
            }

            Parent.Right = Grandparent;
            Grandparent.Parent = Parent;
        }
    }

    leftRotate() {
        if (this.getUncle() !== null) {
            let Parent = this.Parent;
            let Grandparent = Parent.Parent;

            if(Parent.Left !== null){
                Parent.Left.Parent = Grandparent;
            }
            Grandparent.Right = Parent.Left;

            Parent.Parent = Grandparent.Parent;
            if(Grandparent.Parent !== null){
                if(Grandparent.Parent.Left === Grandparent){
                    Grandparent.Parent.Left = Parent;
                }else {
                    Grandparent.Parent.Right = Parent
                }
            }

            Parent.Left = Grandparent;
            Grandparent.Parent = Parent;
        }
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
        if (Node === this.Root) {
            Node.color = BLACK;
            return Node;
        }
        const Uncle = Node.getUncle();
        if (Uncle !== null) {
            if (Uncle.color === RED) {
                Node.recolor();
            } else {
                if (Uncle.Parent.Right === Uncle) {
                    //Left Case
                    if (Node.Parent.Left === Node) {
                        //Left Left Case
                        Node.rightRotate();
                        Node.Parent.color = BLACK;
                        Node.Parent.Right.color = RED;
                    } else {
                        //Left Right Case

                    }
                } else {
                    //Right Case
                    if (Node.Parent.Right === Node) {
                        //Right Right Case
                    } else {
                        //Right Left Case
                    }
                }
            }
        }
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
            return Node;
        }
        let Cursor = this.Root;
        while (true) {
            if (Cursor.key < Node.key) {
                if (Cursor.Left === null) {
                    Cursor.Left = Node;
                    Node.Parent = Cursor;
                    return Node;
                }
                Cursor = Cursor.Left;
            } else {
                if (Cursor.Right === null) {
                    Cursor.Right = Node;
                    Node.Parent = Cursor;
                    return Node;
                }
                Cursor = Cursor.Right;
            }
        }
    }


}