import {BlockContinue} from './BlockContinue';
import {Block} from '../../node/Block';
import {ParserState} from './ParserState';
import {InlineParser} from '../InlineParser';


/**
 * Parser for a specific block node.
 * Implementations should subclass AbstractBlockParser instead of implementing this directly.
 */
export interface BlockParser {

    /**
     * Return true if the block that is parsed is a container (contains other blocks), or false if it's a leaf.
     */
    isContainer(): boolean;

    canContain(block: Block): boolean;

    getBlock(): Block;

    tryContinue(parserState: ParserState): BlockContinue;

    addLine(line: string): void;

    closeBlock(): void;

    parseInlines(inlineParser: InlineParser): void;
}
