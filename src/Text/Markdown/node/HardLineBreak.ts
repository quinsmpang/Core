import {Node} from './Node';
import {Visitor} from './Visitor';


export class HardLineBreak extends Node {

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }
}
