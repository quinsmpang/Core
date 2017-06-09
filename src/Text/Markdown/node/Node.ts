import {Visitor} from './Visitor';


export abstract class Node {

    private parent: Node = null;
    private firstChild: Node = null;
    private lastChild: Node = null;
    private prev: Node = null;
    private next: Node = null;

    public abstract accept(visitor: Visitor): void;

    public getNext(): Node {
        return this.next;
    }

    public getPrevious(): Node {
        return this.prev;
    }

    public getFirstChild(): Node {
        return this.firstChild;
    }

    public getLastChild(): Node {
        return this.lastChild;
    }

    public getParent(): Node {
        return this.parent;
    }

    public appendChild(child: Node): void {
        child.unlink();
        child.setParent(this);
        if (this.lastChild != null) {
            this.lastChild.next = child;
            child.prev = this.lastChild;
            this.lastChild = child;
        } else {
            this.firstChild = child;
            this.lastChild = child;
        }
    }

    public prependChild(child: Node): void {
        child.unlink();
        child.setParent(this);
        if (this.firstChild != null) {
            this.firstChild.prev = child;
            child.next = this.firstChild;
            this.firstChild = child;
        } else {
            this.firstChild = child;
            this.lastChild = child;
        }
    }

    public unlink(): void {
        if (this.prev != null) {
            this.prev.next = this.next;
        } else if (this.parent != null) {
            this.parent.firstChild = this.next;
        }
        if (this.next != null) {
            this.next.prev = this.prev;
        } else if (this.parent != null) {
            this.parent.lastChild = this.prev;
        }
        this.parent = null;
        this.next = null;
        this.prev = null;
    }

    public insertAfter(sibling: Node): void {
        sibling.unlink();
        sibling.next = this.next;
        if (sibling.next != null) {
            sibling.next.prev = sibling;
        }
        sibling.prev = this;
        this.next = sibling;
        sibling.parent = this.parent;
        if (sibling.next == null) {
            sibling.parent.lastChild = sibling;
        }
    }

    public insertBefore(sibling: Node): void {
        sibling.unlink();
        sibling.prev = this.prev;
        if (sibling.prev != null) {
            sibling.prev.next = sibling;
        }
        sibling.next = this;
        this.prev = sibling;
        sibling.parent = this.parent;
        if (sibling.prev == null) {
            sibling.parent.firstChild = sibling;
        }
    }

    public toString(): string {
        return `${this.constructor.name}\{${this.toStringAttributes()}}`;
    }


    protected setParent(parent: Node): void {
        this.parent = parent;
    }


    protected toStringAttributes(): string {
        return '';
    }
}
