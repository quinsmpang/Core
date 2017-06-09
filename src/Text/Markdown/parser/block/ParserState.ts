
import {BlockParser} from './BlockParser';
/**
 * State of the parser that is used in block parsers.
 * <p><em>This interface is not intended to be implemented by clients.</em></p>
 */
export interface ParserState {

    /**
     * @return the current line
     */
    getLine(): string;

    /**
     * @return the current index within the line (0-based)
     */
    getIndex(): number;

    /**
     * @return the index of the next non-space character starting from {@link #getIndex()} (may be the same) (0-based)
     */
    getNextNonSpaceIndex(): number;

    /**
     * The column is the position within the line after tab characters have been processed as 4-space tab stops.
     * If the line doesn't contain any tabs, it's the same as the {@link #getIndex()}. If the line starts with a tab,
     * followed by text, then the column for the first character of the text is 4 (the index is 1).
     *
     * @return the current column within the line (0-based)
     */
    getColumn(): number;

    /**
     * @return the indentation in columns (either by spaces or tab stop of 4), starting from {@link #getColumn()}
     */
    getIndent(): number;

    /**
     * @return true if the current line is blank starting from the index
     */
    isBlank(): boolean;

    /**
     * @return the deepest open block parser
     */
    getActiveBlockParser(): BlockParser;
}
