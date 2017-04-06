import {IObjectFactory} from './IObjectFactory';
import {IObjectDefinition} from './IObjectDefinition';
import {IEnumerable} from '../Collections/IEnumerable';
import {Constructor} from '../types';
import {IDictionary} from '../Collections/IDictionary';


export interface IListableObjectFactory extends IObjectFactory {
    /**
     * Return the number of objects defined in the factory.
     */
    objectDefinitionCount: number;

    /**
     * Check if this object factory contains an object definition with the given name.
     */
    containsObjectDefinition(name: string): boolean;

    /**
     * Return the registered IObjectDefinition for the given object,
     * allowing access to its property values and constructor argument values.
     */
    getObjectDefinition(name: string): IObjectDefinition;

    /**
     * Return the names of all objects defined in this factory.
     */
    getObjectDefinitionNames(): IEnumerable<string>;

    /**
     * Return the names of all objects defined in this factory.
     */
    getObjectNamesForType(type: Constructor<any>): IEnumerable<string>;

    /**
     * Return the object instances that match the given object type.
     */
    getObjectsOfType(type: Constructor<any>): IDictionary<string, object>;
}

