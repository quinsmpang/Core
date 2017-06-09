import {Block} from './Block';
import {Visitor} from './Visitor';


export class FencedCodeBlock extends Block {

    private fenceChar: string;
    private fenceLength: number;
    private fenceIndent: number;

    private info: string;
    private literal: string;

    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }

    public getFenceChar(): string {
        return this.fenceChar;
    }

    public setFenceChar(fenceChar: string): void {
        this.fenceChar = fenceChar;
    }

    public getFenceLength(): number {
        return this.fenceLength;
    }

    public setFenceLength(fenceLength: number): void {
        this.fenceLength = fenceLength;
    }

    public getFenceIndent(): number {
        return this.fenceIndent;
    }

    public setFenceIndent(fenceIndent: number): void {
        this.fenceIndent = fenceIndent;
    }

    /**
     * @see <a href="http://spec.commonmark.org/0.18/#info-string">CommonMark spec</a>
     */
    public getInfo(): string {
        return this.info;
    }

    public setInfo(info: string): void {
        this.info = info;
    }

    public getLiteral(): string {
        return this.literal;
    }

    public setLiteral(literal: string): void {
        this.literal = literal;
    }
}
