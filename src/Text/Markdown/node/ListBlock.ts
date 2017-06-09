import {Block} from './Block';
import {Visitor} from './Visitor';


export class ListBlock extends Block {
    private _tight: boolean;


    public accept(visitor: Visitor): void {
    }


    public isTight(): boolean {
        return this._tight;
    }


    public setTight(tight: boolean): void {
        this._tight = tight;
    }
}
