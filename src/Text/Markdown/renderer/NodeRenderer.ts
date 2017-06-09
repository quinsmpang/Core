import {Node} from '../node/Node';
import {Constructor} from '../../../Core/types';
import {IEnumerable} from '../../../Core/Collections/IEnumerable';

/**
 * A renderer for a set of node types.
 */
export interface NodeRenderer {

    /**
     * @return the types of nodes that this renderer handles
     */
    getNodeTypes(): IEnumerable<Constructor<Node>>;

    /**
     * Render the specified node.
     *
     * @param node the node to render, will be an instance of one of {@link #getNodeTypes()}
     */
    render(node: Node): void;
}
