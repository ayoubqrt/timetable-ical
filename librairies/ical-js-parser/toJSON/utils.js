import { VALARM_RECURSION_MAX_COUNT } from '../constants';
/**
 * Temporary solution to remove valarms in recursion
 * @param vEventsString
 * @param property
 * @param count
 */
export var removeProperty = function (vEventsString, property, count) {
    if (count === void 0) { count = VALARM_RECURSION_MAX_COUNT; }
    var eventStringResult = vEventsString;
    var indexOfBeginVAlarm = eventStringResult.indexOf("BEGIN:".concat(property));
    var indexOfEndVAlarm = eventStringResult.indexOf("END:".concat(property));
    if (indexOfBeginVAlarm !== -1 && count > 0) {
        eventStringResult =
            eventStringResult.slice(0, indexOfBeginVAlarm) +
                eventStringResult.slice(indexOfEndVAlarm + "END:".concat(property).length);
        return removeProperty(eventStringResult, property, count - 1);
    }
    else {
        return eventStringResult;
    }
};
export var extractProperty = function (vEventsString, property, count, result) {
    if (count === void 0) { count = VALARM_RECURSION_MAX_COUNT; }
    var resultValue = {
        extractedProperty: (result === null || result === void 0 ? void 0 : result.extractedProperty) || '',
        mainProperty: vEventsString,
    };
    var eventStringResult = (result === null || result === void 0 ? void 0 : result.mainProperty) || vEventsString;
    var indexOfBeginVAlarm = eventStringResult.indexOf("BEGIN:".concat(property));
    var indexOfEndVAlarm = eventStringResult.indexOf("END:".concat(property));
    if (indexOfBeginVAlarm !== -1 && count > 0) {
        resultValue.extractedProperty =
            (resultValue === null || resultValue === void 0 ? void 0 : resultValue.extractedProperty) +
                eventStringResult.slice(indexOfBeginVAlarm, indexOfEndVAlarm);
        eventStringResult =
            eventStringResult.slice(0, indexOfBeginVAlarm) +
                eventStringResult.slice(indexOfEndVAlarm + "END:".concat(property).length);
        resultValue.mainProperty = eventStringResult;
        return extractProperty(eventStringResult, property, count - 1, resultValue);
    }
    else {
        return resultValue;
    }
};
/**
 * Split string data sets to array
 * @param iCalEvents
 */
export var splitDataSetsByKey = function (stringData, key) {
    // Get array of events
    var result = stringData.split(key).slice(1);
    if (!result) {
        return '';
    }
    // Add missing delimiter from split to each record
    result = result.map(function (item) { return "".concat(key).concat(item); });
    return result;
};
