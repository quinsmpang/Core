import {BlockContinueImpl} from '../../internal/BlockContinueImpl';

/**
 * Result object for continuing parsing of a block, see static methods for constructors.
 */
export class BlockContinue {

    public static none(): BlockContinue {
        return null;
    }


    public static atIndex(newIndex: number): BlockContinue {
        return new BlockContinueImpl(newIndex, -1, false);
    }


    public static atColumn(newColumn: number): BlockContinue {
        return new BlockContinueImpl(-1, newColumn, false);
    }


    public static finished(): BlockContinue {
        return new BlockContinueImpl(-1, -1, true);
    }


    protected constructor() {}
}
