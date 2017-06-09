import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {Block} from '../node/Block';
import {ListItem} from '../node/ListItem';
import {ListBlock} from '../node/ListBlock';
import {ParserState} from '../parser/block/ParserState';
import {BlockContinue} from '../parser/block/BlockContinue';
import {Parsing} from './util/Parsing';
import {OrderedList} from '../node/OrderedList';
import {BulletList} from '../node/BulletList';
import {AbstractBlockParserFactory} from '../parser/block/AbstractBlockParserFactory';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';
import {BlockStart} from '../parser/block/BlockStart';
import {BlockParser} from '../parser/block/BlockParser';
import {ListItemParser} from './ListItemParser';


const MARKER: RegExp = /^([*+-])(?= |\t|$)|^(\\d{1,9})([.)])(?= |\t|$)/;


export class ListBlockParser extends AbstractBlockParser {

    private readonly block: ListBlock;


    public constructor(block: ListBlock) {
        super();
        this.block = block;
    }


    public isContainer(): boolean {
        return true;
    }


    public canContain(block: Block): boolean {
        return block instanceof ListItem;
    }


    public getBlock(): Block {
        return this.block;
    }


    public tryContinue(state: ParserState): BlockContinue {
        // List blocks themselves don't have any markers, only list items. So try to stay in the list.
        // If there is a block start other than list item, canContain makes sure that this list is closed.
        return BlockContinue.atIndex(state.getIndex());
    }


    public setTight(tight: boolean): void {
        this.block.setTight(tight);
    }

    /**
     * Parse a list marker and return data on the marker or null.
     */
    private static parseListMarker(
        line: string,
        markerIndex: number,
        markerColumn: number,
        inParagraph: boolean
    ): ListData {
        let rest = line.substring(markerIndex);
        let matcher: Matcher = MARKER.matcher(rest);

        if (!matcher.find()) {
            return null;
        }

        let listBlock: ListBlock = this.createListBlock(matcher);

        let markerLength: number = matcher.end() - matcher.start();
        let indexAfterMarker: number = markerIndex + markerLength;
        // marker doesn't include tabs, so counting them as columns directly is ok
        let columnAfterMarker: number = markerColumn + markerLength;
        // the column within the line where the content starts
        let contentColumn: number = columnAfterMarker;

        // See at which column the content starts if there is content
        let hasContent: boolean = false;

        for (let i: number = indexAfterMarker; i < line.length; i++) {
            let c: string = line.charAt(i);
            if (c === '\t') {
                contentColumn += Parsing.columnsToNextTabStop(contentColumn);
            } else if (c === ' ') {
                contentColumn++;
            } else {
                hasContent = true;
                break;
            }
        }

        if (inParagraph) {
            // If the list item is ordered, the start number must be 1 to interrupt a paragraph.
            if (listBlock instanceof OrderedList &&
                (listBlock as OrderedList).getStartNumber() !== 1) {
                return null;
            }
            // Empty list item can not interrupt a paragraph.
            if (!hasContent) {
                return null;
            }
        }

        if (!hasContent || (contentColumn - columnAfterMarker) > Parsing.CODE_BLOCK_INDENT) {
            // If this line is blank or has a code block, default to 1 space after marker
            contentColumn = columnAfterMarker + 1;
        }

        return new ListData(listBlock, contentColumn);
    }


    private static createListBlock(matcher: Matcher): ListBlock {
        let bullet: string = matcher.group(1);
        if (bullet != null) {
            let bulletList: BulletList = new BulletList();
            bulletList.setBulletMarker(bullet.charAt(0));
            return bulletList;
        } else {
            let digit: string = matcher.group(2);
            let delim: string = matcher.group(3);
            let orderedList: OrderedList = new OrderedList();
            orderedList.setStartNumber(parseInt(digit, 10));
            orderedList.setDelimiter(delim.charAt(0));
            return orderedList;
        }
    }

    /**
     * Returns true if the two list items are of the same type,
     * with the same delimiter and bullet character. This is used
     * in agglomerating list items into lists.
     */
    private static listsMatch(a: ListBlock, b: ListBlock): boolean {
        if (a instanceof BulletList && b instanceof BulletList) {
            return this.equals(
                (a as BulletList).getBulletMarker(),
                (b as BulletList).getBulletMarker()
            );
        } else if (a instanceof OrderedList && b instanceof OrderedList) {
            return this.equals(
                (a as OrderedList).getDelimiter(),
                (b as OrderedList).getDelimiter()
            );
        }
        return false;
    }


    private static equals(a: string, b: string): boolean {
        return a != null && b != null && a === b;
    }


    public static Factory = class Factory extends AbstractBlockParserFactory {

        public tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart {
            let matched: BlockParser = matchedBlockParser.getMatchedBlockParser();

            if (state.getIndent() >= Parsing.CODE_BLOCK_INDENT && !(matched instanceof ListBlockParser)) {
                return BlockStart.none();
            }

            let markerIndex: number = state.getNextNonSpaceIndex();
            let markerColumn: number = state.getColumn() + state.getIndent();
            let inParagraph: boolean = matchedBlockParser.getParagraphContent() != null;
            let listData: ListData = ListBlockParser.parseListMarker(
                state.getLine(),
                markerIndex,
                markerColumn,
                inParagraph
            );

            if (listData == null) {
                return BlockStart.none();
            }

            let newColumn: number = listData.contentColumn;
            let listItemParser: ListItemParser = new ListItemParser(newColumn - state.getColumn());

            // prepend the list block if needed
            if (!(matched instanceof ListBlockParser) ||
                !(ListBlockParser.listsMatch((matched.getBlock() as ListBlock), listData.listBlock))
            ) {
                let listBlockParser: ListBlockParser = new ListBlockParser(listData.listBlock);

                listBlockParser.setTight(true);

                return BlockStart.of(listBlockParser, listItemParser).atColumn(newColumn);
            } else {
                return BlockStart.of(listItemParser).atColumn(newColumn);
            }
        }
    };
}


class ListData {
    public readonly listBlock: ListBlock;
    public readonly contentColumn: number;


    public constructor(listBlock: ListBlock, contentColumn: number) {
        this.listBlock = listBlock;
        this.contentColumn = contentColumn;
    }
}
