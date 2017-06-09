import {Node} from '../node/Node';


export interface Renderer {

    /**
     * Render the tree of nodes to output.
     *
     * @param node the root node
     * @param output output for rendering
     */
    render(node: Node, output: Appendable): void;

    /**
     * Render the tree of nodes to string.
     *
     * @param node the root node
     * @return the rendered string
     */
    render(node: Node): string;
}
