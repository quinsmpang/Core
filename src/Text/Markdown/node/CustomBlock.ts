import {Block} from './Block';
import {Visitor} from './Visitor';


export abstract class CustomBlock extends Block {

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }
}
