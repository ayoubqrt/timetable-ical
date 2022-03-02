import { foldLine } from './index';
export var mapObjToString = function (obj) {
    var result = '';
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        result = result + key.toUpperCase() + '=' + value + '\n';
    }
    return result;
};
export var formatAlarmsToString = function (alarms) {
    var result = '';
    alarms.forEach(function (item) {
        result += 'BEGIN:VALARM\n';
        result += foldLine(mapObjToString(item));
        result += 'END:VALARM\n';
    });
    return result;
};
