import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {Heading} from '../node/Heading';
import {Block} from '../node/Block';
import {BlockContinue} from '../parser/block/BlockContinue';
import {ParserState} from '../parser/block/ParserState';
import {InlineParser} from '../parser/InlineParser';
import {BlockStart} from '../parser/block/BlockStart';
import {AbstractBlockParserFactory} from '../parser/block/AbstractBlockParserFactory';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';


const ATX_HEADING: RegExp = /^#{1,6}(?:[ \t]+|$)/;
const ATX_TRAILING: RegExp = /(^| ) *#+ *$/;
const SETEXT_HEADING: RegExp = /^(?:=+|-+) *$/;


export class HeadingParser extends AbstractBlockParser {

    private block: Heading = new Heading();
    private content: string;


    public constructor(level: number, content: string) {
        super();
        this.block.setLevel(level);
        this.content = content;
    }


    public getBlock(): Block {
        return this.block;
    }


    public tryContinue(parserState: ParserState): BlockContinue {
        // In both ATX and Setext headings, once we have the heading markup, there's nothing more to parse.
        return BlockContinue.none();
    }


    public parseInlines(inlineParser: InlineParser): void {
        inlineParser.parse(this.content, this.block);
    }


    public static Factory = class Factory extends AbstractBlockParserFactory {

        public tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart {
            if (state.getIndent() >= 4) {
                return BlockStart.none();
            }

            let line: string = state.getLine();
            let nextNonSpace: number = state.getNextNonSpaceIndex();
            let paragraph: string = matchedBlockParser.getParagraphContent();
            let matcher: RegExpExecArray;

            if (matcher = ATX_HEADING.exec(line.substring(nextNonSpace))) {
                // ATX heading
                let newOffset: number = nextNonSpace + matcher[0].length;
                let level: number = matcher[0].trim().length; // number of #s
                // remove trailing ###s:
                let content: string = line.substring(newOffset).replace(ATX_TRAILING, '');

                return BlockStart.of(new HeadingParser(level, content)).atIndex(line.length);
            } else if (
                paragraph != null &&
                (matcher = SETEXT_HEADING.exec(line.substring(nextNonSpace, line.length)))
            ) {
                // setext heading line

                let level: number = matcher[0].charAt(0) === '=' ? 1 : 2;
                let content: string = paragraph.toString();

                return BlockStart
                    .of(new HeadingParser(level, content))
                    .atIndex(line.length)
                    .replaceActiveBlockParser();
            } else {
                return BlockStart.none();
            }
        }
    };
}
