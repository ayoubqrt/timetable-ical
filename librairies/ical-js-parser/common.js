export var MAX_LINE_LENGTH = 75;
export var DATE_KEYS = [
    'dtstart',
    'dtend',
    'dtstamp',
    'created',
    'lastModified',
];
export var DATE_ONLY_LENGTH = 10;
export var checkIfIsDateKey = function (keyValueString) {
    return DATE_KEYS.indexOf(keyValueString) !== -1;
};
