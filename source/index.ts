import {EventBus, EventBusEnum, type IEventPayload} from "@protorians/events-bus";
import {consoleColorizeLevel, consoleForLevel, consoleFormatTimestamp, consoleToUpperLevel, LevelEnum, TimestampEnum} from "@protorians/core";

export interface ILoggerOptions {
    prefix?: string;
    timestampFormat?: TimestampEnum;
    level?: LevelEnum;
    timestamp?: boolean;
    prefixSeparator?: string;
    isInteractive?: boolean;
    isVerbose?: boolean;
    isColorEnabled?: boolean;
}

export class Logger {
    constructor(
        public readonly options: ILoggerOptions
    ) {
    }

    print(message: string, ...args: any[]) {
        const level: LevelEnum = (this.options.level ?? LevelEnum.INFO);
        if (level === LevelEnum.SILENT) return;

        const useColor = this.options.isColorEnabled ?? (typeof process !== "undefined" ? !!process.stdout?.isTTY : true);
        const tsEnabled = this.options.timestamp !== false; // default true
        const tsFmt: TimestampEnum = this.options.timestampFormat ?? TimestampEnum.HH_MM_SS;
        const prefixSep = this.options.prefixSeparator ?? " ";

        const parts: string[] = [];

        if (tsEnabled) {
            const ts = consoleFormatTimestamp(new Date(), tsFmt);
            const tsText = `[${ts}]`;
            parts.push(useColor ? `\x1b[90m${tsText}\x1b[0m` : tsText);
        }

        const label = ` ${level === LevelEnum.NORMAL ? 'LOG' : consoleToUpperLevel(level)} `;
        parts.push(consoleColorizeLevel(label, level, useColor));

        if (this.options.prefix)
            parts.push(`${this.options.prefix}${prefixSep}`);

        const header = parts.join(" ");
        const log = consoleForLevel(level);

        log(`${header}`, `${message}`, ...args);

        Logger.dispatchEvent(level, {message, level, header, args});
    }

    static dispatchEvent(level: LevelEnum, payload: IEventPayload) {
        let key: EventBusEnum | undefined;

        switch (level) {
            case LevelEnum.NORMAL:
                key = EventBusEnum.LOG;
                break;
            case LevelEnum.ERROR:
                key = EventBusEnum.LOG_ERROR;
                break;
            case LevelEnum.CRITICAL:
                key = EventBusEnum.LOG_CRITICAL;
                break;
            case LevelEnum.WARN:
                key = EventBusEnum.LOG_WARNING;
                break;
            case LevelEnum.NOTICE:
                key = EventBusEnum.LOG_NOTICE;
                break;
            case LevelEnum.INFO:
                key = EventBusEnum.LOG_INFO;
                break;
            case LevelEnum.DEBUG:
                key = EventBusEnum.LOG_DEBUG;
                break;
            case LevelEnum.FATAL:
                key = EventBusEnum.LOG_EMERGENCY;
                break;
            case LevelEnum.TRACE:
                key = EventBusEnum.LOG_TRACE;
                break;
            case LevelEnum.SILENT:
                key = EventBusEnum.LOG_SILENT;
        }

        if (key) EventBus.dispatch(key, payload);
    }

    private static baseOptions(): Omit<ILoggerOptions, "level"> {
        return {
            timestamp: true,
            timestampFormat: TimestampEnum.HH_MM_SS,
            isColorEnabled: (typeof process !== "undefined" ? !!process.stdout?.isTTY : true),
        };
    }

    private static withLevel(level: LevelEnum, extra?: ILoggerOptions) {
        return new Logger({...Logger.baseOptions(), ...(extra || {}), level});
    }

    static log(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.NORMAL).print(message, ...args);
    }

    static notice(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.NOTICE).print(message, ...args);
    }

    static error(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.ERROR).print(message, ...args);
    }

    static warn(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.WARN).print(message, ...args);
    }

    static debug(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.DEBUG).print(message, ...args);
    }

    static trace(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.TRACE).print(message, ...args);
    }

    static fatal(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.FATAL).print(message, ...args);
    }

    static critical(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.CRITICAL).print(message, ...args);
    }

    static info(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.INFO).print(message, ...args);
    }

    static success(message: string, ...args: any[]) {
        Logger.withLevel(LevelEnum.DONE).print(message, ...args);
    }
}