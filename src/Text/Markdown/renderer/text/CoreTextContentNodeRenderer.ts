import {AbstractVisitor} from '../../node/AbstractVisitor';
import {NodeRenderer} from '../NodeRenderer';
import {HashSet} from '../../../../Core/Collections/HashSet';
import {Heading} from '../../node/Heading';
import {Paragraph} from '../../node/Paragraph';
import {BlockQuote} from '../../node/BlockQuote';
import {BulletList} from '../../node/BulletList';
import {FencedCodeBlock} from '../../node/FencedCodeBlock';
import {HtmlBlock} from '../../node/HtmlBlock';
import {ThematicBreak} from '../../node/ThematicBreak';
import {IndentedCodeBlock} from '../../node/IndentedCodeBlock';
import {Node} from '../../node/Node';
import {Text} from '../../node/Text';
import {Link} from '../../node/Link';
import {ListItem} from '../../node/ListItem';
import {OrderedList} from '../../node/OrderedList';
import {Image} from '../../node/Image';
import {Document} from '../../node/Document';
import {StrongEmphasis} from '../../node/StrongEmphasis';
import {Emphasis} from '../../node/Emphasis';
import {Code} from '../../node/Code';
import {HtmlInline} from '../../node/HtmlInline';
import {SoftLineBreak} from '../../node/SoftLineBreak';
import {HardLineBreak} from '../../node/HardLineBreak';
import {Constructor} from '../../../../Core/types';

/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 */
export class CoreTextContentNodeRenderer extends AbstractVisitor implements NodeRenderer {

    protected readonly context: TextContentNodeRendererContext;
    private readonly textContent: TextContentWriter;

    private orderedListCounter: number;
    private orderedListDelimiter: string;

    private bulletListMarker: string;


    public constructor(context: TextContentNodeRendererContext) {
        super();
        this.context = context;
        this.textContent = context.getWriter();
    }


    public getNodeTypes(): Set<Constructor<Node>> {
        return new HashSet<Constructor<Node>>([
            Document,
            Heading,
            Paragraph,
            BlockQuote,
            BulletList,
            FencedCodeBlock,
            HtmlBlock,
            ThematicBreak,
            IndentedCodeBlock,
            Link,
            ListItem,
            OrderedList,
            Image,
            Emphasis,
            StrongEmphasis,
            Text,
            Code,
            HtmlInline,
            SoftLineBreak,
            HardLineBreak
        ]);
    }


    public render(node: Node): void {
        node.accept(this);
    }


    public visit(node: Node): void {
        if (node instanceof Document) {
            // No rendering itself
            this.visitChildren(node);
        } else if (node instanceof BlockQuote) {
            this.textContent.write('«');
            this.visitChildren(node);
            this.textContent.write('»');
            this.writeEndOfLine(node, null);
        } else if (node instanceof BulletList) {
            this.bulletListMarker = node.getBulletMarker();
            this.visitChildren(node);
            this.writeEndOfLine(node, null);
            this.bulletListMarker = null;
        } else if (node instanceof Code) {
            this.textContent.write('\"');
            this.textContent.write(node.getLiteral());
            this.textContent.write('\"');
        } else if (node instanceof FencedCodeBlock) {
            if (node.stripNewlines()) {
                this.textContent.writeStripped(node.getLiteral());
                this.writeEndOfLine(node, null);
            } else {
                this.textContent.write(node.getLiteral());
            }
        } else if (node instanceof HardLineBreak) {
            this.writeEndOfLine(node, null);
        } else if (node instanceof Heading) {
            this.visitChildren(node);
            this.writeEndOfLine(node, ':');
        } else if (node instanceof ThematicBreak) {
            if (!this.context.stripNewlines()) {
                this.textContent.write('***');
            }
            this.writeEndOfLine(node, null);
        } else if (node instanceof HtmlInline) {
            this.writeText(node.getLiteral());
        } else if (node instanceof HtmlBlock) {
            this.writeText(node.getLiteral());
        } else if (node instanceof Image) {
            this.writeLink(node, node.getTitle(), node.getDestination());
        } else if (node instanceof IndentedCodeBlock) {
            if (this.context.stripNewlines()) {
                this.textContent.writeStripped(node.getLiteral());
                this.writeEndOfLine(node, null);
            } else {
                this.textContent.write(node.getLiteral());
            }
        } else if (node instanceof Link) {
            this.writeLink(node, node.getTitle(), node.getDestination());
        } else if (node instanceof ListItem) {
            if (this.orderedListCounter != null) {
                this.textContent.write(this.orderedListCounter + this.orderedListDelimiter + ' ');
                this.visitChildren(node);
                this.writeEndOfLine(node, null);
                this.orderedListCounter++;
            } else if (this.bulletListMarker != null) {
                if (!this.context.stripNewlines()) {
                    this.textContent.write(this.bulletListMarker + ' ');
                }
                this.visitChildren(node);
                this.writeEndOfLine(node, null);
            }
        } else if (node instanceof OrderedList) {
            this.orderedListCounter = node.getStartNumber();
            this.orderedListDelimiter = node.getDelimiter();
            this.visitChildren(node);
            this.writeEndOfLine(node, null);
            this.orderedListCounter = null;
            this.orderedListDelimiter = null;
        } else if (node instanceof Paragraph) {
            this.visitChildren(node);
            // Add "end of line" only if its "root paragraph.
            if (node.getParent() == null || node.getParent() instanceof Document) {
                this.writeEndOfLine(node, null);
            }
        } else if (node instanceof SoftLineBreak) {
            this.writeEndOfLine(node, null);
        } else if (node instanceof Text) {
            this.writeText(node.getLiteral());
        }
    }


    protected visitChildren(parent: Node): void {
        let node: Node = parent.getFirstChild();
        while (node != null) {
            let next: Node = node.getNext();
            this.context.render(node);
            node = next;
        }
    }


    private writeText(text: string): void {
        if (this.context.stripNewlines()) {
            this.textContent.writeStripped(text);
        } else {
            this.textContent.write(text);
        }
    }


    private writeLink(node: Node, title: string, destination: string): void {
        let hasChild: boolean = node.getFirstChild() != null;
        let hasTitle: boolean = title != null;
        let hasDestination: boolean = destination != null && destination !== '';

        if (hasChild) {
            this.textContent.write('"');
            this.visitChildren(node);
            this.textContent.write('"');
            if (hasTitle || hasDestination) {
                this.textContent.whitespace();
                this.textContent.write('(');
            }
        }

        if (hasTitle) {
            this.textContent.write(title);
            if (hasDestination) {
                this.textContent.colon();
                this.textContent.whitespace();
            }
        }

        if (hasDestination) {
            this.textContent.write(destination);
        }

        if (hasChild && (hasTitle || hasDestination)) {
            this.textContent.write(')');
        }
    }


    private writeEndOfLine(node: Node, c: string): void {
        if (this.context.stripNewlines()) {
            if (c != null) {
                this.textContent.write(c);
            }
            if (node.getNext() != null) {
                this.textContent.whitespace();
            }
        } else {
            if (node.getNext() != null) {
                this.textContent.line();
            }
        }
    }
}
