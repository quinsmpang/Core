import {Block} from './Block';
import {Visitor} from './Visitor';


export class Heading extends Block {

    private level: number;

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }

    public getLevel(): number {
        return this.level;
    }

    public setLevel(level: number): void {
        this.level = level;
    }
}
