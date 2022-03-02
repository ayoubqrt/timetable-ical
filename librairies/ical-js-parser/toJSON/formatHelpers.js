/**
 * Extract only simple string from nested nested values where we don't need
 * that other information like in location, summary, description
 * @param value
 */
export var extractAlwaysStringValue = function (value) {
    if (!value) {
        return '';
    }
    if (value.indexOf(':') === value.length) {
        return '';
    }
    return value.slice(value.indexOf(':') + 1);
};
/**
 * Normalize string, remove any formats, line breakes
 * @param value
 */
export var normalizeString = function (value) {
    if (!value || (typeof value === 'string' && value.length < 1)) {
        return '';
    }
    if (typeof value !== 'string') {
        return value;
    }
    var formattedValue = value.trim();
    if (formattedValue.length === 2) {
        if (formattedValue === '/r') {
            return '';
        }
        return formattedValue;
    }
    if (formattedValue.slice(formattedValue.length - 2, formattedValue.length) ===
        '/r') {
        return formattedValue.slice(0, formattedValue.length - 2);
    }
    return formattedValue;
};
/**
 * Lower case all keys, replace dashes with camelCase
 * @param keyOriginal
 */
export var normalizeKey = function (keyOriginal) {
    var resultKey = '';
    var newKey = keyOriginal.toLowerCase();
    var willBeUpperCase = false;
    // Remove dashes, format to camelCase
    for (var _i = 0, newKey_1 = newKey; _i < newKey_1.length; _i++) {
        var letter = newKey_1[_i];
        var isDash = letter === '-';
        if (isDash) {
            willBeUpperCase = true;
        }
        else if (willBeUpperCase) {
            resultKey += letter.toUpperCase();
            willBeUpperCase = false;
        }
        else {
            resultKey += letter;
        }
    }
    return resultKey;
};
/**
 * Split rows to array and merge rows for same key
 * Multiple rows under same key are written with space at the line beginning
 * @param stringEvent
 */
export var splitRowsToArray = function (stringEvent) {
    // Split key values for every new line
    var rowsArray = stringEvent.split('\n');
    // Fix formatting with multiline values
    // Multiline values starts with empty space
    var fixedRowsArray = [];
    for (var _i = 0, rowsArray_1 = rowsArray; _i < rowsArray_1.length; _i++) {
        var currentRow = rowsArray_1[_i];
        if (currentRow.length > 0) {
            // Join this row with previous row if starts with empty space
            if (currentRow[0] && currentRow[0] === ' ') {
                // Merge previous and current row
                var mergedRows = fixedRowsArray[fixedRowsArray.length - 1] + currentRow;
                // Replace last item with joined rows
                fixedRowsArray.pop();
                fixedRowsArray.push(mergedRows);
            }
            else {
                // Just add row
                fixedRowsArray.push(currentRow);
            }
        }
    }
    return fixedRowsArray;
};
