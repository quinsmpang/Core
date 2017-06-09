import {Exception} from '../../../../Core/Exceptions/Exception';
import {StringBuilder} from '../../../../Core/Text/StringBuilder';


export class TextContentWriter {
    private readonly buffer: StringBuilder;
    private lastChar: string;


    public constructor(out: StringBuilder) {
        this.buffer = out;
    }


    public whitespace(): void {
        if (this.lastChar != null && this.lastChar !== ' ') {
            this.append(' ');
        }
    }


    public colon(): void {
        if (this.lastChar != null && this.lastChar !== ':') {
            this.append(':');
        }
    }


    public line(): void {
        if (this.lastChar != null && this.lastChar !== '\n') {
            this.append('\n');
        }
    }


    public writeStripped(s: string): void {
        this.append(s.replace(/[\r\n\s]+/g, ' ').trim());
    }


    public write(s: string): void {
        this.append(s);
    }


    private append(s: string): void {
        try {
            this.buffer.append(s);
        } catch (e) {
            throw new Exception(e.message);
        }

        let length: number = s.length;

        if (length !== 0) {
            this.lastChar = s.charAt(length - 1);
        }
    }
}
