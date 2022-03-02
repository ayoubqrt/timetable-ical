import { DateTime } from 'luxon';
import { CALENDAR_BEGIN_KEY_VALUE, CALENDAR_END_KEY_VALUE, EVENT_BEGIN_KEY_VALUE, EVENT_END_KEY_VALUE, } from '../constants';
import { ERROR_MSG } from '../enums';
export var validateISOStringDate = function (stringDate) {
    if (!DateTime.fromISO(stringDate).isValid) {
        throw new Error(ERROR_MSG.INVALID_DATE);
    }
};
export var validateStringDateWithoutTime = function (stringDate) {
    if (!DateTime.fromFormat(stringDate, 'yyyyMMdd').isValid) {
        throw new Error(ERROR_MSG.INVALID_DATE);
    }
};
/**
 * Check some basic properties of string Ical
 * @param iCalString
 */
export var validateICalString = function (iCalString) {
    if (iCalString.indexOf(EVENT_BEGIN_KEY_VALUE) === -1 ||
        iCalString.indexOf(EVENT_END_KEY_VALUE) === -1) {
        throw new Error(ERROR_MSG.WRONG_FORMAT);
    }
    if (iCalString.indexOf(CALENDAR_BEGIN_KEY_VALUE) === -1 ||
        iCalString.indexOf(CALENDAR_END_KEY_VALUE) === -1) {
        throw new Error(ERROR_MSG.WRONG_FORMAT);
    }
};
