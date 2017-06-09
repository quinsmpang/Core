import {ListBlock} from './ListBlock';
import {Visitor} from './Visitor';


export class OrderedList extends ListBlock {

    private startNumber: number;
    private delimiter: string;

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }

    public getStartNumber(): number {
        return this.startNumber;
    }

    public setStartNumber(startNumber: number): void {
        this.startNumber = startNumber;
    }

    public getDelimiter(): string {
        return this.delimiter;
    }

    public setDelimiter(delimiter: string): void {
        this.delimiter = delimiter;
    }

}
