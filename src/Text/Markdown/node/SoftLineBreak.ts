import {Node} from './Node';
import {Visitor} from './Visitor';


export class SoftLineBreak extends Node {

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }
}
