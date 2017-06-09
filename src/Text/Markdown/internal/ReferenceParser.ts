
/**
 * Parser for inline references
 */
export interface ReferenceParser {
    /**
     * @return how many characters were parsed as a reference, {@code 0} if none
     */
    parseReference(s: string): number;
}
