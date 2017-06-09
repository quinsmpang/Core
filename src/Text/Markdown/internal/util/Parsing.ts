

import {StringBuilder} from '../../../../Core/Text/StringBuilder';
const TAGNAME: string = '[A-Za-z][A-Za-z0-9-]*';
const ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
const UNQUOTEDVALUE = '[^"\'=<>`\\x00-\\x20]+';
const SINGLEQUOTEDVALUE = '\'[^\']*\'';
const DOUBLEQUOTEDVALUE = '"[^"]*"';
const ATTRIBUTEVALUE = `(?:${UNQUOTEDVALUE}|${SINGLEQUOTEDVALUE}|${DOUBLEQUOTEDVALUE})`;
const ATTRIBUTEVALUESPEC = `(?:\\s*=\\s*${ATTRIBUTEVALUE})`;
const ATTRIBUTE = `(?:\\s+${ATTRIBUTENAME}${ATTRIBUTEVALUESPEC}?)`;


export class Parsing {
    public static readonly OPENTAG = `<${TAGNAME}${ATTRIBUTE}*\\s*/?>`;
    public static readonly CLOSETAG = `</${TAGNAME}\\s*[>]`;
    public static readonly CODE_BLOCK_INDENT: number = 4;


    public static columnsToNextTabStop(column: number): number {
        // Tab stop is 4
        return 4 - (column % 4);
    }


    public static findLineBreak(s: string, startIndex: number): number {
        for (let i = startIndex; i < s.length; i++) {
            switch (s.charAt(i)) {
                case '\n':
                case '\r':
                    return i;
            }
        }

        return -1;
    }


    public static isBlank(s: string): boolean {
        return this.findNonSpace(s, 0) === -1;
    }


    public static isLetter(s: string, index: number): boolean {
        let codePoint: number = s.codePointAt(index);
        return Character.isLetter(codePoint);
    }


    public static isSpaceOrTab(s: string, index: number): boolean {
        if (index < s.length) {
            switch (s.charAt(index)) {
                case ' ':
                case '\t':
                    return true;
            }
        }
        return false;
    }

    /**
     * Prepares the input line replacing {@code \0}
     */
    public static prepareLine(line: string): string {
        // Avoid building a new string in the majority of cases (no \0)
        let sb: StringBuilder = null;

        for (let i = 0; i < line.length; i++) {
            let c: string = line.charAt(i);

            switch (line.charAt(i)) {
                case '\0':
                    if (sb == null) {
                        sb = new StringBuilder('', line.length);
                        sb.append(line.substring(0, i));
                    }

                    sb.append('\uFFFD');

                    break;

                default:
                    if (sb != null) {
                        sb.append(c);
                    }
            }
        }

        if (sb != null) {
            return sb.toString();
        } else {
            return line;
        }
    }


    private static findNonSpace(s: string, startIndex: number): number {
        for (let i = startIndex; i < s.length; i++) {
            switch (s.charAt(i)) {
                case ' ':
                case '\t':
                case '\n':
                case '\u000B':
                case '\f':
                case '\r':
                    break;
                default:
                    return i;
            }
        }

        return -1;
    }
}
