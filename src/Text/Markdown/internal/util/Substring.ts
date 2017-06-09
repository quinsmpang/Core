import {IndexOutOfBoundsException} from '../../../../Core/Exceptions/IndexOutOfBoundsException';

/**
 * A CharSequence that avoids copying string data when getting a substring.
 */
export class Substring extends String {

    public static of(base: string, beginIndex: number, endIndex: number): Substring {
        return new Substring(base, beginIndex, endIndex);
    }

    private base: string;
    private beginIndex: number;
    private endIndex: number;

    private constructor(base: string, beginIndex: number, endIndex: number) {
        super();
        if (beginIndex < 0) {
            throw new IndexOutOfBoundsException('beginIndex must be at least 0');
        }
        if (endIndex < 0) {
            throw new IndexOutOfBoundsException('endIndex must be at least 0');
        }
        if (endIndex < beginIndex) {
            throw new IndexOutOfBoundsException('endIndex must not be less than beginIndex');
        }
        if (endIndex > base.length) {
            throw new IndexOutOfBoundsException('endIndex must not be greater than length');
        }
        this.base = base;
        this.beginIndex = beginIndex;
        this.endIndex = endIndex;
    }

    public get length(): number {
        return this.endIndex - this.beginIndex;
    }

    public charAt(index: number): string {
        if (index < 0 || this.beginIndex + index >= this.endIndex) {
            throw new IndexOutOfBoundsException('String index out of range: ' + index);
        }
        return super.charAt(index + this.beginIndex);
    }

    public subSequence(start: number, end: number): Substring {
        if (start < 0 || this.beginIndex + start > this.endIndex) {
            throw new IndexOutOfBoundsException('String index out of range: ' + start);
        }
        if (end < 0 || this.beginIndex + end > this.endIndex) {
            throw new IndexOutOfBoundsException('String index out of range: ' + end);
        }
        return new Substring(this.base, this.beginIndex + start, this.beginIndex + end);
    }

    public toString(): string {
        return super.substring(this.beginIndex, this.endIndex);
    }
}
