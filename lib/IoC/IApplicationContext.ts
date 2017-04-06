import {IListableObjectFactory} from './IListableObjectFactory';
import EventEmitter from '../Events/EventEmitter';


export interface IApplicationContext extends EventEmitter, IListableObjectFactory {
    name: string;
}

