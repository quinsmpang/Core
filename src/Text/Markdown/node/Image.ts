import {Node} from './Node';
import {Visitor} from './Visitor';


export class Image extends Node {
    private destination: string;
    private title: string;


    public constructor(destination: string, title: string) {
        super();
        this.destination = destination;
        this.title = title;
    }

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }

    public getDestination(): string {
        return this.destination;
    }

    public setDestination(destination: string): void {
        this.destination = destination;
    }

    public getTitle(): string {
        return this.title;
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    protected toStringAttributes(): string {
        return `destination=${this.destination}, title=${this.title}`;
    }
}
