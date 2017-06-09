import {BlockContinue} from '../parser/block/BlockContinue';


export class BlockContinueImpl extends BlockContinue {
    private _newIndex: number;
    private _newColumn: number;
    private _finalize: boolean;


    public getNewIndex(): number {
        return this._newIndex;
    }


    public getNewColumn(): number {
        return this._newColumn;
    }


    public isFinalize(): boolean {
        return this._finalize;
    }


    public constructor(newIndex: number, newColumn: number, finalize: boolean) {
        super();
        this._newIndex = newIndex;
        this._newColumn = newColumn;
        this._finalize = finalize;
    }
}
