import MethodInfo from '../Reflection/MethodInfo';
/**
 * Represents the override of a method on a managed object by the IoC container.
 * Note that the override mechanism is not intended as a generic means of inserting crosscutting code:
 * use AOP for that.
 */
export abstract class MethodOverride {
    protected _methodName: string;

    /**
     * The name of the method that is to be overridden.
     */
    public get methodName(): string {
        return this._methodName;
    }


    public abstract matches(methodInfo: MethodInfo): boolean;
}
