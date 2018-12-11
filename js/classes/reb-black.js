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

    leftLeftCase() {
        if (this.getUncle() !== null) {
            let Parent = this.Parent;
            Parent.color = BLACK;
            let Grandparent = Parent.Parent;
            Grandparent.color = RED;

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
        }
    }

    rightRightCase() {
        if (this.getUncle() !== null) {
            let Parent = this.Parent;
            Parent.color = BLACK;
            let Grandparent = Parent.Parent;
            Grandparent.color = RED;

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
        }
    }

    leftRightCase() {
        if (this.getUncle() !== null) {
            this.color = BLACK;
            let Parent = this.Parent;
            let Grandparent = Parent.Parent;
            Grandparent.color = RED;

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
        }
    }


    rightLeftCase() {
        if (this.getUncle() !== null) {
            this.color = BLACK;
            let Parent = this.Parent;
            let Grandparent = Parent.Parent;
            Grandparent.color = RED;

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
        const Uncle = Node.getUncle();
        if (Uncle !== null) {
            if (Uncle.color === RED) {
                Node.recolor();
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
        while (Cursor !== null) {
            if (Node.key < Cursor.key) {
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
        return Node;
    }

}