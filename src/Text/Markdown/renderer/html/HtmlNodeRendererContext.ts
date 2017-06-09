import {Node} from '../../node/Node';
import {Dictionary} from '../../../../Core/Collections/Dictionary';


export interface HtmlNodeRendererContext {

    /**
     * @param url to be encoded
     * @return an encoded URL (depending on the configuration)
     */
    encodeUrl(url: string): string;

    /**
     * Let extensions modify the HTML tag attributes.
     *
     * @param node the node for which the attributes are applied
     * @param tagName the HTML tag name that these attributes are for (e.g. {@code h1}, {@code pre}, {@code code}).
     * @param attributes the attributes that were calculated by the renderer
     * @return the extended attributes with added/updated/removed entries
     */
    extendAttributes(node: Node, tagName: string, attributes: Dictionary<string, string>): Dictionary<string, string>;

    /**
     * @return the HTML writer to use
     */
    getWriter(): HtmlWriter;

    /**
     * @return HTML that should be rendered for a soft line break
     */
    getSoftbreak(): string;

    /**
     * Render the specified node and its children using the configured renderers. This should be used to render child
     * nodes; be careful not to pass the node that is being rendered, that would result in an endless loop.
     *
     * @param node the node to render
     */
    render(node: Node): void;

    /**
     * @return whether HTML blocks and tags should be escaped or not
     */
    shouldEscapeHtml(): boolean;
}
