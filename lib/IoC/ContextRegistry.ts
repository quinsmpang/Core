import {IApplicationContext} from './IApplicationContext';
import List from '../Collections/List';


export default class ContextRegistry {
    public static registerContext(context: IApplicationContext): void {
        this._registeredContexts.add(context);
    }


    public static getContext<T extends IApplicationContext>(name: string): T {
        return this._registeredContexts.first((context: IApplicationContext): boolean => {
            return context.name === name;
        }) as T;
    }


    private static _registeredContexts: List<IApplicationContext> = new List<IApplicationContext>();
}
