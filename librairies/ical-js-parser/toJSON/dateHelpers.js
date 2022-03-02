import { validateISOStringDate, validateStringDateWithoutTime, } from './validator';
import { timezoneParser } from './timezoneParser';
import { DateTime } from 'luxon';
/**
 * Format to ISO date
 * @param date
 */
export var formatToIsoDate = function (date) {
    var baseDate = date;
    var year = baseDate.slice(0, 4);
    var month = baseDate.slice(4, 6);
    var day = baseDate.slice(6, 8);
    var hour = baseDate.slice(9, 11);
    var minute = baseDate.slice(11, 13);
    var result = "".concat(year).concat(month).concat(day, "T").concat(hour).concat(minute, "00Z");
    validateISOStringDate(result);
    return result;
};
export var removeTString = function (date) {
    return date.replace('T', '');
};
/**
 * Better formatting for dates
 * @param iCalDate
 */
export var parseICalDate = function (iCalDate) {
    // No special handling for other dates
    var isTzidDate = iCalDate.indexOf('TZID') !== -1;
    var isAllDayEvent = iCalDate.indexOf('DATE:') !== -1;
    var isSimpleDate = !isTzidDate && !isAllDayEvent;
    if (isSimpleDate) {
        return { value: formatToIsoDate(iCalDate) };
    }
    if (isAllDayEvent) {
        var baseDate = iCalDate.slice(iCalDate.indexOf('DATE:') + 'DATE:'.length);
        var year = baseDate.slice(0, 4);
        var month = baseDate.slice(4, 6);
        var day = baseDate.slice(6, 8);
        var dateString = "".concat(year).concat(month).concat(day);
        validateStringDateWithoutTime(dateString);
        return { value: dateString, isAllDay: true };
    }
    // Need to format tzid date value to UTC
    if (isTzidDate) {
        var timezone = iCalDate.split(':')[0];
        var baseDate = removeTString(iCalDate.split(':')[1]);
        var timezoneParsed = timezoneParser(timezone.slice(timezone.indexOf('TZID=') + 'TZID='.length));
        var zuluDate = DateTime.fromFormat(baseDate, 'yyyyLLddHHmmss', {
            zone: timezoneParsed,
        })
            .toUTC()
            .toFormat('yyyyLLddHHmmss');
        return {
            value: zuluDate.slice(0, 'YYYYMMDD'.length) +
                'T' +
                zuluDate.slice('YYYYMMDD'.length) +
                'Z',
            timezone: timezoneParsed,
        };
    }
    return { value: formatToIsoDate(iCalDate) };
};
