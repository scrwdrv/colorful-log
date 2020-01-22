interface LoggerOptions {
    system?: string;
    cluster?: number;
    debug?: boolean;
    path?: string;
    saveInterval?: number;
}
declare type Log = (msg: any) => void;
export default class Logger {
    private opts;
    private timezoneOffset;
    private pending;
    info: Log;
    warn: Log;
    error: Log;
    debug: Log;
    constructor(opts?: LoggerOptions);
    save(): Promise<void>;
    private init;
    private formatLog;
}
export {};
