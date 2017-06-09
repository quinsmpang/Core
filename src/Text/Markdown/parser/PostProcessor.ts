export {Node} from '../node/Node';


export interface PostProcessor {

    /**
     * @param node the node to post-process
     * @return the result of post-processing, may be a modified {@code node} argument
     */
    process(node: Node): Node;
}
