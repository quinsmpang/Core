import {StringBuilder} from '../../../../Core/Text/StringBuilder';


const ESCAPABLE: string = '[!\"#$%&\'()*+,./:;<=>?@\\[\\\\\\]^_`{|}~-]';
const ENTITY: string = '&(?:#x[a-f0-9]{1,8}|#[0-9]{1,8}|[a-z][a-z0-9]{1,31});';
const BACKSLASH_OR_AMP: RegExp = /[\\&]/;
const ENTITY_OR_ESCAPED_CHAR: RegExp = new RegExp('\\\\' + ESCAPABLE + '|' + ENTITY, 'i');
const XML_SPECIAL: string = '[&<>"]';
const XML_SPECIAL_RE: RegExp = new RegExp(XML_SPECIAL);
const XML_SPECIAL_OR_ENTITY: RegExp = new RegExp(ENTITY + '|' + XML_SPECIAL, 'i');

// From RFC 3986 (see "reserved", "unreserved") except don't escape '[' or ']' to be compatible with JS encodeURI
const ESCAPE_IN_URI: RegExp = /(%[a-fA-F0-9]{0,2}|[^:/?#@!$&'()*+,;=a-zA-Z0-9\-._~])/;

const HEX_DIGITS: string = '0123456789ABCDEF';
const WHITESPACE: RegExp = /[ \t\r\n]+/g;


interface IReplacer {
    replace(input: string, sb: StringBuilder): void;
}


export class Escaping {
    public static readonly ESCAPABLE: string = ESCAPABLE;

    public static readonly UNSAFE_CHAR_REPLACER: IReplacer = {
        replace(input: string, sb: StringBuilder): void {
            switch (input) {
                case '&':
                    sb.append('&amp;');
                    break;
                case '<':
                    sb.append('&lt;');
                    break;
                case '>':
                    sb.append('&gt;');
                    break;
                case '"':
                    sb.append('&quot;');
                    break;
                default:
                    sb.append(input);
            }
        }
    };

    public static readonly UNESCAPE_REPLACER: IReplacer = {
        replace(input: string, sb: StringBuilder): void {
            if (input.charAt(0) === '\\') {
                sb.append(input.slice(1));
            } else {
                sb.append(Html5Entities.entityToString(input));
            }
        }
    };

    public static readonly URI_REPLACER: IReplacer = {
        replace(input: string, sb: StringBuilder): void {
            if (input.startsWith('%')) {
                if (input.length === 3) {
                    // Already percent-encoded, preserve
                    sb.append(input);
                } else {
                    // %25 is the percent-encoding for %
                    sb.append('%25');
                    sb.append(input.slice(1));
                }
            } else {
                byte[] bytes = input.getBytes(Charset.forName("UTF-8"));
                for (byte b : bytes) {
                    sb.append('%');
                    sb.append(HEX_DIGITS[(b >> 4) & 0xF]);
                    sb.append(HEX_DIGITS[b & 0xF]);
                }
            }
        }
    };

    public static escapeHtml(input: string, preserveEntities: boolean): string {
        let p: RegExp = preserveEntities ? XML_SPECIAL_OR_ENTITY : XML_SPECIAL_RE;
        return this.replaceAll(p, input, this.UNSAFE_CHAR_REPLACER);
    }

    /**
     * Replace entities and backslash escapes with literal characters.
     */
    public static unescapeString(s: string): string {
        if (BACKSLASH_OR_AMP.test(s)) {
            return this.replaceAll(ENTITY_OR_ESCAPED_CHAR, s, this.UNESCAPE_REPLACER);
        } else {
            return s;
        }
    }

    public static percentEncodeUrl(s: string): string {
        return this.replaceAll(ESCAPE_IN_URI, s, this.URI_REPLACER);
    }

    public static normalizeReference(input: string): string {
        // Strip '[' and ']', then trim
        let stripped: string = input.substring(1, input.length - 1).trim();
        let lowercase: string = stripped.toLowerCase();
        return lowercase.replace(WHITESPACE, ' ');
    }

    private static replaceAll(p: RegExp, s: string, replacer: IReplacer): string {
        let match: RegExpExecArray = p.exec(s);

        if (!match) {
            return s;
        }

        // StringBuilder sb = new StringBuilder(s.length + 16);
        let sb: StringBuilder = new StringBuilder();
        let lastEnd: number = 0;

        do {
            sb.append(s.slice(lastEnd, match.index));
            replacer.replace(match[0], sb);
            lastEnd = match.index + match[0].length;
        } while (match = p.exec(s));

        if (lastEnd !== s.length) {
            sb.append(s.slice(lastEnd));
        }

        return sb.toString();
    }
}
