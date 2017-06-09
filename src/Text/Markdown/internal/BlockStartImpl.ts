import {BlockStart} from '../parser/block/BlockStart';
import {BlockParser} from '../parser/block/BlockParser';


export class BlockStartImpl extends BlockStart {

    private blockParsers: BlockParser[];
    private newIndex: number = -1;
    private newColumn: number = -1;
    private _replaceActiveBlockParser: boolean = false;


    public constructor(...blockParsers: BlockParser[]) {
        super();
        this.blockParsers = blockParsers;
    }


    public getBlockParsers(): BlockParser[] {
        return this.blockParsers;
    }

    public getNewIndex(): number {
        return this.newIndex;
    }

    public getNewColumn(): number {
        return this.newColumn;
    }

    public isReplaceActiveBlockParser(): boolean {
        return this._replaceActiveBlockParser;
    }

    public atIndex(newIndex: number): BlockStart {
        this.newIndex = newIndex;
        return this;
    }

    public atColumn(newColumn: number): BlockStart {
        this.newColumn = newColumn;
        return this;
    }

    public replaceActiveBlockParser(): BlockStart {
        this._replaceActiveBlockParser = true;
        return this;
    }
}
