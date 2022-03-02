/**
 * Extract only simple string from nested nested values where we don't need
 * that other information like in location, summary, description
 * @param value
 */
export declare const extractAlwaysStringValue: (value: any) => string;
/**
 * Normalize string, remove any formats, line breakes
 * @param value
 */
export declare const normalizeString: (value: any) => string | any;
/**
 * Lower case all keys, replace dashes with camelCase
 * @param keyOriginal
 */
export declare const normalizeKey: (keyOriginal: string) => string;
/**
 * Split rows to array and merge rows for same key
 * Multiple rows under same key are written with space at the line beginning
 * @param stringEvent
 */
export declare const splitRowsToArray: (stringEvent: string) => string[];
