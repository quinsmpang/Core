import {BlockParser} from './BlockParser';
import {BlockStartImpl} from '../../internal/BlockStartImpl';

/**
 * Result object for starting parsing of a block, see static methods for constructors.
 */
export abstract class BlockStart {

    public static none(): BlockStart {
        return null;
    }

    public static of(...blockParsers: BlockParser[]): BlockStart {
        return new BlockStartImpl(...blockParsers);
    }

    public abstract atIndex(newIndex: number): BlockStart;

    public abstract atColumn(newColumn: number): BlockStart;

    public abstract replaceActiveBlockParser(): BlockStart;

}
