import {Node} from '../../node/Node';
import {Text} from '../../node/Text';
import {Image} from '../../node/Image';
import {Document} from '../../node/Document';
import {AbstractVisitor} from '../../node/AbstractVisitor';
import {NodeRenderer} from '../NodeRenderer';
import {SoftLineBreak} from '../../node/SoftLineBreak';
import {StringBuilder} from '../../../../Core/Text/StringBuilder';
import {ListBlock} from '../../node/ListBlock';
import {Paragraph} from '../../node/Paragraph';
import {HardLineBreak} from '../../node/HardLineBreak';
import {Constructor} from '../../../../Core/types';
import {HashSet} from '../../../../Core/Collections/HashSet';
import {Heading} from '../../node/Heading';
import {BlockQuote} from '../../node/BlockQuote';
import {BulletList} from '../../node/BulletList';
import {FencedCodeBlock} from '../../node/FencedCodeBlock';
import {HtmlBlock} from '../../node/HtmlBlock';
import {ThematicBreak} from '../../node/ThematicBreak';
import {IndentedCodeBlock} from '../../node/IndentedCodeBlock';
import {Link} from '../../node/Link';
import {ListItem} from '../../node/ListItem';
import {OrderedList} from '../../node/OrderedList';
import {Emphasis} from '../../node/Emphasis';
import {StrongEmphasis} from '../../node/StrongEmphasis';
import {Code} from '../../node/Code';
import {HtmlInline} from '../../node/HtmlInline';
import {Dictionary} from '../../../../Core/Collections/Dictionary';
import {HtmlNodeRendererContext} from './HtmlNodeRendererContext';

/**
 * The node renderer that renders all the core nodes (comes last in the order of node renderers).
 */
export class CoreHtmlNodeRenderer extends AbstractVisitor implements NodeRenderer {
    protected readonly context: HtmlNodeRendererContext;
    private readonly html: HtmlWriter;


    public constructor(context: HtmlNodeRendererContext) {
        super();
        this.context = context;
        this.html = context.getWriter();
    }


    public getNodeTypes(): HashSet<Constructor<Node>> {
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
        } else if (node instanceof Heading) {
            let htag: string = 'h' + node.getLevel();
            this.html.line();
            this.html.tag(htag, this.getAttrs(node, htag));
            this.visitChildren(node);
            this.html.tag('/' + htag);
            this.html.line();
        } else if (node instanceof Paragraph) {
            let inTightList: boolean = this.isInTightList(node);
            if (!inTightList) {
                this.html.line();
                this.html.tag('p', this.getAttrs(node, 'p'));
            }
            this.visitChildren(node);
            if (!inTightList) {
                this.html.tag('/p');
                this.html.line();
            }
        } else if (node instanceof BlockQuote) {
            this.html.line();
            this.html.tag('blockquote', this.getAttrs(node, 'blockquote'));
            this.html.line();
            this.visitChildren(node);
            this.html.line();
            this.html.tag('/blockquote');
            this.html.line();
        } else if (node instanceof BulletList) {
            this.renderListBlock(node, 'ul', this.getAttrs(node, 'ul'));
        } else if (node instanceof FencedCodeBlock) {
            let literal: string = node.getLiteral();
            let attributes: Dictionary<string, string> = new Dictionary<string, string>();
            let info: string = node.getInfo();
            if (info != null && info !== '') {
                let space: number = info.indexOf(' ');
                let language: string;
                if (space === -1) {
                    language = info;
                } else {
                    language = info.substring(0, space);
                }
                attributes.set('class', 'language-' + language);
            }
            this.renderCodeBlock(literal, node, attributes);
        } else if (node instanceof HtmlBlock) {
            this.html.line();
            if (this.context.shouldEscapeHtml()) {
                this.html.tag('p', this.getAttrs(node, 'p'));
                this.html.text(node.getLiteral());
                this.html.tag('/p');
            } else {
                this.html.raw(node.getLiteral());
            }
            this.html.line();
        } else if (node instanceof ThematicBreak) {
            this.html.line();
            this.html.tag('hr', this.getAttrs(node, 'hr'), true);
            this.html.line();
        } else if (node instanceof IndentedCodeBlock) {
            this.renderCodeBlock(node.getLiteral(), node, new Dictionary<string, string>());
        } else if (node instanceof Link) {
            let attrs: Dictionary<string, string> = new Dictionary<string, string>();
            let url: string = this.context.encodeUrl(node.getDestination());
            attrs.set('href', url);
            if (node.getTitle() != null) {
                attrs.set('title', node.getTitle());
            }
            this.html.tag('a', this.getAttrs(node, 'a', attrs));
            this.visitChildren(node);
            this.html.tag('/a');
        } else if (node instanceof ListItem) {
            this.html.tag('li', this.getAttrs(node, 'li'));
            this.visitChildren(node);
            this.html.tag('/li');
            this.html.line();
        } else if (node instanceof OrderedList) {
            let start: number = node.getStartNumber();
            let attrs: Dictionary<string, string> = new Dictionary<string, string>();
            if (start !== 1) {
                attrs.set('start', start.toString(10));
            }
            this.renderListBlock(node, 'ol', this.getAttrs(node, 'ol', attrs));
        } else if (node instanceof Image) {
            let url: string = this.context.encodeUrl(node.getDestination());

            let altTextVisitor: AltTextVisitor = new AltTextVisitor();
            node.accept(altTextVisitor);
            let altText: string = altTextVisitor.getAltText();

            let attrs: Dictionary<string, string> = new Dictionary<string, string>();
            attrs.set('src', url);
            attrs.set('alt', altText);
            if (node.getTitle() != null) {
                attrs.set('title', node.getTitle());
            }

            this.html.tag('img', this.getAttrs(node, 'img', attrs), true);
        } else if (node instanceof Emphasis) {
            this.html.tag('em', this.getAttrs(node, 'em'));
            this.visitChildren(node);
            this.html.tag('/em');
        } else if (node instanceof StrongEmphasis) {
            this.html.tag('strong', this.getAttrs(node, 'strong'));
            this.visitChildren(node);
            this.html.tag('/strong');
        } else if (node instanceof Text) {
            this.html.text(node.getLiteral());
        } else if (node instanceof Code) {
            this.html.tag('code', this.getAttrs(node, 'code'));
            this.html.text(node.getLiteral());
            this.html.tag('/code');
        } else if (node instanceof HtmlInline) {
            if (this.context.shouldEscapeHtml()) {
                this.html.text(node.getLiteral());
            } else {
                this.html.raw(node.getLiteral());
            }
        } else if (node instanceof SoftLineBreak) {
            this.html.raw(this.context.getSoftbreak());
        } else if (node instanceof HardLineBreak) {
            this.html.tag('br', this.getAttrs(node, 'br'), true);
            this.html.line();
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


    private renderCodeBlock(literal: string, node: Node, attributes: Dictionary<string, string>): void {
        this.html.line();
        this.html.tag('pre', this.getAttrs(node, 'pre'));
        this.html.tag('code', this.getAttrs(node, 'code', attributes));
        this.html.text(literal);
        this.html.tag('/code');
        this.html.tag('/pre');
        this.html.line();
    }


    private renderListBlock(listBlock: ListBlock, tagName: string, attributes: Dictionary<string, string>): void {
        this.html.line();
        this.html.tag(tagName, attributes);
        this.html.line();
        this.visitChildren(listBlock);
        this.html.line();
        this.html.tag('/' + tagName);
        this.html.line();
    }


    private isInTightList(paragraph: Paragraph): boolean {
        let parent: Node = paragraph.getParent();
        if (parent != null) {
            let gramps: Node  = parent.getParent();
            if (gramps != null && gramps instanceof ListBlock) {
                return gramps.isTight();
            }
        }
        return false;
    }


    private getAttrs(
        node: Node,
        tagName: string,
        defaultAttributes: Dictionary<string, string> = new Dictionary<string, string>()
    ): Dictionary<string, string> {
        return this.context.extendAttributes(node, tagName, defaultAttributes);
    }
}


class AltTextVisitor extends AbstractVisitor {
    private readonly sb: StringBuilder = new StringBuilder();


    public getAltText(): string {
        return this.sb.toString();
    }


    public visit(node: Node): void {
        if (node instanceof Text) {
            this.sb.append(node.getLiteral());
        } else if (node instanceof SoftLineBreak) {
            this.sb.append('\n');
        } else if (node instanceof HardLineBreak) {
            this.sb.append('\n');
        }
    }
}
