import {List} from '../../../Core/Collections/List';
import {DelimiterProcessor} from './delimiter/DelimiterProcessor';

/**
 * Parameter context for custom inline parser.
 */
export interface InlineParserContext {
    getCustomDelimiterProcessors(): List<DelimiterProcessor>;
}
