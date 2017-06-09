import {BlockQuote} from '../node/BlockQuote';
import {Block} from '../node/Block';
import {BlockContinue} from '../parser/block/BlockContinue';
import {ParserState} from '../parser/block/ParserState';
import {Parsing} from './util/Parsing';
import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {AbstractBlockParserFactory} from '../parser/block/AbstractBlockParserFactory';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';
import {BlockStart} from '../parser/block/BlockStart';


export class BlockQuoteParser extends AbstractBlockParser {

    private static isMarker(state: ParserState, index: number): boolean {
        let line: string = state.getLine();
        return state.getIndent() < Parsing.CODE_BLOCK_INDENT && index < line.length && line.charAt(index) === '>';
    }


    private block: BlockQuote  = new BlockQuote();


    public isContainer(): boolean {
        return true;
    }


    public canContain(block: Block): boolean {
        return true;
    }


    public getBlock(): BlockQuote {
        return this.block;
    }


    public tryContinue(state: ParserState): BlockContinue {
        let nextNonSpace: number = state.getNextNonSpaceIndex();

        if (BlockQuoteParser.isMarker(state, nextNonSpace)) {
            let newColumn: number = state.getColumn() + state.getIndent() + 1;
            // optional following space or tab
            if (Parsing.isSpaceOrTab(state.getLine(), nextNonSpace + 1)) {
                newColumn++;
            }
            return BlockContinue.atColumn(newColumn);
        } else {
            return BlockContinue.none();
        }
    }


    public static Factory = class Factory extends AbstractBlockParserFactory {
        public tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart {
            let nextNonSpace: number = state.getNextNonSpaceIndex();

            if (BlockQuoteParser.isMarker(state, nextNonSpace)) {
                let newColumn: number = state.getColumn() + state.getIndent() + 1;
                // optional following space or tab
                if (Parsing.isSpaceOrTab(state.getLine(), nextNonSpace + 1)) {
                    newColumn++;
                }
                return BlockStart.of(new BlockQuoteParser()).atColumn(newColumn);
            } else {
                return BlockStart.none();
            }
        }
    }
}
