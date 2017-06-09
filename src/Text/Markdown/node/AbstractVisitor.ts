import {Node} from './Node';
import {Visitor} from './Visitor';

/**
 * Abstract visitor that visits all children by default.
 * Can be used to only process certain nodes. If you override a method and want visiting to descend into children,
 * call {@link #visitChildren}.
 */
export abstract class AbstractVisitor implements Visitor {
    public visit(node: Node): void {
        this.visitChildren(node);
    }

    /**
     * Visit the child nodes.
     *
     * @param parent The parent node whose children should be visited.
     */
    protected visitChildren(parent: Node): void {
        let node: Node = parent.getFirstChild();

        while (node != null) {
            // A subclass of this visitor might modify the node, resulting in getNext returning a different node or no
            // node after visiting it. So get the next node before visiting.
            let next: Node = node.getNext();

            node.accept(this);

            node = next;
        }
    }
}
