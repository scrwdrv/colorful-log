"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const recurdir = require("recurdir");
const addcolor_1 = require("addcolor");
const PATH = require("path");
const fs = require("fs");
class Logger {
    constructor(opts) {
        this.opts = {};
        this.timezoneOffset = new Date().getTimezoneOffset() * 60000;
        this.pending = '';
        if (opts)
            for (let opt in opts)
                this.opts[opt] = opts[opt];
        if (this.opts.debug === undefined)
            this.opts.debug = true;
        if (this.opts.path === undefined)
            this.opts.path = './logs';
        if (this.opts.cluster === undefined)
            this.opts.cluster = 0;
        if (this.opts.system === undefined)
            this.opts.system = 'logger';
        if (this.opts.saveInterval === undefined)
            this.opts.saveInterval = 60000;
        for (let severity of ['info', 'warn', 'error', 'debug'])
            this[severity] = (msg) => {
                switch (typeof msg) {
                    case 'object':
                        if (msg instanceof Error)
                            msg = msg.stack || msg.message || msg.toString();
                        else
                            msg = '\n\n' + JSON.stringify(msg, null, 1) + '\n';
                        break;
                    case 'number':
                    case 'bigint':
                        msg = msg.toString();
                        break;
                }
                const log = this.formatLog(severity, msg);
                this.pending += log.raw;
                if (!this.opts.debug && severity === 'debug')
                    return;
                console.log(log.color);
            };
        const fatalErrorHandler = async (err) => {
            const log = this.formatLog('fatal', formatError(err));
            console.log(log.color);
            await this.save().catch(this.error);
            process.exit();
            function formatError(msg) {
                if (msg instanceof Error)
                    msg = msg.stack || msg.message || msg.toString();
                else if (typeof msg !== 'string')
                    try {
                        msg = msg.toString();
                    }
                    catch (err) {
                        msg = 'UNKNOWN';
                    }
                return '\n' + msg;
            }
        };
        process.on('uncaughtException', fatalErrorHandler)
            .on('unhandledRejection', fatalErrorHandler);
        this.init();
    }
    save() {
        return new Promise((resolve, reject) => {
            const date = new Date(Date.now() - this.timezoneOffset).toISOString().slice(0, 10);
            if (this.pending)
                fs.appendFile(PATH.join(this.opts.path, date + '.log'), this.pending, (err) => {
                    if (err)
                        return reject(err);
                    this.pending = '';
                    resolve();
                });
            else
                resolve();
        });
    }
    init() {
        recurdir.mk(this.opts.path).then(() => {
            const saveDaemon = () => this.save()
                .then(() => setTimeout(saveDaemon, this.opts.saveInterval))
                .catch(err => {
                this.error(err);
                setTimeout(saveDaemon, 5000);
            });
            saveDaemon();
        }).catch(err => {
            this.error(err);
            setTimeout(() => this.init(), 5000);
        });
    }
    formatLog(severity, msg) {
        const colorMap = {
            info: 'green',
            warn: 'yellow',
            error: 'red',
            debug: 'blue',
            fatal: 'cyan'
        }, isoString = new Date(Date.now() - this.timezoneOffset).toISOString(), date = `${isoString.slice(0, 10)} ${isoString.slice(11, 19)}`, alignedSeverity = alignText(severity.toUpperCase(), 5, ' '), alignedSystem = alignText(this.opts.system.toUpperCase(), 7, '-'), alignedCluster = alignText(this.opts.cluster.toString(), 2, '0'), divider = addcolor_1.default.white(' ¦ ', 'dim');
        return {
            raw: date + ' ¦ [' + alignedCluster + '] ' + alignedSystem + ' ¦ ' + alignedSeverity + ' ¦ ' + msg + '\n',
            color: addcolor_1.default.white(date, 'dim') + divider + addcolor_1.default.cyan('[' + alignedCluster + '] ' + alignedSystem, this.opts.cluster === 0 ? 'bright' : 'dim') + divider + addcolor_1.default[colorMap[severity]](alignedSeverity, 'bright') + divider + msg
        };
        function alignText(str, length, fillChar) {
            const l = str.length;
            if (l <= length)
                return fillChar.repeat(length - l) + str;
            else
                return str.slice(0, length - 2) + '..';
        }
    }
}
exports.default = Logger;
//# sourceMappingURL=index.js.map