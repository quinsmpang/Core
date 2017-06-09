import {Node} from './Node';
import {Visitor} from './Visitor';


export abstract class CustomNode extends Node {
    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }
}
