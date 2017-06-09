import {Node} from '../../node/Node';
import {Renderer} from '../Renderer';
import {NodeRenderer} from '../NodeRenderer';
import {HtmlNodeRendererContext} from './HtmlNodeRendererContext';
import {CoreHtmlNodeRenderer} from './CoreHtmlNodeRenderer';
import {StringBuilder} from '../../../../Core/Text/StringBuilder';
import {AttributeProviderFactory} from './AttributeProviderFactory';
import {List} from '../../../../Core/Collections/List';
import {HtmlNodeRendererFactory} from './HtmlNodeRendererFactory';
import {IEnumerable} from '../../../../Core/Collections/IEnumerable';
import {Extension} from '../../Extension';
import {AttributeProviderContext} from './AttributeProviderContext';
import {NodeRendererMap} from '../../internal/renderer/NodeRendererMap';
import {AttributeProvider} from './AttributeProvider';
import {Escaping} from '../../internal/util/Escaping';
import {Dictionary} from '../../../../Core/Collections/Dictionary';
import {HtmlWriter} from './HtmlWriter';

/**
 * Renders a tree of nodes to HTML.
 * <p>
 * Start with the {@link #builder} method to configure the renderer. Example:
 * <pre><code>
 * HtmlRenderer renderer = HtmlRenderer.builder().escapeHtml(true).build();
 * renderer.render(node);
 * </code></pre>
 */
export class HtmlRenderer implements Renderer {

    private readonly _softbreak: string;
    private readonly _escapeHtml: boolean;
    private readonly _percentEncodeUrls: boolean;
    private readonly _attributeProviderFactories: List<AttributeProviderFactory>;
    private readonly _nodeRendererFactories: List<HtmlNodeRendererFactory>;


    public constructor(builder: Builder) {
        this._softbreak = builder.softbreak;
        this._escapeHtml = builder.escapeHtml;
        this._percentEncodeUrls = builder.percentEncodeUrls;
        this._attributeProviderFactories = new List<AttributeProviderFactory>(builder.attributeProviderFactories);

        this._nodeRendererFactories = new List<HtmlNodeRendererFactory>();
        this._nodeRendererFactories.addRange(builder.nodeRendererFactories);
        // Add as last. This means clients can override the rendering of core nodes if they want.
        this._nodeRendererFactories.add({
            create(context: HtmlNodeRendererContext): NodeRenderer {
                return new CoreHtmlNodeRenderer(context);
            }
        });
    }

    /**
     * Create a new builder for configuring an {@link HtmlRenderer}.
     *
     * @return a builder
     */
    public static builder(): Builder {
        return new Builder();
    }


    public render(node: Node, output: StringBuilder): void {
        let context: RendererContext = new RendererContext(new HtmlWriter(output));
        context.render(node);
    }


    public render(node: Node): string{
        let sb: StringBuilder = new StringBuilder();
        this.render(node, sb);
        return sb.toString();
    }
}


/**
 * Builder for configuring an {@link HtmlRenderer}. See methods for default configuration.
 */
export class Builder {

    private _softbreak: string = '\n';
    private _escapeHtml: boolean = false;
    private _percentEncodeUrls: boolean = false;
    private _attributeProviderFactories: List<AttributeProviderFactory> = new List<AttributeProviderFactory>();
    private _nodeRendererFactories: List<HtmlNodeRendererFactory> = new List<HtmlNodeRendererFactory>();

    /**
     * @return the configured {@link HtmlRenderer}
     */
    public build(): HtmlRenderer {
        return new HtmlRenderer(this);
    }

    /**
     * The HTML to use for rendering a softbreak, defaults to {@code "\n"} (meaning the rendered result doesn't have
     * a line break).
     * <p>
     * Set it to {@code "<br>"} (or {@code "<br />"} to make them hard breaks.
     * <p>
     * Set it to {@code " "} to ignore line wrapping in the source.
     *
     * @param softbreak HTML for softbreak
     * @return {@code this}
     */
    public softbreak(softbreak: string): Builder {
        this._softbreak = softbreak;
        return this;
    }

    /**
     * Whether {@link HtmlInline} and {@link HtmlBlock} should be escaped, defaults to {@code false}.
     * <p>
     * Note that {@link HtmlInline} is only a tag itself, not the text between an opening tag and a closing tag. So
     * markup in the text will be parsed as normal and is not affected by this option.
     *
     * @param escapeHtml true for escaping, false for preserving raw HTML
     * @return {@code this}
     */
    public escapeHtml(escapeHtml: boolean): Builder {
        this._escapeHtml = escapeHtml;
        return this;
    }

    /**
     * Whether URLs of link or images should be percent-encoded, defaults to {@code false}.
     * <p>
     * If enabled, the following is done:
     * <ul>
     * <li>Existing percent-encoded parts are preserved (e.g. "%20" is kept as "%20")</li>
     * <li>Reserved characters such as "/" are preserved, except for "[" and "]" (see encodeURI in JS)</li>
     * <li>Unreserved characters such as "a" are preserved</li>
     * <li>Other characters such umlauts are percent-encoded</li>
     * </ul>
     *
     * @param percentEncodeUrls true to percent-encode, false for leaving as-is
     * @return {@code this}
     */
    public percentEncodeUrls(percentEncodeUrls: boolean): Builder {
        this._percentEncodeUrls = percentEncodeUrls;
        return this;
    }

    /**
     * Add a factory for an attribute provider for adding/changing HTML attributes to the rendered tags.
     *
     * @param attributeProviderFactory the attribute provider factory to add
     * @return {@code this}
     */
    public attributeProviderFactory(attributeProviderFactory: AttributeProviderFactory): Builder {
        this._attributeProviderFactories.add(attributeProviderFactory);
        return this;
    }

    /**
     * Add a factory for instantiating a node renderer (done when rendering). This allows to override the rendering
     * of node types or define rendering for custom node types.
     * <p>
     * If multiple node renderers for the same node type are created, the one from the factory that was added first
     * "wins". (This is how the rendering for core node types can be overridden; the default rendering comes last.)
     *
     * @param nodeRendererFactory the factory for creating a node renderer
     * @return {@code this}
     */
    public nodeRendererFactory(nodeRendererFactory: HtmlNodeRendererFactory): Builder {
        this._nodeRendererFactories.add(nodeRendererFactory);
        return this;
    }

    /**
     * @param extensions extensions to use on this HTML renderer
     * @return {@code this}
     */
    public extensions(extensions: IEnumerable<Extension>): Builder {
        for (let extension of extensions) {
            if ('extend' in extension) {
                (extension as HtmlRendererExtension).extend(this);
            }
        }
        return this;
    }
}

/**
 * Extension for {@link HtmlRenderer}.
 */
export interface HtmlRendererExtension extends Extension {
    extend(rendererBuilder: Builder): void;
}


class RendererContext implements HtmlNodeRendererContext, AttributeProviderContext {
    // TODO: bypass from context
    public attributeProviderFactories: List<AttributeProviderFactory>;
    public nodeRendererFactories: List<HtmlNodeRendererFactory>;
    public escapeHtml: boolean;
    public percentEncodeUrls: boolean;
    public softbreak: string;


    private readonly htmlWriter: HtmlWriter;
    private readonly attributeProviders: List<AttributeProvider>;
    private readonly nodeRendererMap: NodeRendererMap = new NodeRendererMap();


    public constructor(htmlWriter: HtmlWriter) {
        this.htmlWriter = htmlWriter;

        this.attributeProviders = new List<AttributeProvider>();

        for (let attributeProviderFactory of this.attributeProviderFactories) {
            this.attributeProviders.add(attributeProviderFactory.create(this));
        }

        // The first node renderer for a node type "wins".
        for (let i = this.nodeRendererFactories.length - 1; i >= 0; i--) {
            let nodeRendererFactory: HtmlNodeRendererFactory = this.nodeRendererFactories[i];
            let nodeRenderer: NodeRenderer = nodeRendererFactory.create(this);
            this.nodeRendererMap.add(nodeRenderer);
        }
    }

    public shouldEscapeHtml(): boolean {
        return this.escapeHtml;
    }

    public encodeUrl(url: string): string {
        if (this.percentEncodeUrls) {
            return Escaping.percentEncodeUrl(url);
        } else {
            return url;
        }
    }

    public extendAttributes(
        node: Node,
        tagName: string,
        attributes: Dictionary<string, string>
    ): Dictionary<string, string> {
        let attrs: Dictionary<string, string> = new Dictionary<string, string>(attributes);
        this.setCustomAttributes(node, tagName, attrs);
        return attrs;
    }

    public getWriter(): HtmlWriter {
        return this.htmlWriter;
    }

    public getSoftbreak(): string {
        return this.softbreak;
    }

    public render(node: Node): void {
        this.nodeRendererMap.render(node);
    }

    private setCustomAttributes(node: Node, tagName: string, attrs: Dictionary<string, string>): void {
        for (let attributeProvider of this.attributeProviders) {
            attributeProvider.setAttributes(node, tagName, attrs);
        }
    }
}