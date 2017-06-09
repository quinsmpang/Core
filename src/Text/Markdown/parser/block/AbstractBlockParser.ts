import {BlockParser} from './BlockParser';
import {InlineParser} from '../InlineParser';
import {Block} from '../../node/Block';
import {ParserState} from './ParserState';
import {BlockContinue} from './BlockContinue';


export abstract class AbstractBlockParser implements BlockParser {

    public isContainer(): boolean {
        return false;
    }


    public canContain(block: Block): boolean {
        return false;
    }


    public addLine(line: string): void {

    }


    public closeBlock(): void {

    }


    public abstract getBlock(): Block;
    public abstract tryContinue(parserState: ParserState): BlockContinue;


    public parseInlines(inlineParser: InlineParser): void {

    }
}
