
/**
 * The various modes of dependency checking.
 */
export enum DependencyCheckingMode {
    /** Do not do any dependency checking. */
    None,

    /** Check object references. */
    Objects,

    /** Just check primitive (string, int, etc) values. */
    Simple,

    /** Check everything. */
    All
}
