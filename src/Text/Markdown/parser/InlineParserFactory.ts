import {InlineParserContext} from './InlineParserContext';
import {InlineParser} from './InlineParser';

/**
 * Factory for custom inline parser.
 */
export interface InlineParserFactory {
    create(inlineParserContext: InlineParserContext): InlineParser;
}
