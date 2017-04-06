

export enum AutoWiringMode {
    /** Do not autowire. */
    No,

    /** Autowire by name. */
    ByName,

    /** Autowire by Type. */
    ByType,

    /** Autowiring by constructor. */
    Constructor,

    /** The autowiring strategy is to be determined by introspection of the object's Type. */
    AutoDetect
}

