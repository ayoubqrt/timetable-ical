import { ICalJSON } from '../index';
export declare const formatStringToKeyValueObj: (stringValue: string, eventObj: any) => any;
/**
 * Main function
 * Get key values from each line to build obj
 * @param iCalStringEvent
 */
declare const toJSON: (iCalStringEvent: string) => ICalJSON;
export default toJSON;
