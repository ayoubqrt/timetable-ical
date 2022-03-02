import { ICalJSON } from '../index';
export declare const foldLine: (row: string) => string;
/**
 * Build iCal string
 * @param iCalObj
 */
declare const toString: (iCalObj: ICalJSON) => string;
export default toString;
