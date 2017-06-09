import {BlockParser} from './BlockParser';

/**
 * Open block parser that was last matched during the continue phase. This is different from the currently active
 * block parser, as an unmatched block is only closed when a new block is started.
 * <p><em>This interface is not intended to be implemented by clients.</em></p>
 */
export interface MatchedBlockParser {

    getMatchedBlockParser(): BlockParser;

    /**
     * Returns the current content of the paragraph if the matched block is a paragraph. The content can be multiple
     * lines separated by {@code '\n'}.
     *
     * @return paragraph content or {@code null}
     */
    getParagraphContent(): string;
}
