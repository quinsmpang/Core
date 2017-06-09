import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {IndentedCodeBlock} from '../node/IndentedCodeBlock';
import {BlockContent} from './BlockContent';
import {BlockContinue} from '../parser/block/BlockContinue';
import {AbstractBlockParserFactory} from '../parser/block/AbstractBlockParserFactory';
import {BlockStart} from '../parser/block/BlockStart';
import {Block} from '../node/Block';
import {ParserState} from '../parser/block/ParserState';
import {Parsing} from './util/Parsing';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';
import {Paragraph} from '../node/Paragraph';

const TRAILING_BLANK_LINES: RegExp = /(?:\n[ \t]*)+$/;


export class IndentedCodeBlockParser extends AbstractBlockParser {
    private readonly block: IndentedCodeBlock = new IndentedCodeBlock();
    private content: BlockContent = new BlockContent();


    public getBlock(): Block {
        return this.block;
    }


    public tryContinue(state: ParserState): BlockContinue {
        if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT) {
            return BlockContinue.atColumn(state.getColumn() + Parsing.CODE_BLOCK_INDENT);
        } else if (state.isBlank()) {
            return BlockContinue.atIndex(state.getNextNonSpaceIndex());
        } else {
            return BlockContinue.none();
        }
    }


    public addLine(line: string): void {
        this.content.add(line);
    }


    public closeBlock(): void {
        let literal: string;
        let contentString: string;

        // add trailing newline
        this.content.add('');

        contentString = this.content.getString();

        this.content = null;

        literal = contentString.replace(TRAILING_BLANK_LINES, '\n');

        this.block.setLiteral(literal);
    }


    public static Factory = class Factory extends AbstractBlockParserFactory {

        public tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart {
            // An indented code block cannot interrupt a paragraph.
            if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT && !state.isBlank() &&
                !(state.getActiveBlockParser().getBlock() instanceof Paragraph)
            ) {
                return BlockStart
                    .of(new IndentedCodeBlockParser())
                    .atColumn(state.getColumn() + Parsing.CODE_BLOCK_INDENT);
            } else {
                return BlockStart.none();
            }
        }
    };
}

