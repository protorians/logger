# @protorians/logger

English | Français (README.fr.md)

A minimal, typed logger for Node.js and ESM with timestamp formatting, colored levels, prefixes, and integration with @protorians/events-bus.

- Runtime: Node >= 22
- Exports: ESM and CJS (types included)
- Dependencies: `@protorians/core`, `@protorians/events-bus`

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
- [Quick start](#quick-start)
- [API](#api)
  - [Types](#types)
  - [Class: Logger](#class-logger)
  - [Example with an instance](#example-with-an-instance)
  - [Disable colors or timestamp](#disable-colors-or-timestamp)
- [Events Bus integration](#events-bus-integration)
- [Formats and rendering](#formats-and-rendering)
- [Best practices](#best-practices)
- [License](#license)

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

Properties (ILoggerOptions):

| Property           | Type              | Default                        | Description                                                   |
|--------------------|-------------------|--------------------------------|---------------------------------------------------------------|
| prefix             | string            | —                              | Prefix shown before the message                               |
| timestampFormat    | TimestampEnum     | TimestampEnum.HH_MM_SS         | Timestamp format                                              |
| level              | LevelEnum         | LevelEnum.INFO (for print)     | Level used by the instance when printing                      |
| timestamp          | boolean           | true                           | Enable/disable timestamp                                      |
| prefixSeparator    | string            | " " (space)                   | Separator between prefix and message                          |
| isInteractive      | boolean           | —                              | Free flag (not used in current formatting)                    |
| isVerbose          | boolean           | —                              | Free flag (not used in current formatting)                    |
| isColorEnabled     | boolean           | auto (based on TTY)            | Enable/disable colors                                         |

Enums from `@protorians/core`:

| Enum           | Values                                                                                   | Notes                   |
|----------------|-------------------------------------------------------------------------------------------|-------------------------|
| LevelEnum      | NORMAL, ERROR, CRITICAL, WARN, NOTICE, INFO, DEBUG, FATAL, TRACE, DONE, SILENT           | Used for levels         |
| TimestampEnum  | e.g. HH_MM_SS                                                                             | Default is HH_MM_SS     |

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

- Convenience static methods (each creates a `Logger` with defaults, sets the level, and calls `print`):

| Method                      | LevelEnum      | Description                              |
|-----------------------------|----------------|------------------------------------------|
| Logger.log(msg, ...args)    | NORMAL         | Standard log                             |
| Logger.notice(msg, ...args) | NOTICE         | Notice-level log                         |
| Logger.error(msg, ...args)  | ERROR          | Error log (stderr)                       |
| Logger.warn(msg, ...args)   | WARN           | Warning log                              |
| Logger.debug(msg, ...args)  | DEBUG          | Debug information                        |
| Logger.trace(msg, ...args)  | TRACE          | Trace-level details                      |
| Logger.fatal(msg, ...args)  | FATAL          | Fatal/exit-level errors                  |
| Logger.critical(msg, ...args)| CRITICAL      | Critical errors                          |
| Logger.info(msg, ...args)   | INFO           | Informational message                    |
| Logger.success(msg, ...args)| DONE           | Success message                          |

Defaults used by these static helpers:

| Option            | Default                     |
|-------------------|-----------------------------|
| timestamp         | true                        |
| timestampFormat   | TimestampEnum.HH_MM_SS      |
| isColorEnabled    | auto (based on TTY)         |

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

| LevelEnum | EventBusEnum key       |
|-----------|-------------------------|
| NORMAL    | LOG                     |
| ERROR     | LOG_ERROR               |
| CRITICAL  | LOG_CRITICAL            |
| WARN      | LOG_WARNING             |
| NOTICE    | LOG_NOTICE              |
| INFO      | LOG_INFO                |
| DEBUG     | LOG_DEBUG               |
| FATAL     | LOG_EMERGENCY           |
| TRACE     | LOG_TRACE               |
| SILENT    | LOG_SILENT              |

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
