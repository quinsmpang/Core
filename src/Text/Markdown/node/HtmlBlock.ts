import {Block} from './Block';
import {Visitor} from './Visitor';

/**
 * HTML block
 *
 * @see <a href="http://spec.commonmark.org/0.18/#html-blocks">CommonMark Spec</a>
 */
export class HtmlBlock extends Block {

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
