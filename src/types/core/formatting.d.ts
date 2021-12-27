declare type FormatType = "currency" | "percentage" | "phoneNumber" | "date";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
declare type NaiveOnFormatError = (v: any) => string | void;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
declare type OnFormatError = (v: any, fmtType: FormatType) => string | void;
