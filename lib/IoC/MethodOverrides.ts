import Enumerable from '../Collections/Enumerable';
import {assertArgumentNotNull} from '../../Assertion/Assert';
import {MethodOverride} from './MethodOverride';
import List from '../Collections/List';
import {IEnumerable} from '../Collections/IEnumerable';
import MethodInfo from '../Reflection/MethodInfo';


export default class MethodOverrides extends Enumerable<MethodOverride> {
    private _overrides: List<MethodOverride> = new List<MethodOverride>();


    public add(methodOverride: MethodOverride): void {
        assertArgumentNotNull('methodOverride', methodOverride);

        this._overrides.add(methodOverride);
    }


    public addRange(methodOverrides: IEnumerable<MethodOverride>): void {
        assertArgumentNotNull('methodOverrides', methodOverrides);

        this._overrides.addRange(methodOverrides);
    }


    public getOverride(methodInfo: MethodInfo): MethodOverride {
        return this._overrides.first((methodOverride: MethodOverride): boolean => {
            return methodOverride.matches(methodInfo);
        });
    }


    public hasOverride(methodInfo: MethodInfo): boolean {
        let methodOverride: MethodOverride = this.getOverride(methodInfo);

        return methodOverride != null;
    }


    public getIterator(): Iterator<MethodOverride> {
        return this._overrides.getIterator();
    }
}
