import {Block} from './Block';
import {Visitor} from './Visitor';


export class BlockQuote extends Block {

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }
}
