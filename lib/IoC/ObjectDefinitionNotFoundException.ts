import Exception from '../Exceptions/Exception';


export default class ObjectDefinitionNotFoundException extends Exception {
    public constructor(name: string) {
        super(`Missing object definition for "${name}".`);
    }
}

