import {StringBuilder} from '../../../Core/Text/StringBuilder';


export class BlockContent {
    private sb: StringBuilder;
    private lineCount: number = 0;


    public constructor(content?: string) {
        this.sb = new StringBuilder(content);
    }


    public add(line: string): void {
        if (this.lineCount !== 0) {
            this.sb.append('\n');
        }

        this.sb.append(line);
        this.lineCount++;
    }


    public getString(): string {
        return this.sb.toString();
    }

}
