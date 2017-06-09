import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {ListItem} from '../node/ListItem';
import {Block} from '../node/Block';
import {BlockContinue} from '../parser/block/BlockContinue';
import {ParserState} from '../parser/block/ParserState';


export class ListItemParser extends AbstractBlockParser {

    private readonly block: ListItem = new ListItem();

    /**
     * Minimum number of columns that the content has to be indented (relative to the containing block) to be part of
     * this list item.
     */
    private contentIndent: number;


    public constructor(contentIndent: number) {
        super();
        this.contentIndent = contentIndent;
    }


    public isContainer(): boolean {
        return true;
    }


    public canContain(block: Block): boolean {
        return true;
    }


    public getBlock(): Block {
        return this.block;
    }


    public tryContinue(state: ParserState): BlockContinue {
        if (state.isBlank()) {
            if (this.block.getFirstChild() == null) {
                // Blank line after empty list item
                return BlockContinue.none();
            } else {
                return BlockContinue.atIndex(state.getNextNonSpaceIndex());
            }
        }

        if (state.getIndent() >= this.contentIndent) {
            return BlockContinue.atColumn(state.getColumn() + this.contentIndent);
        } else {
            return BlockContinue.none();
        }
    }
}
