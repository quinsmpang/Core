import {Text} from '../../node/Text';
import {DelimiterRun} from './DelimiterRun';

/**
 * Custom delimiter processor for additional delimiters besides {@code _} and {@code *}.
 * <p>
 * Note that implementations of this need to be thread-safe, the same instance may be used by multiple parsers.
 */
export interface DelimiterProcessor {

    /**
     * @return the character that marks the beginning of a delimited node, must not clash with any built-in special
     * characters
     */
    getOpeningCharacter(): string;

    /**
     * @return the character that marks the the ending of a delimited node, must not clash with any built-in special
     * characters. Note that for a symmetric delimiter such as "*", this is the same as the opening.
     */
    getClosingCharacter(): string;

    /**
     * Minimum number of delimiter characters that are needed to activate this. Must be at least 1.
     */
    getMinLength(): number;

    /**
     * Determine how many (if any) of the delimiter characters should be used.
     * <p>
     * This allows implementations to decide how many characters to use based on the properties of the delimiter runs.
     * An implementation can also return 0 when it doesn't want to allow this particular combination of delimiter runs.
     *
     * @param opener the opening delimiter run
     * @param closer the closing delimiter run
     * @return how many delimiters should be used; must not be greater than length of either opener or closer
     */
    getDelimiterUse(opener: DelimiterRun, closer: DelimiterRun): number;

    /**
     * Process the matched delimiters, e.g. by wrapping the nodes between opener and closer in a new node, or appending
     * a new node after the opener.
     * <p>
     * Note that removal of the delimiter from the delimiter nodes and unlinking them is done by the caller.
     *
     * @param opener the text node that contained the opening delimiter
     * @param closer the text node that contained the closing delimiter
     * @param delimiterUse the number of delimiters that were used
     */
    process(opener: Text, closer: Text, delimiterUse: number): void;

}
