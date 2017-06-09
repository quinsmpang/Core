import {Renderer} from '../Renderer';
import {NodeRenderer} from '../NodeRenderer';
import {Node} from '../../node/Node';
import {TextContentNodeRendererContext} from './TextContentNodeRendererContext';
import {CoreTextContentNodeRenderer} from './CoreTextContentNodeRenderer';
import {TextContentWriter} from './TextContentWriter';
import {StringBuilder} from '../../../../Core/Text/StringBuilder';
import {TextContentNodeRendererFactory} from './TextContentNodeRendererFactory';
import {Extension} from '../../Extension';
import {NodeRendererMap} from '../../internal/renderer/NodeRendererMap';
import {List} from '../../../../Core/Collections/List';


export class TextContentRenderer implements Renderer {
    /**
     * Create a new builder for configuring an {@link TextContentRenderer}.
     *
     * @return a builder
     */
    public static builder(): Builder {
        return new Builder();
    }


    private readonly stripNewlines: boolean;
    private readonly nodeRendererFactories: List<TextContentNodeRendererFactory>;


    public constructor(builder: Builder) {
        this.stripNewlines = builder.stripNewlines;

        this.nodeRendererFactories = new List(builder.nodeRendererFactories.length + 1);
        this.nodeRendererFactories.addRange(builder.nodeRendererFactories);
        // Add as last. This means clients can override the rendering of core nodes if they want.
        this.nodeRendererFactories.add({
            create(context: TextContentNodeRendererContext): NodeRenderer {
                return new CoreTextContentNodeRenderer(context);
            }
        });
    }


    public render(node: Node, output: Appendable): void {
        let context: RendererContext = new RendererContext(new TextContentWriter(output));
        context.render(node);
    }


    public render(node: Node): string {
        let sb: StringBuilder = new StringBuilder();
        this.render(node, sb);
        return sb.toString();
    }
}



/**
 * Builder for configuring an {@link TextContentRenderer}. See methods for default configuration.
 */
export class Builder {

    private _stripNewlines: boolean = false;
    private _nodeRendererFactories: List<TextContentNodeRendererFactory> =
        new List<TextContentNodeRendererFactory>();

    /**
     * @return the configured {@link TextContentRenderer}
     */
    public build(): TextContentRenderer {
        return new TextContentRenderer(this);
    }

    /**
     * Set the value of flag for stripping new lines.
     *
     * @param stripNewlines true for stripping new lines and render text as "single line",
     *                      false for keeping all line breaks
     * @return {@code this}
     */
    public stripNewlines(stripNewlines: boolean): Builder {
        this._stripNewlines = stripNewlines;
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
    public nodeRendererFactory(nodeRendererFactory: TextContentNodeRendererFactory): Builder {
        this._nodeRendererFactories.add(nodeRendererFactory);
        return this;
    }

    /**
     * @param extensions extensions to use on this text content renderer
     * @return {@code this}
     */
    public extensions(extensions: Iterable<Extension>): Builder {
        for (let extension of extensions) {
            if ('extend' in extension) {
                let htmlRendererExtension: TextContentRendererExtension = extension as TextContentRendererExtension;
                htmlRendererExtension.extend(this);
            }
        }
        return this;
    }
}

/**
 * Extension for {@link TextContentRenderer}.
 */
export interface TextContentRendererExtension extends Extension {
    extend(rendererBuilder: Builder): void;
}


class RendererContext implements TextContentNodeRendererContext {
    private readonly textContentWriter: TextContentWriter;
    private readonly nodeRendererMap: NodeRendererMap = new NodeRendererMap();

    private constructor(textContentWriter: TextContentWriter) {
        this.textContentWriter = textContentWriter;

        // The first node renderer for a node type "wins".
        for (let i = nodeRendererFactories.length - 1; i >= 0; i--) {
            let nodeRendererFactory: TextContentNodeRendererFactory = nodeRendererFactories.get(i);
            let nodeRenderer: NodeRenderer = nodeRendererFactory.create(this);
            this.nodeRendererMap.add(nodeRenderer);
        }
    }


    public stripNewlines(): boolean {
        return stripNewlines;
    }


    public getWriter(): TextContentWriter {
        return this.textContentWriter;
    }


    public render(node: Node): void {
        this.nodeRendererMap.render(node);
    }
}