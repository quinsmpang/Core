import {Node} from '../node/Node';

/**
 * Parser for inline content (text, links, emphasized text, etc).
 */
export interface InlineParser {

    /**
     * @param input the content to parse as inline
     * @param node the node to append resulting nodes to (as children)
     */
    parse(input: string, node: Node): void;
}
