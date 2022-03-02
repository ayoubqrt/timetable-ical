import { DateTimeObject } from "../index";
/**
 * Format to ISO date
 * @param date
 */
export declare const formatToIsoDate: (date: string) => string;
export declare const removeTString: (date: string) => string;
/**
 * Better formatting for dates
 * @param iCalDate
 */
export declare const parseICalDate: (iCalDate: string) => DateTimeObject;
