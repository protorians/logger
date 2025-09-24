# @protorians/logger

English | Français (README.fr.md)

A minimal, typed logger for Node.js and ESM with timestamp formatting, colored levels, prefixes, and integration with @protorians/events-bus.

- Runtime: Node >= 22
- Exports: ESM and CJS (types included)
- Dependencies: `@protorians/core`, `@protorians/events-bus`

## Installation

- pnpm: pnpm add @protorians/logger
- npm: npm i @protorians/logger
- yarn: yarn add @protorians/logger

## Overview

The module exposes a `Logger` class and convenient static methods per level. Output is colorized when the terminal is a TTY (can be disabled), with timestamp (enabled by default) and optional prefix.

Logs also dispatch `@protorians/events-bus` events for advanced observability.

## Quick start

- ESM:
import { Logger } from "@protorians/logger";
Logger.info("Starting up");
Logger.warn("Missing config: %s", "PORT");
Logger.error("Failure: %o", new Error("boom"));

- CJS:
const { Logger } = require("@protorians/logger");
Logger.debug("Hello");

## API

### Types

- ILoggerOptions
  - prefix?: string — prefix shown before the message
  - timestampFormat?: TimestampEnum — timestamp format (default: `TimestampEnum.HH_MM_SS`)
  - level?: LevelEnum — level used by the instance (default: `LevelEnum.INFO` in print)
  - timestamp?: boolean — enable/disable timestamp (default: true)
  - prefixSeparator?: string — separator between prefix and message (default: space)
  - isInteractive?: boolean — free flag (not used in current formatting)
  - isVerbose?: boolean — free flag (not used in current formatting)
  - isColorEnabled?: boolean — enable/disable colors (default: auto based on TTY)

- Enums from `@protorians/core`
  - LevelEnum: NORMAL, ERROR, CRITICAL, WARN, NOTICE, INFO, DEBUG, FATAL, TRACE, DONE, SILENT
  - TimestampEnum: e.g. HH_MM_SS (used by default)

### Class: Logger

- constructor(options: ILoggerOptions)
  - Creates an instance with options. The instance method `print` will use `options.level` (INFO by default) to choose the color and the appropriate console stream.

- print(message: string, ...args: any[]) => void
  - Builds the header (timestamp, level label, prefix) then delegates to the proper console stream:
    - consoleForLevel(level) from `@protorians/core` (e.g., console.error for ERROR, etc.)
  - Respects:
    - isColorEnabled (auto: `process.stdout.isTTY` if available)
    - timestamp (true by default)
    - timestampFormat (default HH_MM_SS)
    - prefix + prefixSeparator
  - Emits an event via `@protorians/events-bus` (see below).

- Convenience static methods (create a `Logger` with default options and the given level, then call `print`):
  - Logger.log(message, ...args) → LevelEnum.NORMAL
  - Logger.notice(message, ...args) → LevelEnum.NOTICE
  - Logger.error(message, ...args) → LevelEnum.ERROR
  - Logger.warn(message, ...args) → LevelEnum.WARN
  - Logger.debug(message, ...args) → LevelEnum.DEBUG
  - Logger.trace(message, ...args) → LevelEnum.TRACE
  - Logger.fatal(message, ...args) → LevelEnum.FATAL
  - Logger.critical(message, ...args) → LevelEnum.CRITICAL
  - Logger.info(message, ...args) → LevelEnum.INFO
  - Logger.success(message, ...args) → LevelEnum.DONE

Defaults used by these static methods:
- timestamp: true
- timestampFormat: TimestampEnum.HH_MM_SS
- isColorEnabled: auto based on TTY

### Example with an instance

import { Logger } from "@protorians/logger";
import { LevelEnum, TimestampEnum } from "@protorians/core";

const appLogger = new Logger({
  prefix: "api",
  level: LevelEnum.INFO,             // level used by print
  timestamp: true,
  timestampFormat: TimestampEnum.HH_MM_SS,
  prefixSeparator: " | ",
  isColorEnabled: true
});

appLogger.print("Server ready at %s", "http://localhost:3000");

// Change level dynamically (instance):
appLogger.options.level = LevelEnum.DEBUG;
appLogger.print("Request: %o", { method: "GET", path: "/" });

### Disable colors or timestamp

Logger.info("Colors auto based on TTY");
new Logger({ level: LevelEnum.INFO, isColorEnabled: false }).print("No color");
new Logger({ level: LevelEnum.INFO, timestamp: false }).print("No timestamp");

## Events Bus integration

Every log emits an event via `EventBus.dispatch(key, payload)` where `payload` is:

- { message: string, level: LevelEnum, header: string, args: any[] }

The `key` depends on the level:

- NORMAL → EventBusEnum.LOG
- ERROR → EventBusEnum.LOG_ERROR
- CRITICAL → EventBusEnum.LOG_CRITICAL
- WARN → EventBusEnum.LOG_WARNING
- NOTICE → EventBusEnum.LOG_NOTICE
- INFO → EventBusEnum.LOG_INFO
- DEBUG → EventBusEnum.LOG_DEBUG
- FATAL → EventBusEnum.LOG_EMERGENCY
- TRACE → EventBusEnum.LOG_TRACE
- SILENT → EventBusEnum.LOG_SILENT

This lets you centralize or redirect logs to other targets (file, telemetry, etc.) by subscribing to the `@protorians/events-bus` package event bus.

## Formats and rendering

- The level label is uppercased (e.g., INFO, ERROR). For `LevelEnum.NORMAL`, the label shown is "LOG".
- The timestamp is rendered in brackets: [HH:MM:SS] by default.
- Colors come from `consoleColorizeLevel` in `@protorians/core`.

## Best practices

- Use the static methods for quick logs.
- Create `Logger` instances if you need a dedicated prefix (e.g., a microservice), a specific format, or to lock a level.
- Set `isColorEnabled` to false for non-TTY CI environments if needed.

## License

ISC
