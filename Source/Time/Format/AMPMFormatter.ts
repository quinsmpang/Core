import {TimeComponentFormatterBase} from './TimeComponentFormatterBase';
import {DateTime} from '../DateTime';
import {DateTimeFormatInfo} from '../DateTimeFormatInfo';
import {InvalidOperationException} from '../../Exceptions/InvalidOperationException';
import {TimeSpan} from '../TimeSpan';
import {Assert} from '../../Assertion/Assert';
import {EMPTY_STRING} from '../../Text/constants';
import {Singleton} from '../../DI/Decorators/Singleton';


@Singleton()
export class AMPMFormatter extends TimeComponentFormatterBase {
    protected entryPattern: RegExp = /^(AA?|aa?)$/;


    public formatDateTime(dateTime: DateTime, format: string, formatInfo: DateTimeFormatInfo): string {
        Assert.argument('dateTime', dateTime).notNull();
        Assert.argument('format', format).notNull();
        Assert.argument('formatInfo', formatInfo).notNull();

        return this.formatAMPM(dateTime.hours, format, formatInfo);
    }


    public formatTimeSpan(timeSpan: TimeSpan, format: string, formatInfo: DateTimeFormatInfo): string {
        throw new InvalidOperationException(`Day of month component is not available for time span.`);
    }


    // formatInfo may contain information about day-of-week representation for specific culture.

    protected formatAMPM(hours: number, format: string, formatInfo: DateTimeFormatInfo): string {
        switch (format) {
            // AM/PM in upper case (full format)
            case 'AA':
                return (hours < 12 ? formatInfo.amDesignator : formatInfo.pmDesignator).toUpperCase();

            // AM/PM in upper case (short format)
            case 'A':
                return (hours < 12 ? formatInfo.amDesignator : formatInfo.pmDesignator).toUpperCase().slice(0, 1);

            // AM/PM in lower case (full format)
            case 'aa':
                return (hours < 12 ? formatInfo.amDesignator : formatInfo.pmDesignator).toLowerCase();

            // AM/PM in lower case (short format)
            case 'a':
                return (hours < 12 ? formatInfo.amDesignator : formatInfo.pmDesignator).toLowerCase().slice(0, 1);

            default:
                return EMPTY_STRING;
        }
    }
}

