import {AttributeProviderContext} from './AttributeProviderContext';
import {AttributeProvider} from './AttributeProvider';

/**
 * Factory for instantiating new attribute providers when rendering is done.
 */
export interface AttributeProviderFactory {

    /**
     * Create a new attribute provider.
     *
     * @param context for this attribute provider
     * @return an AttributeProvider
     */
    create(context: AttributeProviderContext): AttributeProvider;
}
