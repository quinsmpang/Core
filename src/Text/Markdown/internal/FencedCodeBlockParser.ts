import {AbstractBlockParser} from '../parser/block/AbstractBlockParser';
import {FencedCodeBlock} from '../node/FencedCodeBlock';
import {StringBuilder} from '../../../Core/Text/StringBuilder';
import {Block} from '../node/Block';
import {BlockContinue} from '../parser/block/BlockContinue';
import {ParserState} from '../parser/block/ParserState';
import {AbstractBlockParserFactory} from '../parser/block/AbstractBlockParserFactory';
import {BlockStart} from '../parser/block/BlockStart';
import {MatchedBlockParser} from '../parser/block/MatchedBlockParser';
import {Escaping} from './util/Escaping';


export class FencedCodeBlockParser extends AbstractBlockParser {

    private static OPENING_FENCE: RegExp = /^`{3,}(?!.*`)|^~{3,}(?!.*~)/;
    private static CLOSING_FENCE: RegExp = /^(?:`{3,}|~{3,})(?= *$)/;

    private block: FencedCodeBlock = new FencedCodeBlock();

    private firstLine: string;
    private otherLines: StringBuilder = new StringBuilder();

    public constructor(fenceChar: string, fenceLength: number, fenceIndent: number) {
        super();
        this.block.setFenceChar(fenceChar);
        this.block.setFenceLength(fenceLength);
        this.block.setFenceIndent(fenceIndent);
    }

    public getBlock(): Block {
        return this.block;
    }

    public tryContinue(state: ParserState): BlockContinue {
        let nextNonSpace: number = state.getNextNonSpaceIndex();
        let newIndex: number = state.getIndex();
        let line: string = state.getLine();
        let matcher: RegExpExecArray;
        let matches: boolean = (state.getIndent() <= 3 &&
        nextNonSpace < line.length &&
        line.charAt(nextNonSpace) === this.block.getFenceChar() &&
        (matcher = FencedCodeBlockParser.CLOSING_FENCE.exec(line.substring(nextNonSpace))) != null);
        if (matches && matcher[0].length >= this.block.getFenceLength()) {
            // closing fence - we're at end of line, so we canize now
            return BlockContinue.finished();
        } else {
            // skip optional spaces of fence indent
            let i: number = this.block.getFenceIndent();
            while (i > 0 && newIndex < line.length && line.charAt(newIndex) === ' ') {
                newIndex++;
                i--;
            }
        }
        return BlockContinue.atIndex(newIndex);
    }

    public addLine(line: string): void {
        if (this.firstLine == null) {
            this.firstLine = line;
        } else {
            this.otherLines.append(line);
            this.otherLines.append('\n');
        }
    }

    public closeBlock(): void {
        // first line becomes info string
        this.block.setInfo(Escaping.unescapeString(this.firstLine.trim()));
        this.block.setLiteral(this.otherLines.toString());
    }


    public static Factory = class Factory extends AbstractBlockParserFactory {

        public tryStart(state: ParserState, matchedBlockParser: MatchedBlockParser): BlockStart {
            let nextNonSpace: number = state.getNextNonSpaceIndex();
            let line: string = state.getLine();
            let matcher: RegExpExecArray;

            if (state.getIndent() < 4 &&
                (matcher = FencedCodeBlockParser.OPENING_FENCE.exec(line.substring(nextNonSpace))) != null) {
                let fenceLength: number = matcher[0].length;
                let fenceChar: string = matcher[0].charAt(0);
                let blockParser: FencedCodeBlockParser = new FencedCodeBlockParser(
                    fenceChar, fenceLength, state.getIndent()
                );
                return BlockStart.of(blockParser).atIndex(nextNonSpace + fenceLength);
            } else {
                return BlockStart.none();
            }
        }
    }
}
