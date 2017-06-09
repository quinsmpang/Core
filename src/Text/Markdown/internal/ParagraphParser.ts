import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {Paragraph} from '../node/Paragraph';
import {BlockContent} from './BlockContent';
import {BlockContinue} from '../parser/block/BlockContinue';
import {Parsing} from './util/Parsing';
import {Block} from '../node/Block';
import {ParserState} from '../parser/block/ParserState';
import {InlineParser} from '../parser/InlineParser';
import {ReferenceParser} from './ReferenceParser';


export class ParagraphParser extends AbstractBlockParser {

    private readonly block: Paragraph = new Paragraph();
    private content: BlockContent = new BlockContent();


    public getBlock(): Block {
        return this.block;
    }


    public tryContinue(state: ParserState): BlockContinue {
        if (!state.isBlank()) {
            return BlockContinue.atIndex(state.getIndex());
        } else {
            return BlockContinue.none();
        }
    }


    public addLine(line: string): void {
        this.content.add(line);
    }


    public closeBlock(inlineParser?: ReferenceParser): void {
        if (!inlineParser) {
            return;
        }

        let contentString: string = this.content.getString();
        let hasReferenceDefs: boolean = false;
        let pos: number;

        // try parsing the beginning as link reference definitions:
        while (contentString.length > 3 && contentString.charAt(0) === '[' &&
                (pos = inlineParser.parseReference(contentString)) !== 0) {
            contentString = contentString.substring(pos);
            hasReferenceDefs = true;
        }
        if (hasReferenceDefs && Parsing.isBlank(contentString)) {
            this.block.unlink();
            this.content = null;
        } else {
            this.content = new BlockContent(contentString);
        }
    }


    public parseInlines(inlineParser: InlineParser): void {
        if (this.content != null) {
            inlineParser.parse(this.content.getString(), this.block);
        }
    }


    public getContentString(): string {
        return this.content.getString();
    }
}
