
/**
 * A delimiter run is one or more of the same delimiter character.
 */
export interface DelimiterRun {

    /**
     * @return whether this can open a delimiter
     */
    canOpen(): boolean;

    /**
     * @return whether this can close a delimiter
     */
    canClose(): boolean;

    /**
     * @return the number of characters in this delimiter run (that are left for processing)
     */
    length(): number;
}
