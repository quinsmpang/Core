import {Text} from '../node/Text';
import {DelimiterRun} from '../parser/delimiter/DelimiterRun';

/**
 * Delimiter (emphasis, strong emphasis or custom emphasis).
 */
export class Delimiter implements DelimiterRun {

    public node: Text;
    public delimiterChar: string;

    /**
     * Can open emphasis, see spec.
     */
    public _canOpen: boolean;

    /**
     * Can close emphasis, see spec.
     */
    public _canClose: boolean;

    public previous: Delimiter;
    public next: Delimiter;

    public numDelims: number = 1;

    public constructor(node: Text, delimiterChar: string, canOpen: boolean, canClose: boolean, previous: Delimiter) {
        this.node = node;
        this.delimiterChar = delimiterChar;
        this._canOpen = canOpen;
        this._canClose = canClose;
        this.previous = previous;
    }

    public canOpen(): boolean {
        return this._canOpen;
    }

    public canClose(): boolean {
        return this._canClose;
    }

    public length(): number {
        return this.numDelims;
    }
}
