import {ListBlock} from './ListBlock';
import {Visitor} from './Visitor';


export class BulletList extends ListBlock {
    private _bulletMarker: string;


    public accept(visitor: Visitor): void {
        visitor.visit(this);
    }


    public getBulletMarker(): string {
        return this._bulletMarker;
    }


    public setBulletMarker(bulletMarker: string): void {
        this._bulletMarker = bulletMarker;
    }
}
