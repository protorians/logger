import type {LevelEnum, TimestampEnum} from "@protorians/core";

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
