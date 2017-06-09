
/**
 * A node that uses delimiters in the source form (e.g. <code>*bold*</code>).
 */
export interface Delimited {

    /**
     * @return the opening (beginning) delimiter, e.g. <code>*</code>
     */
    getOpeningDelimiter(): string;

    /**
     * @return the closing (ending) delimiter, e.g. <code>*</code>
     */
    getClosingDelimiter(): string;
}
