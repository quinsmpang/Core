import {Block} from './Block';
import {Visitor} from './Visitor';


export class IndentedCodeBlock extends Block {

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
