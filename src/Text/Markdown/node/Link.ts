import {Node} from './Node';
import {Visitor} from './Visitor';

/**
 * A link with a destination and an optional title; the link text is in child nodes.
 * <p>
 * Example for an inline link in a CommonMark document:
 * <pre><code>
 * [link](/uri "title")
 * </code></pre>
 * <p>
 * The corresponding Link node would look like this:
 * <ul>
 * <li>{@link #getDestination()} returns {@code "/uri"}
 * <li>{@link #getTitle()} returns {@code "title"}
 * <li>A {@link Text} child node with {@link Text#getLiteral() getLiteral} that returns {@code "link"}</li>
 * </ul>
 * <p>
 * Note that the text in the link can contain inline formatting, so it could also contain an {@link Image} or
 * {@link Emphasis}, etc.
 *
 * @see <a href="http://spec.commonmark.org/0.26/#links">CommonMark Spec for links</a>
 */
export class Link extends Node {

    private destination: string;
    private title: string;


    public constructor(destination: string, title: string) {
        super();
        this.destination = destination;
        this.title = title;
    }

    public accept(visitor: Visitor ): void {
        visitor.visit(this);
    }

    public getDestination(): string {
        return this.destination;
    }

    public setDestination(destination: string): void {
        this.destination = destination;
    }

    public getTitle(): string {
        return this.title;
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    protected toStringAttributes(): string {
        return `destination=${this.destination}, title=${this.title}`;
    }
}
