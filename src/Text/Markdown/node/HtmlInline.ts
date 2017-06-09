import {Node} from './Node';
import {Visitor} from './Visitor';

/**
 * Inline HTML element.
 *
 * @see <a href="http://spec.commonmark.org/0.24/#raw-html">CommonMark Spec</a>
 */
export class HtmlInline extends Node {

    private literal: string;

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }

    public getLiteral(): string {
        return this.literal;
    }

    public setLiteral(literal: string): void {
        this.literal = literal;
    }
}
