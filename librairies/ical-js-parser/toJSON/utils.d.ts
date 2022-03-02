import { ExtractProperty } from '../interface';
/**
 * Temporary solution to remove valarms in recursion
 * @param vEventsString
 * @param property
 * @param count
 */
export declare const removeProperty: (vEventsString: string, property: string, count?: number) => string;
export declare const extractProperty: (vEventsString: string, property: string, count?: number, result?: ExtractProperty | undefined) => ExtractProperty;
/**
 * Split string data sets to array
 * @param iCalEvents
 */
export declare const splitDataSetsByKey: (stringData: string, key: string) => any;
