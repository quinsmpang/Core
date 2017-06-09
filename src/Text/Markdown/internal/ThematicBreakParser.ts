import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {ThematicBreak} from '../node/ThematicBreak';
import {AbstractBlockParserFactory} from '../parser/block/AbstractBlockParserFactory';
import {BlockStart} from '../parser/block/BlockStart';
import {Block} from '../node/Block';
import {ParserState} from '../parser/block/ParserState';
import {BlockContinue} from '../parser/block/BlockContinue';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';


const PATTERN: RegExp = /^(?:(?:\\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})[ \t]*$/;


export class ThematicBreakParser extends AbstractBlockParser {


    private readonly block: ThematicBreak = new ThematicBreak();


    public getBlock(): Block {
        return this.block;
    }


    public tryContinue(state: ParserState): BlockContinue {
        // a horizontal rule can never container > 1 line, so fail to match
        return BlockContinue.none();
    }


    public static Factory = class Factory extends AbstractBlockParserFactory {
        public tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart {
            if (state.getIndent() >= 4) {
                return BlockStart.none();
            }

            let nextNonSpace: number = state.getNextNonSpaceIndex();
            let line: string = state.getLine();

            if (PATTERN.matcher(line.substring(nextNonSpace)).matches()) {
                return BlockStart.of(new ThematicBreakParser()).atIndex(line.length);
            } else {
                return BlockStart.none();
            }
        }
    }
}
