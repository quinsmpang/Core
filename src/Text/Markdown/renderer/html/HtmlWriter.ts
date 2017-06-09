import {Escaping} from '../../internal/util/Escaping';
import {Dictionary} from '../../../../Core/Collections/Dictionary';
import {StringBuilder} from '../../../../Core/Text/StringBuilder';
import {Exception} from '../../../../Core/Exceptions/Exception';


const NO_ATTRIBUTES: Dictionary<string, string> = new Dictionary<string, string>();


export class HtmlWriter {
    private readonly buffer: StringBuilder;
    private lastChar: string = '';

    public constructor(out: StringBuilder) {
        this.buffer = out;
    }

    public raw(s: string): void {
        this.append(s);
    }

    public text(text: string): void {
        this.append(Escaping.escapeHtml(text, false));
    }

    public tag(
        name: string,
        attrs: Dictionary<string, string> = NO_ATTRIBUTES,
        voidElement: boolean = false
    ): void {
        this.append('<');
        this.append(name);
        if (attrs != null && attrs.length > 0) {
            for (let attrib of attrs) {
                this.append(' ');
                this.append(Escaping.escapeHtml(attrib.key, true));
                this.append('="');
                this.append(Escaping.escapeHtml(attrib.value, true));
                this.append('"');
            }
        }
        if (voidElement) {
            this.append(' /');
        }

        this.append('>');
    }

    public line(): void {
        if (this.lastChar !== '' && this.lastChar !== '\n') {
            this.append('\n');
        }
    }

    protected append(s: string): void {
        try {
            this.buffer.append(s);
        } catch (e) {
            throw new Exception(e);
        }
        let length: number = s.length;
        if (length !== 0) {
            this.lastChar = s.charAt(length - 1);
        }
    }
}
