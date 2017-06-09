import {DelimiterProcessor} from '../../parser/delimiter/DelimiterProcessor';
import {Emphasis} from '../../node/Emphasis';
import {Node} from '../../node/Node';
import {Text} from '../../node/Text';
import {StrongEmphasis} from '../../node/StrongEmphasis';
import {DelimiterRun} from '../../parser/delimiter/DelimiterRun';


export abstract class EmphasisDelimiterProcessor implements DelimiterProcessor {

    private readonly delimiterChar: string;


    protected constructor(delimiterChar: string) {
        this.delimiterChar = delimiterChar;
    }


    public getOpeningCharacter(): string {
        return this.delimiterChar;
    }


    public getClosingCharacter(): string {
        return this.delimiterChar;
    }


    public getMinLength(): number {
        return 1;
    }


    public getDelimiterUse(opener: DelimiterRun, closer: DelimiterRun): number {
        // "multiple of 3" rule for internal delimiter runs
        if ((opener.canClose() || closer.canOpen()) && (opener.length() + closer.length()) % 3 === 0) {
            return 0;
        }
        // calculate actual number of delimiters used from this closer
        if (opener.length() < 3 || closer.length() < 3) {
            return closer.length() <= opener.length() ?
                    closer.length() : opener.length();
        } else {
            return closer.length() % 2 === 0 ? 2 : 1;
        }
    }


    public process(opener: Text, closer: Text, delimiterUse: number): void {
        let singleDelimiter: string = this.getOpeningCharacter();
        let emphasis: Node = delimiterUse === 1
                ? new Emphasis(singleDelimiter)
                : new StrongEmphasis(singleDelimiter + singleDelimiter);

        let tmp: Node = opener.getNext();

        while (tmp != null && tmp !== closer) {
            let next: Node = tmp.getNext();
            emphasis.appendChild(tmp);
            tmp = next;
        }

        opener.insertAfter(emphasis);
    }
}
