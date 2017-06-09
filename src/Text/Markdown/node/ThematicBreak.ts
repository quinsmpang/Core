import {Block} from './Block';
import {Visitor} from './Visitor';


export class ThematicBreak extends Block {

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }
}
