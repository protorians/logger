import {consoleColorizeLevel, LevelEnum} from "@protorians/core";

/**
 * LoggerBadge is a utility class that provides static methods for generating
 * stylized log labels with varying levels of importance or severity.
 * Each method applies a specific log level style to a provided label.
 */
export class LoggerBadge {

    static log(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.NORMAL, true)
    }

    static info(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.INFO, true)
    }

    static error(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.ERROR, true)
    }

    static warn(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.WARN, true)
    }

    static debug(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.DEBUG, true)
    }

    static done(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.DONE, true)
    }

    static critical(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.CRITICAL, true)
    }

    static trace(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.TRACE, true)
    }

    static fatal(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.FATAL, true)
    }

    static notice(label: string | number) {
        return consoleColorizeLevel(` ${label} `, LevelEnum.NOTICE, true)
    }
}

/**
 * LBadge is a shorthand alias for the LoggerBadge utility.
 *
 * It represents a visual or textual badge designed to be used alongside
 * log outputs, aiding in categorization, identification, or highlighting
 * specific types of logs. Commonly used to enhance the readability of
 * logs in debugging and monitoring processes.
 *
 * The LoggerBadge can be customized based on requirements, such as
 * altering its appearance or representing distinct logging levels.
 */
export const LBadge = LoggerBadge;