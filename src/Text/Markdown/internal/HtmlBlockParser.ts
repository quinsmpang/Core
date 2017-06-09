import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {Parsing} from './util/Parsing';
import {HtmlBlock} from '../node/HtmlBlock';
import {BlockContent} from './BlockContent';
import {Block} from '../node/Block';
import {ParserState} from '../parser/block/ParserState';
import {BlockContinue} from '../parser/block/BlockContinue';
import {AbstractBlockParserFactory} from '../parser/block/AbstractBlockParserFactory';
import {BlockStart} from '../parser/block/BlockStart';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';
import {Paragraph} from '../node/Paragraph';


const BLOCK_PATTERNS: RegExp[][] = [
    [null, null], // not used (no type 0)
    [
        /^<(?:script|pre|style)(?:\\s|>|$)/i,
        /<\/(?:script|pre|style)>/i
    ],
    [
        /^<!--/,
        /-->/
    ],
    [
        /^<[?]/,
        /\\?>/
    ],
    [
        /^<![A-Z]/,
        />/
    ],
    [
        /^<!\[CDATA\[/,
        /]]>/
    ],
    [
        new RegExp('^</?(?:' +
            'address|article|aside|' +
            'base|basefont|blockquote|body|' +
            'caption|center|col|colgroup|' +
            'dd|details|dialog|dir|div|dl|dt|' +
            'fieldset|figcaption|figure|footer|form|frame|frameset|' +
            'h1|h2|h3|h4|h5|h6|head|header|hr|html|' +
            'iframe|' +
            'legend|li|link|' +
            'main|menu|menuitem|meta|' +
            'nav|noframes|' +
            'ol|optgroup|option|' +
            'p|param|' +
            'section|source|summary|' +
            'table|tbody|td|tfoot|th|thead|title|tr|track|' +
            'ul' +
            ')(?:\\s|[/]?[>]|$)',
            'i'
        ),
        null // terminated by blank line
    ],
    [
        new RegExp(`^(?:${Parsing.OPENTAG}|${Parsing.CLOSETAG})\\s*$`, 'i'),
        null // terminated by blank line
    ]
];


export class HtmlBlockParser extends AbstractBlockParser {
    private block: HtmlBlock = new HtmlBlock();
    private closingPattern: RegExp;

    private finished: boolean = false;
    private content: BlockContent = new BlockContent();


    private constructor(closingPattern: RegExp) {
        super();
        this.closingPattern = closingPattern;
    }


    public getBlock(): Block {
        return this.block;
    }


    public tryContinue(state: ParserState): BlockContinue {
        if (this.finished) {
            return BlockContinue.none();
        }

        // Blank line ends type 6 and type 7 blocks
        if (state.isBlank() && this.closingPattern == null) {
            return BlockContinue.none();
        } else {
            return BlockContinue.atIndex(state.getIndex());
        }
    }


    public addLine(line: string): void {
        this.content.add(line);

        if (this.closingPattern != null && this.closingPattern.test(line)) {
            this.finished = true;
        }
    }


    public closeBlock(): void {
        this.block.setLiteral(this.content.getString());
        this.content = null;
    }


    public static Factory = class Factory extends AbstractBlockParserFactory {

        public tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart {
            let nextNonSpace: number = state.getNextNonSpaceIndex();
            let line: string = state.getLine();

            if (state.getIndent() < 4 && line.charAt(nextNonSpace) === '<') {
                for (let blockType = 1; blockType <= 7; blockType++) {
                    // Type 7 can not interrupt a paragraph
                    if (blockType === 7 && matchedBlockParser.getMatchedBlockParser().getBlock() instanceof Paragraph) {
                        continue;
                    }

                    let opener: RegExp = BLOCK_PATTERNS[blockType][0];
                    let closer: RegExp = BLOCK_PATTERNS[blockType][1];
                    let matches: boolean = opener.test(line.substring(nextNonSpace));

                    if (matches) {
                        return BlockStart.of(new HtmlBlockParser(closer)).atIndex(state.getIndex());
                    }
                }
            }

            return BlockStart.none();
        }
    };
}
