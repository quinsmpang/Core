import {Node} from './Node';
import {Delimited} from './Delimited';
import {Visitor} from './Visitor';


export class Emphasis extends Node implements Delimited {

    private delimiter: string;


    public constructor(delimiter: string) {
        super();
        this.delimiter = delimiter;
    }


    public setDelimiter(delimiter: string): void {
        this.delimiter = delimiter;
    }


    public getOpeningDelimiter(): string {
        return this.delimiter;
    }


    public getClosingDelimiter(): string {
        return this.delimiter;
    }


    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }
}
