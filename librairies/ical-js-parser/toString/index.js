import { DateTime } from 'luxon';
import { checkIfIsDateKey, DATE_ONLY_LENGTH, MAX_LINE_LENGTH } from '../common';
import { ALARMS_KEY, ATTENDEE_KEY, ORGANIZER_KEY } from '../constants';
import { formatAlarmsToString } from './utils';
var CALENDAR_BEGIN = 'BEGIN:VCALENDAR\n';
var CALENDAR_END = 'END:VCALENDAR';
export var foldLine = function (row) {
    var result = '';
    var foldCount = row.length / MAX_LINE_LENGTH;
    if (row.length < MAX_LINE_LENGTH) {
        return row;
    }
    var tempRow = row;
    for (var i = 1; i <= foldCount + 1; i += 1) {
        if (tempRow.length <= MAX_LINE_LENGTH) {
            result = result + tempRow;
            return result;
        }
        else {
            result = result + tempRow.slice(0, MAX_LINE_LENGTH) + '\n ';
            var newTempRow = tempRow.slice(i * MAX_LINE_LENGTH);
            if (!newTempRow) {
                tempRow = tempRow.slice(MAX_LINE_LENGTH);
            }
            else {
                tempRow = tempRow.slice(i * MAX_LINE_LENGTH);
            }
        }
    }
    return result;
};
var addKeyValue = function (prevData, key, value) {
    return "".concat(prevData).concat(key).concat(value, "\n");
};
var transformToICalKey = function (key) {
    var result = '';
    for (var i = 0; i < key.length; i += 1) {
        var letter = key[i];
        // Transform camel case to dash
        if (letter.toUpperCase() === letter) {
            result += "-".concat(letter);
        }
        else {
            result += letter.toUpperCase();
        }
    }
    return result;
};
var mapObjToString = function (obj) {
    var result = '';
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (key !== 'mailto') {
            result = result + key.toUpperCase() + '=' + value + ';';
        }
        else {
            result = result.slice(0, -1) + ':mailto:' + value;
        }
    }
    return result;
};
var removeDot = function (date) {
    var indexOfDot = date.indexOf('.');
    var indexOfZ = date.indexOf('Z');
    if (indexOfDot === -1) {
        return date;
    }
    return date.slice(0, indexOfDot);
};
var removeZ = function (date) {
    var indexOfZ = date.indexOf('Z');
    if (indexOfZ === -1) {
        return date;
    }
    return date.slice(0, indexOfZ);
};
var addZ = function (date) {
    var indexOfZ = date.indexOf('Z');
    if (indexOfZ !== -1) {
        return date;
    }
    return date + 'Z';
};
var parseSimpleDate = function (date) {
    var result = removeDot(date.replace('-', ''));
    return addZ(result);
};
var parseUtcToTimestamp = function (utcDate) {
    var result = '';
    for (var i = 0; i < utcDate.length; i += 1) {
        var letter = utcDate[i];
        if (i === utcDate.length - 1 && letter === 'Z') {
            return addZ(removeDot(result));
        }
        if (letter !== ':' && letter !== '-') {
            result += letter;
        }
    }
    result = removeDot(result);
    return result;
};
var parseUtcDateObj = function (utcDate) {
    return addZ(parseUtcToTimestamp(utcDate.value));
};
var parseDateWithTimezone = function (dateObj) {
    var adjustedDateTime = DateTime.fromISO(dateObj.value)
        .setZone(dateObj.timezone)
        .toString();
    var formatFromUtc = removeZ(parseUtcToTimestamp(adjustedDateTime));
    return "TZID=".concat(dateObj.timezone, ":").concat(formatFromUtc);
};
/**
 * Build iCal string
 * @param iCalObj
 */
var toString = function (iCalObj) {
    var calendar = iCalObj.calendar, events = iCalObj.events;
    var prodid = calendar.prodid, version = calendar.version, calscale = calendar.calscale, method = calendar.method;
    var result = '';
    // Add calendar info
    result += CALENDAR_BEGIN;
    // Add prodid
    result = addKeyValue(result, 'PRODID:', prodid);
    // Add version
    result = addKeyValue(result, 'VERSION:', version);
    if (method) {
        result = addKeyValue(result, 'METHOD:', method);
    }
    if (calscale) {
        result = addKeyValue(result, 'CALSCALE:', calscale);
    }
    // Loop over all events
    for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
        var event_1 = events_1[_i];
        // Build event string from object props
        for (var _a = 0, _b = Object.entries(event_1); _a < _b.length; _a++) {
            var _c = _b[_a], key = _c[0], value = _c[1];
            var keyString = key;
            var valueAny = value;
            // Rules
            var isValueArray = Array.isArray(valueAny);
            var delimiter = isValueArray ? ';' : ':';
            var isDateKey = checkIfIsDateKey(key);
            var isAttendeeKey = key === ATTENDEE_KEY;
            var isOrganizerKey = key === ORGANIZER_KEY;
            var isAlarmsKey = key === ALARMS_KEY;
            // Different rules for dates
            if (isDateKey) {
                var hasTimezone = valueAny.timezone;
                var isSimpleObj = !hasTimezone && valueAny.value;
                var isSimpleDate = !hasTimezone && !isSimpleObj && valueAny.length === DATE_ONLY_LENGTH;
                if (isSimpleDate) {
                    // Date only for all day events
                    result +=
                        foldLine("".concat(transformToICalKey(key)).concat(delimiter).concat(parseSimpleDate(valueAny))) + '\n';
                }
                else if (isSimpleObj) {
                    result +=
                        foldLine("".concat(transformToICalKey(key)).concat(delimiter).concat(parseUtcDateObj(valueAny))) + '\n';
                }
                else if (hasTimezone) {
                    delimiter = ';';
                    // Object with timezone and value
                    result +=
                        foldLine("".concat(transformToICalKey(key)).concat(delimiter).concat(parseDateWithTimezone(valueAny))) + '\n';
                }
                else {
                    result +=
                        foldLine("".concat(transformToICalKey(key)).concat(delimiter).concat(parseUtcToTimestamp(valueAny))) + '\n';
                }
            }
            else if (isAttendeeKey) {
                for (var _d = 0, valueAny_1 = valueAny; _d < valueAny_1.length; _d++) {
                    var item = valueAny_1[_d];
                    result += foldLine('ATTENDEE;' + mapObjToString(item)) + '\n';
                }
            }
            else if (isOrganizerKey) {
                result += foldLine('ORGANIZER;' + mapObjToString(valueAny)) + '\n';
            }
            else if (isAlarmsKey) {
                result += formatAlarmsToString(valueAny);
            }
            else {
                result +=
                    foldLine("".concat(transformToICalKey(key)).concat(delimiter).concat(valueAny)) + '\n';
            }
        }
    }
    result += CALENDAR_END;
    return result;
};
export default toString;
