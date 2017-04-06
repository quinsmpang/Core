import {AutoWiringMode} from './AutoWiringMode';
import ConstructorArgumentValues from './ConstructorArgumentValues';
import {DependencyCheckingMode} from './DependencyCheckingMode';
import {IEnumerable} from '../Core/Collections/IEnumerable';
import EventHandler from '../Core/Events/EventHandler';
import MethodOverrides from './MethodOverrides';


export interface IObjectDefinition {
    /**
     * The auto wire mode as specified in the object definition.
     * This determines whether any automatic detection and setting of object references will happen.
     * Default is No, which means there's no auto wire.
     */
    readonly autoWireMode: AutoWiringMode;

    /**
     * Return the constructor argument values for this object.
     */
    readonly constructorArgumentValues: ConstructorArgumentValues;

    /**
     * The dependency check code.
     */
    readonly dependencyCheck: DependencyCheckingMode;

    /**
     * The object names that this object depends on.
     * The object factory will guarantee that these objects get initialized before.
     * Note that dependencies are normally expressed through object properties or constructor arguments.
     * This property should just be necessary for other kinds of dependencies like statics
     * or database preparation on startup.
     */
    readonly dependsOn: IEnumerable<string>;

    /**
     * Return the name of the destroy method.
     * The default is a null reference, in which case there is no destroy method.
     */
    readonly destroyMethodName: string;

    /**
     * Return the event handlers for any events exposed by this object.
     */
    readonly eventHandlers: IEnumerable<EventHandler>;

    /**
     * The name of the factory method to use (if any).
     * This method will be invoked with constructor arguments, or with no arguments if none are specified.
     * The static method will be invoked on the specified ObjectType.
     */
    readonly factoryMethodName: string;

    /**
     * The name of the factory object to use (if any).
     */
    readonly factoryObjectName: string;

    /**
     * The name of the initializer method.
     * The default is a null reference, in which case there is no initializer method.
     */
    readonly initMethodName: string;

    /**
     * Is this object definition "abstract",
     * i.e. not meant to be instantiated itself but rather just serving as parent for concrete child object definitions.
     */
    readonly isAbstract: boolean;

    /**
     * Is this object lazily initialized?
     * Only applicable to a singleton object.
     * If false, it will get instantiated on startup by object factories that perform eager
     * initialization of singletons.
     */
    readonly isLazyInit: boolean;

    /**
     * Return whether this a Singleton, with a single, shared instance returned on all calls.
     * If false, an object factory will apply the Prototype design pattern,
     * with each caller requesting an instance getting an independent instance.
     * How this is defined will depend on the object factory implementation.
     * Singletons are the commoner type.
     */
    readonly isSingleton: boolean;

    /**
     * The method overrides (if any) for this object;
     * may be an empty collection but is guaranteed not to be a null reference.
     */
    readonly methodOverrides: MethodOverrides;

    /**
     * Returns the Type of the object definition (if any).
     */
    objectType;

    /**
     * Returns the FullName of the Type of the object definition (if any).
     */
    objectTypeName;

    /**
     * Return the property values to be applied to a new instance of the object.
     */
    propertyValues;

    /**
     * Return a description of the resource that this object definition
     * came from (for the purpose of showing context in case of errors).
     */
    resourceDescription;
}
