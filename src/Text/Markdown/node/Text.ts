import {Node} from './Node';
import {Visitor} from './Visitor';


export class Text extends Node {

    private literal: string;


    public constructor(literal: string) {
        super();
        this.literal = literal;
    }

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }

    public getLiteral(): string {
        return this.literal;
    }

    public setLiteral(literal: string): void {
        this.literal = literal;
    }

    protected toStringAttributes(): string {
        return `literal=${this.literal}`;
    }
}
