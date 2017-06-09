import {ParserState} from '../parser/block/ParserState';
import {BlockQuote} from '../node/BlockQuote';
import {Heading} from '../node/Heading';
import {Document} from '../node/Document';
import {FencedCodeBlock} from '../node/FencedCodeBlock';
import {HtmlBlock} from '../node/HtmlBlock';
import {ThematicBreak} from '../node/ThematicBreak';
import {ListBlock} from '../node/ListBlock';
import {IndentedCodeBlock} from '../node/IndentedCodeBlock';
import {BlockParserFactory} from '../parser/block/BlockParserFactory';
import {Node} from '../node/Node';
import {Block} from '../node/Block';
import {BlockQuoteParser} from './BlockQuoteParser';
import {List} from '../../../Core/Collections/List';
import {InlineParser} from '../parser/InlineParser';
import {DocumentBlockParser} from './DocumentBlockParser';
import {BlockParser} from '../parser/block/BlockParser';
import {Constructor} from '../../../Core/types';
import {Parsing} from './util/Parsing';
import {BlockContinue} from '../parser/block/BlockContinue';
import {BlockContinueImpl} from './BlockContinueImpl';
import {Paragraph} from '../node/Paragraph';
import {BlockStartImpl} from './BlockStartImpl';
import {StringBuilder} from '../../../Core/Text/StringBuilder';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';
import {BlockStart} from '../parser/block/BlockStart';
import {ListItem} from '../node/ListItem';
import {FencedCodeBlockParser} from './FencedCodeBlockParser';
import {HtmlBlockParser} from './HtmlBlockParser';
import {HeadingParser} from './HeadingParser';
import {ParagraphParser} from './ParagraphParser';
import {ListBlockParser} from './ListBlockParser';
import {ThematicBreakParser} from './ThematicBreakParser';
import {IndentedCodeBlockParser} from './IndentedCodeBlockParser';
import {Dictionary} from '../../../Core/Collections/Dictionary';


export class DocumentParser implements ParserState {

    public static getDefaultBlockParserTypes(): List<Constructor<Block>> {
        return this.CORE_FACTORY_TYPES;
    }


    public static calculateBlockParserFactories(
        customBlockParserFactories: List<BlockParserFactory>,
        enabledBlockTypes: Set<Constructor<Block>>
    ): List<BlockParserFactory> {
        let list: List<BlockParserFactory> = new List<BlockParserFactory>();
        // By having the custom factories come first, extensions are able to change behavior of core syntax.
        list.addRange(customBlockParserFactories);

        for (let blockType of enabledBlockTypes) {
            list.add(this.NODES_TO_CORE_FACTORIES.get(blockType));
        }

        return list;
    }


    private static CORE_FACTORY_TYPES: List<Constructor<Block>> = new List<Constructor<Block>>([
        BlockQuote as Constructor<Block>,
        Heading as Constructor<Block>,
        FencedCodeBlock as Constructor<Block>,
        HtmlBlock as Constructor<Block>,
        ThematicBreak as Constructor<Block>,
        ListBlock as Constructor<Block>,
        IndentedCodeBlock as Constructor<Block>
    ]);

    private static NODES_TO_CORE_FACTORIES: Dictionary<Constructor<Node>, BlockParserFactory> = (() => {
        let map: Dictionary<Constructor<Node>, BlockParserFactory> =
            new Dictionary<Constructor<Node>, BlockParserFactory>();

        map.set(BlockQuote, new BlockQuoteParser.Factory());
        map.set(Heading, new HeadingParser.Factory());
        map.set(FencedCodeBlock, new FencedCodeBlockParser.Factory());
        map.set(HtmlBlock, new HtmlBlockParser.Factory());
        map.set(ThematicBreak, new ThematicBreakParser.Factory());
        map.set(ListBlock, new ListBlockParser.Factory());
        map.set(IndentedCodeBlock, new IndentedCodeBlockParser.Factory());

        return map;
    })();


    private line: string;

    /**
     * current index (offset) in input line (0-based)
     */
    private index: number = 0;

    /**
     * current column of input line (tab causes column to go to next 4-space tab stop) (0-based)
     */
    private column: number = 0;

    /**
     * if the current column is within a tab character (partially consumed tab)
     */
    private columnIsInTab: boolean;

    private nextNonSpace: number = 0;
    private nextNonSpaceColumn: number = 0;
    private indent: number = 0;
    private blank: boolean;

    private blockParserFactories: List<BlockParserFactory>;
    private inlineParser: InlineParser;
    private documentBlockParser: DocumentBlockParser;

    private activeBlockParsers: List<BlockParser> = new List<BlockParser>();
    private allBlockParsers: List<BlockParser> = new List<BlockParser>();
    private lastLineBlank: Dictionary<Node, boolean> = new Dictionary<Node, boolean>();


    public constructor(
        blockParserFactories: List<BlockParserFactory>,
        inlineParser: InlineParser
    ) {
        this.blockParserFactories = blockParserFactories;
        this.inlineParser = inlineParser;
        
        this.documentBlockParser = new DocumentBlockParser();
        this.activateBlockParser(this.documentBlockParser);
    }


    /**
     * The main parsing function. Returns a parsed document AST.
     */
    public parse(input: string): Document {
        let lineStart: number = 0;
        let lineBreak: number;

        while ((lineBreak = Parsing.findLineBreak(input, lineStart)) !== -1) {
            let line: string = input.substring(lineStart, lineBreak);
            this.incorporateLine(line);
            if (lineBreak + 1 < input.length &&
                input.charAt(lineBreak) === '\r' &&
                input.charAt(lineBreak + 1) === '\n'
            ) {
                lineStart = lineBreak + 2;
            } else {
                lineStart = lineBreak + 1;
            }
        }
        if (input.length > 0 && (lineStart === 0 || lineStart < input.length)) {
            this.incorporateLine(input.substring(lineStart, input.length));
        }

        return this.finalizeAndProcess();
    }
    
    // public Document parse(Reader input) throws IOException {
    //     BufferedReader bufferedReader;
    //     if (input instanceof BufferedReader) {
    //         bufferedReader = (BufferedReader) input;
    //     } else {
    //         bufferedReader = new BufferedReader(input);
    //     }
    //
    //     String line;
    //     while ((line = bufferedReader.readLine()) != null) {
    //         incorporateLine(line);
    //     }
    //
    //     return finalizeAndProcess();
    // }

    public getLine(): string {
        return this.line;
    }

    public getIndex(): number {
        return this.index;
    }

    public getNextNonSpaceIndex(): number {
        return this.nextNonSpace;
    }

    public getColumn(): number {
        return this.column;
    }

    public getIndent(): number {
        return this.indent;
    }

    public isBlank(): boolean {
        return this.blank;
    }

    public getActiveBlockParser(): BlockParser {
        return this.activeBlockParsers.lastOrDefault(null);
    }

    /**
     * Analyze a line of text and update the document appropriately. We parse markdown text by calling this on each
     * line of input, then finalizing the document.
     */
    private incorporateLine(ln: string): void {
        this.line = Parsing.prepareLine(ln);
        this.index = 0;
        this.column = 0;
        this.columnIsInTab = false;

        // For each containing block, try to parse the associated line start.
        // Bail out on failure: container will point to the last matching block.
        // Set all_matched to false if not all containers match.
        // The document will always match, can be skipped
        let matches: number = 1;

        for (let blockParser of this.activeBlockParsers.skip(1)) {
            this.findNextNonSpace();

            let result: BlockContinue = blockParser.tryContinue(this);

            if (result instanceof BlockContinueImpl) {
                let blockContinue: BlockContinueImpl = result as BlockContinueImpl;

                if (blockContinue.isFinalize()) {
                    this.finalize(blockParser);
                    return;
                } else {
                    if (blockContinue.getNewIndex() !== -1) {
                        this.setNewIndex(blockContinue.getNewIndex());
                    } else if (blockContinue.getNewColumn() !== -1) {
                        this.setNewColumn(blockContinue.getNewColumn());
                    }

                    matches++;
                }
            } else {
                break;
            }
        }

        let unmatchedBlockParsers: List<BlockParser> = new List<BlockParser>(this.activeBlockParsers.skip(matches));
        let lastMatchedBlockParser: BlockParser = this.activeBlockParsers[matches - 1];
        let blockParser: BlockParser = lastMatchedBlockParser;
        let allClosed: boolean = unmatchedBlockParsers.length === 0;

        // Unless last matched container is a code block, try new container starts,
        // adding children to the last matched container:
        let tryBlockStarts: boolean = blockParser.getBlock() instanceof Paragraph || blockParser.isContainer();

        while (tryBlockStarts) {
            this.findNextNonSpace();

            // this is a little performance optimization:
            if (this.isBlank() ||
                (this.indent < Parsing.CODE_BLOCK_INDENT &&
                Parsing.isLetter(this.line, this.nextNonSpace))
            ) {
                this.setNewIndex(this.nextNonSpace);
                break;
            }

            let blockStart: BlockStartImpl = this.findBlockStart(blockParser);
            if (blockStart == null) {
                this.setNewIndex(this.nextNonSpace);
                break;
            }

            if (!allClosed) {
                this.finalizeBlocks(unmatchedBlockParsers);
                allClosed = true;
            }

            if (blockStart.getNewIndex() !== -1) {
                this.setNewIndex(blockStart.getNewIndex());
            } else if (blockStart.getNewColumn() !== -1) {
                this.setNewColumn(blockStart.getNewColumn());
            }

            if (blockStart.isReplaceActiveBlockParser()) {
                this.removeActiveBlockParser();
            }

            for (let newBlockParser of blockStart.getBlockParsers()) {
                blockParser = this.addChild(newBlockParser);
                tryBlockStarts = newBlockParser.isContainer();
            }
        }

        // What remains at the offset is a text line. Add the text to the
        // appropriate block.

        // First check for a lazy paragraph continuation:
        if (!allClosed && !this.isBlank() &&
            this.getActiveBlockParser() instanceof ParagraphParser) {
            // lazy paragraph continuation
            this.addLine();

        } else {

            // finalize any blocks not matched
            if (!allClosed) {
                this.finalizeBlocks(unmatchedBlockParsers);
            }
            this.propagateLastLineBlank(blockParser, lastMatchedBlockParser);

            if (!blockParser.isContainer()) {
                this.addLine();
            } else if (!this.isBlank()) {
                // create paragraph container for line
                this.addChild(new ParagraphParser());
                this.addLine();
            }
        }
    }

    private findNextNonSpace(): void {
        let i: number = this.index;
        let cols: number = this.column;

        this.blank = true;
        while (i < this.line.length) {
            let c: string = this.line.charAt(i);
            switch (c) {
                case ' ':
                    i++;
                    cols++;
                    continue;
                case '\t':
                    i++;
                    cols += (4 - (cols % 4));
                    continue;
            }
            this.blank = false;
            break;
        }

        this.nextNonSpace = i;
        this.nextNonSpaceColumn = cols;
        this.indent = this.nextNonSpaceColumn - this.column;
    }

    private setNewIndex(newIndex: number): void {
        if (newIndex >= this.nextNonSpace) {
            // We can start from here, no need to calculate tab stops again
            this.index = this.nextNonSpace;
            this.column = this.nextNonSpaceColumn;
        }
        while (this.index < newIndex && this.index !== this.line.length) {
            this.advance();
        }
        // If we're going to an index as opposed to a column, we're never within a tab
        this.columnIsInTab = false;
    }

    private setNewColumn(newColumn: number): void {
        if (newColumn >= this.nextNonSpaceColumn) {
            // We can start from here, no need to calculate tab stops again
            this.index = this.nextNonSpace;
            this.column = this.nextNonSpaceColumn;
        }
        while (this.column < newColumn && this.index !== this.line.length) {
            this.advance();
        }
        if (this.column > newColumn) {
            // Last character was a tab and we overshot our target
            this.index--;
            this.column = newColumn;
            this.columnIsInTab = true;
        } else {
            this.columnIsInTab = false;
        }
    }

    private advance(): void {
        let c: string = this.line.charAt(this.index);
        if (c === '\t') {
            this.index++;
            this.column += Parsing.columnsToNextTabStop(this.column);
        } else {
            this.index++;
            this.column++;
        }
    }

    /**
     * Add line content to the active block parser. We assume it can accept lines -- that check should be done before
     * calling this.
     */
    private addLine(): void {
        let content: string;
        if (this.columnIsInTab) {
            // Our column is in a partially consumed tab. Expand the remaining columns (to the next tab stop) to spaces.
            let afterTab: number = this.index + 1;
            let rest: string = this.line.substring(afterTab);
            let spaces: number = Parsing.columnsToNextTabStop(this.column);
            let sb: StringBuilder = new StringBuilder();
            for (let i = 0; i < spaces; i++) {
                sb.append(' ');
            }
            sb.append(rest);
            content = sb.toString();
        } else {
            content = this.line.substring(this.index);
        }
        this.getActiveBlockParser().addLine(content);
    }

    private findBlockStart(blockParser: BlockParser): BlockStartImpl {
        let matchedBlockParser: MatchedBlockParser = new MatchedBlockParserImpl(blockParser);
        for (let blockParserFactory of this.blockParserFactories) {
            let result: BlockStart = blockParserFactory.tryStart(this, matchedBlockParser);
            if (result instanceof BlockStartImpl) {
                return result;
            }
        }
        return null;
    }

    /**
     * Finalize a block. Close it and do any necessary postprocessing, e.g. creating string_content from strings,
     * setting the 'tight' or 'loose' status of a list, and parsing the beginnings of paragraphs for reference
     * definitions.
     */
    private finalize(blockParser: BlockParser): void {
        if (this.getActiveBlockParser() === blockParser) {
            this.deactivateBlockParser();
        }

        blockParser.closeBlock();

        if (blockParser instanceof ParagraphParser && 'parseReference' in this.inlineParser) {
            let paragraphParser: ParagraphParser = blockParser as ParagraphParser;
            paragraphParser.closeBlock(this.inlineParser);
        } else if (blockParser instanceof ListBlockParser) {
            let listBlockParser: ListBlockParser = blockParser as ListBlockParser;
            this.finalizeListTight(listBlockParser);
        }
    }

    /**
     * Walk through a block & children recursively, parsing string content into inline content where appropriate.
     */
    private processInlines(): void {
        for (let blockParser of this.allBlockParsers) {
            blockParser.parseInlines(this.inlineParser);
        }
    }

    private finalizeListTight(listBlockParser: ListBlockParser): void {
        let item: Node = listBlockParser.getBlock().getFirstChild();
        while (item != null) {
            // check for non-list item ending with blank line:
            if (this.endsWithBlankLine(item) && item.getNext() != null) {
                listBlockParser.setTight(false);
                break;
            }
            // recurse into children of list item, to see if there are
            // spaces between any of them:
            let subItem: Node = item.getFirstChild();
            while (subItem != null) {
                if (this.endsWithBlankLine(subItem) && (item.getNext() != null || subItem.getNext() != null)) {
                    listBlockParser.setTight(false);
                    break;
                }
                subItem = subItem.getNext();
            }
            item = item.getNext();
        }
    }

    private endsWithBlankLine(block: Node): boolean {
        while (block != null) {
            if (this.isLastLineBlank(block)) {
                return true;
            }
            if (block instanceof ListBlock || block instanceof ListItem) {
                block = block.getLastChild();
            } else {
                break;
            }
        }
        return false;
    }

    /**
     * Add block of type tag as a child of the tip. If the tip can't  accept children, close and finalize it and try
     * its parent, and so on til we find a block that can accept children.
     */
    private addChild<T extends BlockParser>(blockParser: T): T {
        while (!this.getActiveBlockParser().canContain(blockParser.getBlock())) {
            this.finalize(this.getActiveBlockParser());
        }

        this.getActiveBlockParser().getBlock().appendChild(blockParser.getBlock());
        this.activateBlockParser(blockParser);

        return blockParser;
    }

    private activateBlockParser(blockParser: BlockParser): void {
        this.activeBlockParsers.add(blockParser);
        this.allBlockParsers.add(blockParser);
    }

    private deactivateBlockParser(): void {
        this.activeBlockParsers.removeAt(this.activeBlockParsers.length - 1);
    }

    private removeActiveBlockParser(): void {
        let old: BlockParser = this.getActiveBlockParser();
        this.deactivateBlockParser();
        this.allBlockParsers.remove(old);

        old.getBlock().unlink();
    }

    private propagateLastLineBlank(blockParser: BlockParser, lastMatchedBlockParser: BlockParser): void {
        if (this.isBlank() && blockParser.getBlock().getLastChild() != null) {
            this.setLastLineBlank(blockParser.getBlock().getLastChild(), true);
        }

        let block: Block = blockParser.getBlock();

        // Block quote lines are never blank as they start with `>`.
        // We don't count blanks in fenced code for purposes of tight/loose lists.
        // We also don't set lastLineBlank on an empty list item.
        let lastLineBlank: boolean = this.isBlank() &&
                !(block instanceof BlockQuote ||
                        block instanceof FencedCodeBlock ||
                        (block instanceof ListItem &&
                                block.getFirstChild() == null &&
                                blockParser !== lastMatchedBlockParser));

        // Propagate lastLineBlank up through parents
        let node: Node = blockParser.getBlock();
        while (node != null) {
            this.setLastLineBlank(node, lastLineBlank);
            node = node.getParent();
        }
    }

    private setLastLineBlank(node: Node, value: boolean): void {
        this.lastLineBlank.set(node, value);
    }

    private isLastLineBlank(node: Node): boolean {
        let value: boolean = this.lastLineBlank.get(node);
        return value != null && value;
    }

    /**
     * Finalize blocks of previous line. Returns true.
     */
    private finalizeBlocks(blockParsers: List<BlockParser>): boolean {
        for (let i = blockParsers.length - 1; i >= 0; i--) {
            let blockParser: BlockParser = blockParsers[i];
            this.finalize(blockParser);
        }
        return true;
    }

    private finalizeAndProcess(): Document {
        this.finalizeBlocks(this.activeBlockParsers);
        this.processInlines();
        return this.documentBlockParser.getBlock();
    }
}


class MatchedBlockParserImpl implements MatchedBlockParser {

    private matchedBlockParser: BlockParser;

    public constructor(matchedBlockParser: BlockParser) {
        this.matchedBlockParser = matchedBlockParser;
    }

    public getMatchedBlockParser(): BlockParser {
        return this.matchedBlockParser;
    }

    public getParagraphContent(): string {
        if (this.matchedBlockParser instanceof ParagraphParser) {
            let paragraphParser: ParagraphParser = this.matchedBlockParser as ParagraphParser;
            return paragraphParser.getContentString();
        }
        return null;
    }
}