import {Text} from '../node/Text';
import {Delimiter} from './Delimiter';

/**
 * Opening bracket for links (<code>[</code>) or images (<code>![</code>).
 */
export class Bracket {

    public static link(node: Text, index: number, previous: Bracket, previousDelimiter: Delimiter): Bracket {
        return new Bracket(node, index, previous, previousDelimiter, false);
    }

    public static image(node: Text, index: number, previous: Bracket, previousDelimiter: Delimiter): Bracket {
        return new Bracket(node, index, previous, previousDelimiter, true);
    }

    public node: Text;
    public index: number;
    public image: boolean;

    /**
     * Previous bracket.
     */
    public previous: Bracket;

    /**
     * Previous delimiter (emphasis, etc) before this bracket.
     */
    public previousDelimiter: Delimiter;

    /**
     * Whether this bracket is allowed to form a link/image (also known as "active").
     */
    public allowed: boolean = true;

    /**
     * Whether there is an unescaped bracket (opening or closing) anywhere after this opening bracket.
     */
    public bracketAfter: boolean = false;

    private constructor(node: Text, index: number, previous: Bracket, previousDelimiter: Delimiter, image: boolean) {
        this.node = node;
        this.index = index;
        this.image = image;
        this.previous = previous;
        this.previousDelimiter = previousDelimiter;
    }
}
