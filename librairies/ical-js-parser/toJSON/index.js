var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { checkIfIsDateKey } from '../common';
import { parseICalDate } from './dateHelpers';
import { ALWAYS_STRING_VALUES, ATTENDEE_KEY, CALENDAR_END_KEY_VALUE, EVENT_BEGIN_KEY_VALUE, MAILTO_KEY, MAILTO_KEY_WITH_DELIMITER, RRULE_ICAL_KEY, RRULE_KEY, UID_KEY, } from '../constants';
import { extractAlwaysStringValue, normalizeKey, normalizeString, splitRowsToArray, } from './formatHelpers';
import { validateICalString } from './validator';
import { extractProperty, removeProperty, splitDataSetsByKey } from './utils';
/**
 * Extract only calendar string part
 * @param iCalString
 */
var getVCalendarString = function (iCalString) {
    return iCalString.slice(0, iCalString.indexOf(EVENT_BEGIN_KEY_VALUE));
};
/**
 * Parse calendar string to calendar JSON
 * @param calendarString
 */
var formatVCalendarStringToObject = function (calendarString) {
    var calendarRows = splitRowsToArray(calendarString);
    var result = {};
    for (var _i = 0, calendarRows_1 = calendarRows; _i < calendarRows_1.length; _i++) {
        var row = calendarRows_1[_i];
        var keyValue = splitRowToKeyValueObj(row);
        var key = keyValue.key, value = keyValue.value;
        result[key] = value;
    }
    return result;
};
/**
 * Split string events to array
 * @param iCalEvents
 */
var splitStringEvents = function (iCalEvents) {
    // Get array of events
    var result = iCalEvents.split(EVENT_BEGIN_KEY_VALUE).slice(1);
    if (!result) {
        return '';
    }
    // Add missing delimiter from split to each record
    result = result.map(function (item) { return "".concat(EVENT_BEGIN_KEY_VALUE).concat(item); });
    return result;
};
export var formatStringToKeyValueObj = function (stringValue, eventObj) {
    var eventWithMergedRows = splitRowsToArray(stringValue);
    for (var _i = 0, eventWithMergedRows_1 = eventWithMergedRows; _i < eventWithMergedRows_1.length; _i++) {
        var stringEvent = eventWithMergedRows_1[_i];
        var keyValue = splitRowToKeyValueObj(stringEvent);
        var key = keyValue.key, value = keyValue.value;
        // Handle nested array value so it does not override with same key like ATTENDEE
        if (key === ATTENDEE_KEY) {
            eventObj[ATTENDEE_KEY] = Array.isArray(eventObj[ATTENDEE_KEY])
                ? __spreadArray(__spreadArray([], eventObj[ATTENDEE_KEY], true), [value], false) : [value];
        }
        else {
            eventObj[key] = value;
        }
    }
    return eventObj;
};
var getOneEventJSON = function (rawString) {
    var eventObj = {};
    // extract VALARMS from string
    var _a = extractProperty(rawString, 'VALARM'), mainProperty = _a.mainProperty, extractedProperty = _a.extractedProperty;
    var alarmsString = extractedProperty;
    // Format event string, merge multiline values
    formatStringToKeyValueObj(mainProperty, eventObj);
    // format alarms
    if (alarmsString && alarmsString.length > 0) {
        eventObj.alarms = [];
        var alarmStrings = splitDataSetsByKey(alarmsString, 'VALARM');
        alarmStrings.forEach(function (item) {
            var alarmObj = {};
            formatStringToKeyValueObj(item, alarmObj);
            eventObj.alarms.push(alarmObj);
        });
    }
    return eventObj;
};
/**
 * Split string to separate key and value
 * @param item
 */
var splitRowToKeyValueObj = function (item) {
    // Get basic delimiter indexes
    var basicDelimiterIndex = item.indexOf(':');
    var nestedDelimiterIndex = item.indexOf(';');
    // Check if item has nested values
    var hasNestedValues = nestedDelimiterIndex !== -1 && nestedDelimiterIndex < basicDelimiterIndex;
    var key;
    var value;
    // Set keys first
    if (hasNestedValues &&
        item.slice(0, nestedDelimiterIndex) !== RRULE_ICAL_KEY) {
        key = normalizeKey(item.slice(0, nestedDelimiterIndex));
    }
    else {
        key = normalizeKey(item.slice(0, basicDelimiterIndex));
    }
    // Check if key is date parameter
    var isDateKey = checkIfIsDateKey(key);
    // Set values
    if (hasNestedValues && ALWAYS_STRING_VALUES.indexOf(key) !== -1) {
        // Should format nested values summary, location and description to simple
        // string
        value = extractAlwaysStringValue(item);
    }
    else if (hasNestedValues && key !== RRULE_KEY) {
        value = isDateKey
            ? normalizeString(item.slice(nestedDelimiterIndex + 1))
            : parseNestedValues(item.slice(nestedDelimiterIndex + 1));
    }
    else {
        value = normalizeString(item.slice(basicDelimiterIndex + 1));
    }
    if (isDateKey) {
        value = parseICalDate(value);
    }
    // UID cant have any space between chars
    if (key === UID_KEY) {
        value = value.replace(' ', '');
    }
    return {
        key: key,
        value: value,
    };
};
/**
 * Split item to key and nested values
 * @param item
 */
var splitNestedValues = function (item) {
    var nestedValueDelimiterIndex = item.indexOf('=');
    return {
        key: normalizeKey(item.slice(0, nestedValueDelimiterIndex)),
        value: item.slice(nestedValueDelimiterIndex + 1),
    };
};
/**
 * Split values to nested obj, except date key
 * @param values
 */
var parseNestedValues = function (values) {
    var result = {};
    // Separate key values with ; delimiter
    var valuesArray = values.split(';');
    for (var _i = 0, valuesArray_1 = valuesArray; _i < valuesArray_1.length; _i++) {
        var item = valuesArray_1[_i];
        var keyValue = splitNestedValues(item);
        var key = keyValue.key, value = keyValue.value;
        // ** Handle exception with date in nested value ** //
        // f.e. date without time
        if (key === 'value' && value.indexOf('DATE') !== -1) {
            result = normalizeString(value.slice(value.indexOf('DATE')));
        }
        else if (value.indexOf(MAILTO_KEY_WITH_DELIMITER) !== -1) {
            result[key.toUpperCase()] = normalizeString(value
                .slice(0, value.indexOf(MAILTO_KEY_WITH_DELIMITER))
                .replace(' ', ''));
            result[MAILTO_KEY] = normalizeString(value.slice(value.indexOf("".concat(MAILTO_KEY_WITH_DELIMITER, ":")) +
                "".concat(MAILTO_KEY_WITH_DELIMITER, ":").length));
        }
        else {
            result[key.toUpperCase()] = normalizeString(value);
        }
    }
    return result;
};
/**
 * Main function
 * Get key values from each line to build obj
 * @param iCalStringEvent
 */
var toJSON = function (iCalStringEvent) {
    // Validate string
    validateICalString(iCalStringEvent);
    // Get vcalendar props
    var vCalendarString = getVCalendarString(iCalStringEvent);
    var calendar = formatVCalendarStringToObject(vCalendarString);
    // Get events
    var vEventsString = iCalStringEvent.slice(vCalendarString.length, iCalStringEvent.length - CALENDAR_END_KEY_VALUE.length);
    // Remove not supported properties
    var stringCleaned = removeProperty(vEventsString, 'DAYLIGHT');
    stringCleaned = removeProperty(stringCleaned, 'VTIMEZONE');
    stringCleaned = removeProperty(stringCleaned, 'STANDARD');
    // Split string events to array
    var vEventsArray = splitStringEvents(stringCleaned);
    // Parse each event to obj
    var events = vEventsArray.map(function (stringEvent) {
        return getOneEventJSON(stringEvent);
    });
    return {
        calendar: calendar,
        events: events,
    };
};
export default toJSON;
