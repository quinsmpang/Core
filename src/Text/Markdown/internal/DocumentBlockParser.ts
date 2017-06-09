import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {Block} from '../node/Block';
import {Document} from '../node/Document';
import {ParserState} from '../parser/block/ParserState';
import {BlockContinue} from '../parser/block/BlockContinue';


export class DocumentBlockParser extends AbstractBlockParser {

    private document: Document = new Document();

    public isContainer(): boolean {
        return true;
    }

    public canContain(block: Block): boolean  {
        return true;
    }

    public getBlock(): Document {
        return this.document;
    }

    public tryContinue(state: ParserState): BlockContinue {
        return BlockContinue.atIndex(state.getIndex());
    }

    public addLine(line: string): void {
    }

}
