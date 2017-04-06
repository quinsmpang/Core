import {Constructor} from '../types';
import {IEnumerable} from '../Collections/IEnumerable';


export interface IObjectFactory {
    /**
     *
     * @throws ArgumentNullException
     * @throws ObjectDefinitionNotFoundException
     */
    configureObject(target: object, name?: string): object;

    /**
     *
     * @throws ArgumentNullException
     * @throws ObjectDefinitionNotFoundException
     */
    getObject(name: string): object;

    /**
     *
     * @throws ArgumentNullException
     */
    containsObject(name: string): boolean;

    /**
     *
     * @throws ArgumentNullException
     * @throws ObjectDefinitionNotFoundException
     */
    getAliases(name: string): IEnumerable<string>;

    /**
     *
     * @throws ArgumentNullException
     * @throws ObjectDefinitionNotFoundException
     */
    getType(name: string): Constructor<any>;

    /**
     *
     * @throws ArgumentNullException
     * @throws ObjectDefinitionNotFoundException
     */
    isSingleton(name: string): boolean;
}
