import {BlockParserFactory} from './BlockParserFactory';
import {ParserState} from './ParserState';
import {MatchedBlockParser} from './MatchedBlockParser';
import {BlockStart} from './BlockStart';


export abstract class AbstractBlockParserFactory implements BlockParserFactory {
    public abstract tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart;
}
