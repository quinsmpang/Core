import {ICloneable, IFormattable, IComparable, ComparisonResult, IEquatable} from '../types';
import {DateTimeFormatInfo} from './DateTimeFormatInfo';
import {Assert} from '../Assertion/Assert';
import {MILLISECONDS_IN_DAY, MILLISECONDS_IN_HOUR, MILLISECONDS_IN_MINUTE, MILLISECONDS_IN_SECOND} from './types';


export class TimeSpan implements ICloneable<TimeSpan>, IFormattable, IComparable<TimeSpan>, IEquatable<TimeSpan> {
    public static readonly zero: TimeSpan = new TimeSpan();


    public static fromDays(days: number): TimeSpan {
        Assert.argument('days', days).notNull();

        return new TimeSpan(days, 0, 0, 0, 0);
    }


    public static fromHours(hours: number): TimeSpan {
        Assert.argument('hours', hours).notNull();

        return new TimeSpan(0, hours, 0, 0, 0);
    }


    public static fromMinutes(minutes: number): TimeSpan {
        Assert.argument('minutes', minutes).notNull();

        return new TimeSpan(0, 0, minutes, 0, 0);
    }


    public static fromSeconds(seconds: number): TimeSpan {
        Assert.argument('seconds', seconds).notNull();

        return new TimeSpan(0, 0, 0, seconds, 0);
    }


    public static fromMilliseconds(milliseconds: number): TimeSpan {
        Assert.argument('milliseconds', milliseconds).notNull();

        return new TimeSpan(0, 0, 0, 0, milliseconds);
    }


    public static fromTimestamp(timestamp: number): TimeSpan {
        Assert.argument('timestamp', timestamp).notNull();

        let value: TimeSpan = new TimeSpan(0, 0, 0, 0, 0);

        value._timestamp = Math.floor(timestamp);

        return value;
    }


    private _timestamp: number = 0;


    public get days(): number {
        return Math.floor(this._timestamp / MILLISECONDS_IN_DAY);
    }


    public get hours(): number {
        return Math.floor(this._timestamp / MILLISECONDS_IN_HOUR) % 24;
    }


    public get minutes(): number {
        return Math.floor(this._timestamp / MILLISECONDS_IN_MINUTE) % 60;
    }


    public get seconds(): number {
        return Math.floor(this._timestamp / MILLISECONDS_IN_SECOND) % 60;
    }


    public get milliseconds(): number {
        return this._timestamp % 1000;
    }


    public get totalDays(): number {
        return this._timestamp / MILLISECONDS_IN_DAY;
    }


    public get totalHours(): number {
        return this._timestamp / MILLISECONDS_IN_HOUR;
    }


    public get totalMinutes(): number {
        return this._timestamp / MILLISECONDS_IN_MINUTE;
    }


    public get totalSeconds(): number {
        return this._timestamp / MILLISECONDS_IN_SECOND;
    }


    public get totalMilliseconds(): number {
        return this._timestamp;
    }


    public get isNegative(): boolean {
        return this._timestamp < 0;
    }


    public get duration(): TimeSpan {
        return TimeSpan.fromTimestamp(Math.abs(this._timestamp));
    }


    public constructor(
        days: number = 0,
        hours: number = 0,
        minutes: number = 0,
        seconds: number = 0,
        milliseconds: number = 0
    ) {
        Assert.argument('days', days).notNull();
        Assert.argument('hours', hours).notNull();
        Assert.argument('minutes', minutes).notNull();
        Assert.argument('seconds', seconds).notNull();
        Assert.argument('milliseconds', milliseconds).notNull();

        this._timestamp += days * MILLISECONDS_IN_DAY;
        this._timestamp += hours * MILLISECONDS_IN_HOUR;
        this._timestamp += minutes * MILLISECONDS_IN_MINUTE;
        this._timestamp += seconds * MILLISECONDS_IN_SECOND;
        this._timestamp += milliseconds;

        this._timestamp = Math.floor(this._timestamp);
    }


    public add(value: TimeSpan): TimeSpan {
        Assert.argument('value', value).notNull();

        return TimeSpan.fromTimestamp(this._timestamp + value._timestamp);
    }


    public subtract(value: TimeSpan): TimeSpan {
        Assert.argument('value', value).notNull();

        return new TimeSpan(this._timestamp - value._timestamp);
    }


    public negate(): TimeSpan {
        return TimeSpan.fromTimestamp(-1 * this._timestamp);
    }


    public clone(): TimeSpan {
        return TimeSpan.fromTimestamp(this._timestamp);
    }


    public compareTo(other: TimeSpan): ComparisonResult {
        Assert.argument('other', other).notNull();

        if (this._timestamp < other._timestamp) {
            return ComparisonResult.Less;
        } else if (this._timestamp > other._timestamp) {
            return ComparisonResult.Greater;
        } else {
            return ComparisonResult.Equals;
        }
    }


    public equals(other: TimeSpan): boolean {
        Assert.argument('other', other).notNull();

        return this.compareTo(other) === ComparisonResult.Equals;
    }


    public toString(format: string, formatInfo: DateTimeFormatInfo): string {
        Assert.argument('format', format).notNull();
        Assert.argument('formatInfo', formatInfo).notNull();

        return formatInfo.format(format, this, formatInfo);
    }
}
