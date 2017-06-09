import {InlineParser} from '../parser/InlineParser';
import {Escaping} from './util/Escaping';
import {Parsing} from './util/Parsing';
import {DelimiterProcessor} from '../parser/delimiter/DelimiterProcessor';
import {List} from '../../../Core/Collections/List';
import {Link} from '../node/Link';
import {Node} from '../node/Node';
import {Text} from '../node/Text';
import {Delimiter} from './Delimiter';
import {Bracket} from './Bracket';
import {InvalidArgumentException} from '../../../Core/Exceptions/InvalidArgumentException';
import {HardLineBreak} from '../node/HardLineBreak';
import {SoftLineBreak} from '../node/SoftLineBreak';
import {Code} from '../node/Code';
import {Image} from '../node/Image';
import {HtmlInline} from '../node/HtmlInline';
import {StringBuilder} from '../../../Core/Text/StringBuilder';
import {ReferenceParser} from './ReferenceParser';
import {Dictionary} from '../../../Core/Collections/Dictionary';
import {IEnumerable} from '../../../Core/Collections/IEnumerable';


const ESCAPED_CHAR: string = '\\\\' + Escaping.ESCAPABLE;
const REG_CHAR: string = '[^\\\\()\\x00-\\x20]';
const IN_PARENS_NOSP: string = `\\((${REG_CHAR}|${ESCAPED_CHAR})*\\)`;
const HTMLCOMMENT: string = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
const PROCESSINGINSTRUCTION: string = '[<][?].*?[?][>]';
const DECLARATION: string = '<![A-Z]+\\s+[^>]*>';
const CDATA: string = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';
const HTMLTAG: string = '(?:' + Parsing.OPENTAG + '|' + Parsing.CLOSETAG + '|' + HTMLCOMMENT
    + '|' + PROCESSINGINSTRUCTION + '|' + DECLARATION + '|' + CDATA + ')';
const ENTITY: string = `&(?:#x[a-f0-9]\{1,8}|#[0-9]\{1,8}|[a-z][a-z0-9]\{1,31});`;

const ASCII_PUNCTUATION: string = `'!"#\\$%&\\(\\)\\*\\+,\\-\\./:;<=>\\?@\\[\\\\\\]\\^_\`\\\{\\|\\}~`;
const PUNCTUATION: RegExp = new RegExp('^[' + ASCII_PUNCTUATION + '\\p{Pc}\\p{Pd}\\p{Pe}\\p{Pf}\\p{Pi}\\p{Po}\\p{Ps}]');

const HTML_TAG: RegExp = new RegExp('^' + HTMLTAG, 'i');

const LINK_TITLE: RegExp = new RegExp(
    '^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' +
    '|' +
    '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' +
    '|' +
    '\\((' + ESCAPED_CHAR + '|[^)\\x00])*\\))');

const LINK_DESTINATION_BRACES: RegExp = new RegExp(
    '^(?:[<](?:[^<> \\t\\n\\\\\\x00]' + '|' + ESCAPED_CHAR + '|' + '\\\\)*[>])');

const LINK_DESTINATION: RegExp = new RegExp(
    '^(?:' + REG_CHAR + '+|' + ESCAPED_CHAR + '|\\\\|' + IN_PARENS_NOSP + ')*');

const LINK_LABEL: RegExp = new RegExp('^\\[(?:[^\\\\\\[\\]]|' + ESCAPED_CHAR + '|\\\\){0,999}\\]');

const ESCAPABLE: RegExp = new RegExp('^' + Escaping.ESCAPABLE);

const ENTITY_HERE: RegExp = new RegExp('^' + ENTITY, 'i');

const TICKS: RegExp = new RegExp('`+');

const TICKS_HERE: RegExp = new RegExp('^`+');

const EMAIL_AUTOLINK: RegExp = new RegExp(
    '^<([a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}' +
    '[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>'
);

const AUTOLINK: RegExp = new RegExp('^<[a-zA-Z][a-zA-Z0-9.+-]{1,31}:[^<>\u0000-\u0020]*>');

const SPNL: RegExp = new RegExp('^ *(?:\n *)?');

const UNICODE_WHITESPACE_CHAR: RegExp = new RegExp('^[\\p{Zs}\t\r\n\f]');

const WHITESPACE: RegExp = new RegExp('\\s+');

const FINAL_SPACE: RegExp = new RegExp(' *$');

const LINE_END: RegExp = new RegExp('^ *(?:\n|$)');


export class InlineParserImpl implements InlineParser, ReferenceParser {


    public static calculateDelimiterCharacters(characters: IEnumerable<string>): BitSet {
        let bitSet: BitSet = new BitSet();

        for (let character of characters) {
            bitSet.set(character);
        }

        return bitSet;
    }

    public static calculateSpecialCharacters(delimiterCharacters: BitSet): BitSet {
        let bitSet: BitSet = new BitSet();

        bitSet.or(delimiterCharacters);
        bitSet.set('\n');
        bitSet.set('`');
        bitSet.set('[');
        bitSet.set(']');
        bitSet.set('\\');
        bitSet.set('!');
        bitSet.set('<');
        bitSet.set('&');

        return bitSet;
    }


    public static calculateDelimiterProcessors(
        delimiterProcessors: List<DelimiterProcessor>
    ): Dictionary<string, DelimiterProcessor> {
        let map: Dictionary<string, DelimiterProcessor> = new Dictionary<string, DelimiterProcessor>();
        this.addDelimiterProcessors([
            new AsteriskDelimiterProcessor(),
            new UnderscoreDelimiterProcessor()
        ], map);
        this.addDelimiterProcessors(delimiterProcessors, map);
        return map;
    }


    private static addDelimiterProcessors(
        delimiterProcessors: Iterable<DelimiterProcessor>,
        map: Dictionary<string, DelimiterProcessor>
    ): void {
        for (let delimiterProcessor of delimiterProcessors) {
            let opening: string = delimiterProcessor.getOpeningCharacter();
            this.addDelimiterProcessorForChar(opening, delimiterProcessor, map);
            let closing: string = delimiterProcessor.getClosingCharacter();
            if (opening !== closing) {
                this.addDelimiterProcessorForChar(closing, delimiterProcessor, map);
            }
        }
    }


    private static addDelimiterProcessorForChar(
        delimiterChar: string,
        toAdd: DelimiterProcessor,
        delimiterProcessors: Dictionary<string, DelimiterProcessor>
    ): void {
        let existing: boolean = delimiterProcessors.containsKey(delimiterChar);

        if (existing) {
            throw new InvalidArgumentException(`Delimiter processor conflict with delimiter char '${delimiterChar}'`);
        }

        delimiterProcessors.set(delimiterChar, toAdd);
    }


    private readonly specialCharacters: BitSet;
    private readonly delimiterCharacters: BitSet;
    private readonly delimiterProcessors: Dictionary<string, DelimiterProcessor>;

    /**
     * Link references by ID, needs to be built up using parseReference before calling parse.
     */
    private referenceMap: Dictionary<string, Link> = new Dictionary<string, Link>();

    private block: Node;

    private input: string;
    private index: number;

    /**
     * Top delimiter (emphasis, strong emphasis or custom emphasis). (Brackets are on a separate stack, different
     * from the algorithm described in the spec.)
     */
    private lastDelimiter: Delimiter;

    /**
     * Top opening bracket (<code>[</code> or <code>![)</code>).
     */
    private lastBracket: Bracket;


    public constructor(delimiterProcessors: List<DelimiterProcessor>) {
        this.delimiterProcessors = InlineParserImpl.calculateDelimiterProcessors(delimiterProcessors);
        this.delimiterCharacters = InlineParserImpl.calculateDelimiterCharacters(this.delimiterProcessors.keys);
        this.specialCharacters = InlineParserImpl.calculateSpecialCharacters(this.delimiterCharacters);
    }

    /**
     * Parse content in block into inline children, using reference map to resolve references.
     */
    public parse(content: string, block: Node): void {
        this.block = block;
        this.input = content.trim();
        this.index = 0;
        this.lastDelimiter = null;
        this.lastBracket = null;

        let moreToParse: boolean;
        do {
            moreToParse = this.parseInline();
        } while (moreToParse);

        this.processDelimiters(null);
        this.mergeTextNodes(block.getFirstChild(), block.getLastChild());
    }

    /**
     * Attempt to parse a link reference, modifying the internal reference map.
     */
    public parseReference(s: string): number {
        this.input = s;
        this.index = 0;
        let dest: string;
        let title: string;
        let matchChars: number;
        let startIndex: number = this.index;

        // label:
        matchChars = this.parseLinkLabel();
        if (matchChars === 0) {
            return 0;
        }

        let rawLabel: string = this.input.substring(0, matchChars);

// colon:
        if (this.peek() !== ':') {
            return 0;
        }
        this.index++;

// link url
        this.spnl();

        dest = this.parseLinkDestination();

        if (dest == null || dest.length === 0) {
            return 0;
        }

        let beforeTitle: number = this.index;

        this.spnl();

        title = this.parseLinkTitle();

        if (title == null) {
            // rewind before spaces
            this.index = beforeTitle;
        }

        let atLineEnd: boolean = true;

        if (this.index !== this.input.length && this.match(LINE_END) == null) {
            if (title == null) {
                atLineEnd = false;
            } else {
                // the potential title we found is not at the line end,
                // but it could still be a legal link reference if we
                // discard the title
                title = null;
                // rewind before spaces
                this.index = beforeTitle;
                // and instead check if the link URL is at the line end
                atLineEnd = this.match(LINE_END) != null;
            }
        }

        if (!atLineEnd) {
            return 0;
        }

        let normalizedLabel: string = Escaping.normalizeReference(rawLabel);

        if (normalizedLabel === '') {
            return 0;
        }

        if (!this.referenceMap.containsKey(normalizedLabel)) {
            let link: Link = new Link(dest, title);
            this.referenceMap.set(normalizedLabel, link);
        }

        return this.index - startIndex;
    }


    private appendText(text: string, beginIndex?: number, endIndex?: number): Text {
        if (arguments.length === 3) {
            text = text.substring(beginIndex, endIndex);
        }
        let node: Text = new Text(text);
        this.appendNode(node);
        return node;
    }


    private appendNode(node: Node): void {
        this.block.appendChild(node);
    }

    /**
     * Parse the next inline element in subject, advancing input index.
     * On success, add the result to block's children and return true.
     * On failure, return false.
     */
    private parseInline(): boolean {
        let res: boolean;
        let c: string = this.peek();
        if (c === '\0') {
            return false;
        }
        switch (c) {
            case '\n':
                res = this.parseNewline();
                break;
            case '\\':
                res = this.parseBackslash();
                break;
            case '`':
                res = this.parseBackticks();
                break;
            case '[':
                res = this.parseOpenBracket();
                break;
            case '!':
                res = this.parseBang();
                break;
            case ']':
                res = this.parseCloseBracket();
                break;
            case '<':
                res = this.parseAutolink() || this.parseHtmlInline();
                break;
            case '&':
                res = this.parseEntity();
                break;
            default:
                let isDelimiter: boolean = this.delimiterCharacters.get(c);
                if (isDelimiter) {
                    let delimiterProcessor: DelimiterProcessor = this.delimiterProcessors.get(c);
                    res = this.parseDelimiters(delimiterProcessor, c);
                } else {
                    res = this.parseString();
                }
                break;
        }

        if (!res) {
            this.index++;
            // When we get here, it's only for a single special character that turned out to not have a special meaning.
            // So we shouldn't have a single surrogate here, hence it should be ok to turn it into a String.
            this.appendText(c);
        }

        return true;
    }

    /**
     * If RE matches at current index in the input, advance index and return the match; otherwise return null.
     */
    private match(re: RegExp): string {
        if (this.index >= this.input.length) {
            return null;
        }

        let matcher: RegExpExecArray = re.exec(this.input);

        if (matcher) {
            let matches = matcher.slice(this.index);

            this.index = matcher.end();
            return matcher.group();
        } else {
            return null;
        }
    }

    /**
     * Returns the char at the current input index, or {@code '\0'} in case there are no more characters.
     */
    private peek(): string {
        if (this.index < this.input.length) {
            return this.input.charAt(this.index);
        } else {
            return '\0';
        }
    }

    /**
     * Parse zero or more space characters, including at most one newline.
     */
    private spnl(): boolean {
        this.match(SPNL);
        return true;
    }

    /**
     * Parse a newline. If it was preceded by two spaces, return a hard line break; otherwise a soft line break.
     */
    private parseNewline(): boolean {
        this.index++; // assume we're at a \n

        let lastChild: Node  = this.block.getLastChild();
        // Check previous text for trailing spaces.
        // The "endsWith" is an optimization to avoid an RE match in the common case.
        if (lastChild != null && lastChild instanceof Text && (lastChild as Text).getLiteral().endsWith(' ')) {
            let text: Text = lastChild as Text;
            let literal: string = text.getLiteral();
            let matcher: Matcher = FINAL_SPACE.matcher(literal);
            let spaces: number = matcher.find() ? matcher.end() - matcher.start() : 0;

            if (spaces > 0) {
                text.setLiteral(literal.substring(0, literal.length - spaces));
            }

            this.appendNode(spaces >= 2 ? new HardLineBreak() : new SoftLineBreak());
        } else {
            this.appendNode(new SoftLineBreak());
        }

        // gobble leading spaces in next line
        while (this.peek() === ' ') {
            this.index++;
        }

        return true;
    }

    /**
     * Parse a backslash-escaped special character, adding either the escaped  character, a hard line break
     * (if the backslash is followed by a newline), or a literal backslash to the block's children.
     */
    private parseBackslash(): boolean {
        this.index++;
        if (this.peek() === '\n') {
            this.appendNode(new HardLineBreak());
            this.index++;
        } else if (
            this.index < this.input.length &&
            ESCAPABLE.matcher(this.input.substring(this.index, this.index + 1)).matches()
        ) {
            this.appendText(this.input, this.index, this.index + 1);
            this.index++;
        } else {
            this.appendText('\\');
        }
        return true;
    }

    /**
     * Attempt to parse backticks, adding either a backtick code span or a literal sequence of backticks.
     */
    private parseBackticks(): boolean {
        let ticks: string = this.match(TICKS_HERE);
        if (ticks == null) {
            return false;
        }
        let afterOpenTicks: number = this.index;
        let matched: string;
        while ((matched = this.match(TICKS)) != null) {
            if (matched === ticks) {
                let node: Code = new Code();
                let content: string = this.input.substring(afterOpenTicks, this.index - ticks.length);
                let literal: string = WHITESPACE.matcher(content.trim()).replaceAll(' ');
                node.setLiteral(literal);
                this.appendNode(node);
                return true;
            }
        }
        // If we got here, we didn't match a closing backtick sequence.
        this.index = afterOpenTicks;
        this.appendText(ticks);
        return true;
    }

    /**
     * Attempt to parse delimiters like emphasis, strong emphasis or custom delimiters.
     */
    private parseDelimiters(delimiterProcessor: DelimiterProcessor, delimiterChar: string): boolean {
        let res: DelimiterData = this.scanDelimiters(delimiterProcessor, delimiterChar);
        if (res == null) {
            return false;
        }
        let numDelims: number = res.count;
        let startIndex: number = this.index;

        this.index += numDelims;
        let node: Text = this.appendText(this.input, startIndex, this.index);

        // Add entry to stack for this opener
        this.lastDelimiter = new Delimiter(node, delimiterChar, res.canOpen, res.canClose, this.lastDelimiter);
        this.lastDelimiter.numDelims = numDelims;
        if (this.lastDelimiter.previous != null) {
            this.lastDelimiter.previous.next = this.lastDelimiter;
        }

        return true;
    }

    /**
     * Add open bracket to delimiter stack and add a text node to block's children.
     */
    private parseOpenBracket(): boolean {
        let startIndex: number = this.index;
        this.index++;

        let node: Text = this.appendText('[');

        // Add entry to stack for this opener
        this.addBracket(Bracket.link(node, startIndex, this.lastBracket, this.lastDelimiter));

        return true;
    }

    /**
     * If next character is [, and ! delimiter to delimiter stack and add a text node to block's children.
     * Otherwise just add a text node.
     */
    private parseBang(): boolean {
        let startIndex: number = this.index;
        this.index++;
        if (this.peek() === '[') {
            this.index++;

            let node: Text = this.appendText('![');

            // Add entry to stack for this opener
            this.addBracket(Bracket.image(node, startIndex + 1, this.lastBracket, this.lastDelimiter));
        } else {
            this.appendText('!');
        }
        return true;
    }

    /**
     * Try to match close bracket against an opening in the delimiter stack. Add either a link or image, or a
     * plain [ character, to block's children. If there is a matching delimiter, remove it from the delimiter stack.
     */
    private parseCloseBracket(): boolean {
        this.index++;
        let startIndex: number = this.index;

        // Get previous `[` or `![`
        let opener: Bracket = this.lastBracket;
        if (opener === null) {
            // No matching opener, just return a literal.
            this.appendText(']');
            return true;
        }

        if (!opener.allowed) {
            // Matching opener but it's not allowed, just return a literal.
            this.appendText(']');
            this.removeLastBracket();
            return true;
        }

        // Check to see if we have a link/image

        let dest: string = null;
        let title: string = null;
        let isLinkOrImage: boolean = false;

        // Maybe a inline link like `[foo](/uri "title")`
        if (this.peek() === '(') {
            this.index++;
            this.spnl();
            if ((dest = this.parseLinkDestination()) != null) {
                this.spnl();
                // title needs a whitespace before
                if (WHITESPACE.matcher(this.input.substring(this.index - 1, this.index)).matches()) {
                    title = this.parseLinkTitle();
                    this.spnl();
                }
                if (this.peek() === ')') {
                    this.index++;
                    isLinkOrImage = true;
                } else {
                    this.index = startIndex;
                }
            }
        }

        // Maybe a reference link like `[foo][bar]`, `[foo][]` or `[foo]`
        if (!isLinkOrImage) {

            // See if there's a link label like `[bar]` or `[]`
            let beforeLabel: number = this.index;
            let labelLength: number = this.parseLinkLabel();
            let ref: string = null;
            if (labelLength > 2) {
                ref = this.input.substring(beforeLabel, beforeLabel + labelLength);
            } else if (!opener.bracketAfter) {
                // If the second label is empty `[foo][]` or missing `[foo]`, then the first label is the reference.
                // But it can only be a reference when there's no (unescaped) bracket in it.
                // If there is, we don't even need to try to look up the reference. This is an optimization.
                ref = this.input.substring(opener.index, startIndex);
            }

            if (ref != null) {
                let link: Link = this.referenceMap.get(Escaping.normalizeReference(ref));
                if (link != null) {
                    dest = link.getDestination();
                    title = link.getTitle();
                    isLinkOrImage = true;
                }
            }
        }

        if (isLinkOrImage) {
            // If we got here, open is a potential opener
            let linkOrImage: Node = opener.image ? new Image(dest, title) : new Link(dest, title);

            let node: Node = opener.node.getNext();
            while (node != null) {
                let next: Node = node.getNext();
                linkOrImage.appendChild(node);
                node = next;
            }
            this.appendNode(linkOrImage);

            // Process delimiters such as emphasis inside link/image
            this.processDelimiters(opener.previousDelimiter);
            this.mergeTextNodes(linkOrImage.getFirstChild(), linkOrImage.getLastChild());
            // We don't need the corresponding text node anymore, we turned it into a link/image node
            opener.node.unlink();
            this.removeLastBracket();

            // Links within links are not allowed. We found this link, so there can be no other link around it.
            if (!opener.image) {
                let bracket: Bracket = this.lastBracket;
                while (bracket != null) {
                    if (!bracket.image) {
                        // Disallow link opener. It will still get matched, but will not result in a link.
                        bracket.allowed = false;
                    }
                    bracket = bracket.previous;
                }
            }

            return true;

        } else { // no link or image

            this.appendText(']');
            this.removeLastBracket();

            this.index = startIndex;
            return true;
        }
    }

    private addBracket(bracket: Bracket): void {
        if (this.lastBracket != null) {
            this.lastBracket.bracketAfter = true;
        }
        this.lastBracket = bracket;
    }

    private removeLastBracket(): void {
        this.lastBracket = this.lastBracket.previous;
    }

    /**
     * Attempt to parse link destination, returning the string or null if no match.
     */
    private parseLinkDestination(): string {
        let res: string = this.match(LINK_DESTINATION_BRACES);
        if (res != null) { // chop off surrounding <..>:
            if (res.length === 2) {
                return '';
            } else {
                return Escaping.unescapeString(res.substring(1, res.length - 1));
            }
        } else {
            res = this.match(LINK_DESTINATION);
            if (res != null) {
                return Escaping.unescapeString(res);
            } else {
                return null;
            }
        }
    }

    /**
     * Attempt to parse link title (sans quotes), returning the string or null if no match.
     */
    private parseLinkTitle(): string {
        let title: string = this.match(LINK_TITLE);
        if (title != null) {
            // chop off quotes from title and unescape:
            return Escaping.unescapeString(title.substring(1, title.length - 1));
        } else {
            return null;
        }
    }

    /**
     * Attempt to parse a link label, returning number of characters parsed.
     */
    private parseLinkLabel(): number {
        let m: string = this.match(LINK_LABEL);
        return m == null ? 0 : m.length;
    }

    /**
     * Attempt to parse an autolink (URL or email in pointy brackets).
     */
    private parseAutolink(): boolean {
        let m: string;
        if ((m = this.match(EMAIL_AUTOLINK)) != null) {
            let dest: string = m.substring(1, m.length - 1);
            let node: Link = new Link('mailto:' + dest, null);
            node.appendChild(new Text(dest));
            this.appendNode(node);
            return true;
        } else if ((m = this.match(AUTOLINK)) != null) {
            let dest: string = m.substring(1, m.length - 1);
            let node: Link = new Link(dest, null);
            node.appendChild(new Text(dest));
            this.appendNode(node);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Attempt to parse inline HTML.
     */
    private parseHtmlInline(): boolean {
        let m: string = this.match(HTML_TAG);
        if (m != null) {
            let node: HtmlInline = new HtmlInline();
            node.setLiteral(m);
            this.appendNode(node);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Attempt to parse an entity, return Entity object if successful.
     */
    private parseEntity(): boolean {
        let m: string;
        if ((m = this.match(ENTITY_HERE)) != null) {
            this.appendText(Html5Entities.entityToString(m));
            return true;
        } else {
            return false;
        }
    }

    /**
     * Parse a run of ordinary characters, or a single character with a special meaning in markdown, as a plain string.
     */
    private parseString(): boolean {
        let begin: number = this.index;
        let length: number = this.input.length;
        while (this.index !== length) {
            if (this.specialCharacters.get(this.input.charAt(this.index))) {
                break;
            }
            this.index++;
        }
        if (begin !== this.index) {
            this.appendText(this.input, begin, this.index);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Scan a sequence of characters with code delimiterChar, and return information about the number of delimiters
     * and whether they are positioned such that they can open and/or close emphasis or strong emphasis.
     *
     * @return information about delimiter run, or {@code null}
     */
    private scanDelimiters(delimiterProcessor: DelimiterProcessor, delimiterChar: string): DelimiterData {
        let startIndex: number = this.index;

        let delimiterCount: number = 0;
        while (this.peek() === delimiterChar) {
            delimiterCount++;
            this.index++;
        }

        if (delimiterCount < delimiterProcessor.getMinLength()) {
            this.index = startIndex;
            return null;
        }

        let before: string = startIndex === 0 ? '\n' :
            this.input.substring(startIndex - 1, startIndex);

        let charAfter: string = this.peek();
        let after: string = charAfter === '\0' ? '\n' : charAfter;

// We could be more lazy here, in most cases we don't need to do every match case.
        let beforeIsPunctuation: boolean = PUNCTUATION.matcher(before).matches();
        let beforeIsWhitespace: boolean = UNICODE_WHITESPACE_CHAR.matcher(before).matches();
        let afterIsPunctuation: boolean = PUNCTUATION.matcher(after).matches();
        let afterIsWhitespace: boolean = UNICODE_WHITESPACE_CHAR.matcher(after).matches();

        let leftFlanking: boolean = !afterIsWhitespace &&
            !(afterIsPunctuation && !beforeIsWhitespace && !beforeIsPunctuation);
        let rightFlanking: boolean = !beforeIsWhitespace &&
            !(beforeIsPunctuation && !afterIsWhitespace && !afterIsPunctuation);
        let canOpen: boolean;
        let canClose: boolean;
        if (delimiterChar === '_') {
            canOpen = leftFlanking && (!rightFlanking || beforeIsPunctuation);
            canClose = rightFlanking && (!leftFlanking || afterIsPunctuation);
        } else {
            canOpen = leftFlanking && delimiterChar === delimiterProcessor.getOpeningCharacter();
            canClose = rightFlanking && delimiterChar === delimiterProcessor.getClosingCharacter();
        }

        this.index = startIndex;
        return new DelimiterData(delimiterCount, canOpen, canClose);
    }

    private processDelimiters(stackBottom: Delimiter): void {

        let openersBottom: Dictionary<string, Delimiter> = new Dictionary<string, Delimiter>();

        // find first closer above stackBottom:
        let closer: Delimiter = this.lastDelimiter;
        while (closer != null && closer.previous !== stackBottom) {
            closer = closer.previous;
        }
// move forward, looking for closers, and handling each
        while (closer != null) {
            let delimiterChar: string = closer.delimiterChar;

            let delimiterProcessor: DelimiterProcessor = this.delimiterProcessors.get(delimiterChar);
            if (!closer.canClose || delimiterProcessor == null) {
                closer = closer.next;
                continue;
            }

            let openingDelimiterChar: string = delimiterProcessor.getOpeningCharacter();

            // Found delimiter closer. Now look back for first matching opener.
            let useDelims: number = 0;
            let openerFound: boolean = false;
            let potentialOpenerFound: boolean = false;
            let opener: Delimiter = closer.previous;
            while (opener != null && opener !== stackBottom && opener !== openersBottom.get(delimiterChar)) {
                if (opener.canOpen && opener.delimiterChar === openingDelimiterChar) {
                    potentialOpenerFound = true;
                    useDelims = delimiterProcessor.getDelimiterUse(opener, closer);
                    if (useDelims > 0) {
                        openerFound = true;
                        break;
                    }
                }
                opener = opener.previous;
            }

            if (!openerFound) {
                if (!potentialOpenerFound) {
                    // Set lower bound for future searches for openers.
                    // Only do this when we didn't even have a potential
                    // opener (one that matches the character and can open).
                    // If an opener was rejected because of the number of
                    // delimiters (e.g. because of the "multiple of 3" rule),
                    // we want to consider it next time because the number
                    // of delimiters can change as we continue processing.
                    openersBottom.set(delimiterChar, closer.previous);
                    if (!closer.canOpen) {
                        // We can remove a closer that can't be an opener,
                        // once we've seen there's no matching opener:
                        this.removeDelimiterKeepNode(closer);
                    }
                }
                closer = closer.next;
                continue;
            }

            let openerNode: Text = opener.node;
            let closerNode: Text = closer.node;

            // Remove number of used delimiters from stack and inline nodes.
            opener.numDelims -= useDelims;
            closer.numDelims -= useDelims;
            openerNode.setLiteral(
                openerNode.getLiteral().substring(0,
                    openerNode.getLiteral().length - useDelims));
            closerNode.setLiteral(
                closerNode.getLiteral().substring(0,
                    closerNode.getLiteral().length - useDelims));

            this.removeDelimitersBetween(opener, closer);
            // The delimiter processor can re-parent the nodes between opener and closer,
            // so make sure they're contiguous already.
            this.mergeTextNodes(openerNode.getNext(), closerNode.getPrevious());
            delimiterProcessor.process(openerNode, closerNode, useDelims);

            // No delimiter characters left to process, so we can remove delimiter and the now empty node.
            if (opener.numDelims === 0) {
                this.removeDelimiterAndNode(opener);
            }

            if (closer.numDelims === 0) {
                let next: Delimiter = closer.next;
                this.removeDelimiterAndNode(closer);
                closer = next;
            }
        }

        // remove all delimiters
        while (this.lastDelimiter != null && this.lastDelimiter !== stackBottom) {
            this.removeDelimiterKeepNode(this.lastDelimiter);
        }
    }

    private removeDelimitersBetween(opener: Delimiter, closer: Delimiter): void {
        let delimiter: Delimiter = closer.previous;
        while (delimiter != null && delimiter !== opener) {
            let previousDelimiter: Delimiter = delimiter.previous;
            this.removeDelimiterKeepNode(delimiter);
            delimiter = previousDelimiter;
        }
    }

    /**
     * Remove the delimiter and the corresponding text node. For used delimiters, e.g. `*` in `*foo*`.
     */
    private removeDelimiterAndNode(delim: Delimiter): void {
        let node: Text = delim.node;
        node.unlink();
        this.removeDelimiter(delim);
    }

    /**
     * Remove the delimiter but keep the corresponding node as text. For unused delimiters such as `_` in `foo_bar`.
     */
    private removeDelimiterKeepNode(delim: Delimiter): void {
        this.removeDelimiter(delim);
    }

    private removeDelimiter(delim: Delimiter): void {
        if (delim.previous != null) {
            delim.previous.next = delim.next;
        }
        if (delim.next == null) {
            // top of stack
            this.lastDelimiter = delim.previous;
        } else {
            delim.next.previous = delim.previous;
        }
    }

    private mergeTextNodes(fromNode: Node, toNode: Node): void {
        let first: Text = null;
        let last: Text = null;
        let length: number = 0;

        let node: Node = fromNode;
        while (node != null) {
            if (node instanceof Text) {
                let text: Text = node as Text;
                if (first == null) {
                    first = text;
                }
                length += text.getLiteral().length;
                last = text;
            } else {
                this.mergeIfNeeded(first, last, length);
                first = null;
                last = null;
                length = 0;
            }
            if (node === toNode) {
                break;
            }
            node = node.getNext();
        }

        this.mergeIfNeeded(first, last, length);
    }

    private mergeIfNeeded(first: Text, last: Text, textLength: number): void {
        if (first != null && last != null && first !== last) {
            let sb: StringBuilder = new StringBuilder();
            sb.append(first.getLiteral());
            let node: Node = first.getNext();
            let stop: Node = last.getNext();
            while (node !== stop) {
                sb.append((node as Text).getLiteral());
                let unlink: Node = node;
                node = node.getNext();
                unlink.unlink();
            }
            let literal: string = sb.toString();
            first.setLiteral(literal);
        }
    }
}


class DelimiterData {
    public count: number;
    public canClose: boolean;
    public canOpen: boolean;


    public constructor(count: number, canOpen: boolean, canClose: boolean) {
        this.count = count;
        this.canOpen = canOpen;
        this.canClose = canClose;
    }
}
