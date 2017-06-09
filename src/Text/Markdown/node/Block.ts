import {Node} from './Node';
import {InvalidArgumentException} from '../../../Core/Exceptions/InvalidArgumentException';


export abstract class Block extends Node {
    // TODO: compare with source code from Atlassian repo

    protected setParent(parent: Node): void {
        if (!(parent instanceof Block)) {
            throw new InvalidArgumentException('Parent of block must also be block (can not be inline)');
        }

        super.setParent(parent);
    }
}
