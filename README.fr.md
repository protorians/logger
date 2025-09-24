# @protorians/logger

Un logger minimaliste et typé pour Node.js et ESM, avec mise en forme de timestamps, niveaux colorés, préfixes et intégration à @protorians/events-bus.

- Runtime: Node >= 22
- Exports: ESM et CJS (types inclus)
- Dépendances: `@protorians/core`, `@protorians/events-bus`

## Installation

- pnpm: pnpm add @protorians/logger
- npm: npm i @protorians/logger
- yarn: yarn add @protorians/logger

## Aperçu

Le module expose une classe `Logger` et des méthodes statiques pratiques par niveau. Les sorties sont colorées si le terminal est TTY (désactivable), avec horodatage (activé par défaut) et préfixe optionnel.

Les logs déclenchent aussi des événements `@protorians/events-bus` pour une observabilité avancée.

## Utilisation rapide

- ESM:
import { Logger } from "@protorians/logger";
Logger.info("Démarrage");
Logger.warn("Configuration manquante: %s", "PORT");
Logger.error("Échec: %o", new Error("boom"));

- CJS:
const { Logger } = require("@protorians/logger");
Logger.debug("Hello");

## API

### Types

- ILoggerOptions
  - prefix?: string — préfixe affiché avant le message
  - timestampFormat?: TimestampEnum — format du timestamp (par défaut: `TimestampEnum.HH_MM_SS`)
  - level?: LevelEnum — niveau utilisé pour l’instance (par défaut: `LevelEnum.INFO` dans print)
  - timestamp?: boolean — activer/désactiver l’horodatage (par défaut: true)
  - prefixSeparator?: string — séparateur entre le préfixe et le message (par défaut: espace)
  - isInteractive?: boolean — indicateur libre (non utilisé dans la mise en forme actuelle)
  - isVerbose?: boolean — indicateur libre (non utilisé dans la mise en forme actuelle)
  - isColorEnabled?: boolean — activer/désactiver les couleurs (par défaut: auto selon TTY)

- Enums depuis `@protorians/core`
  - LevelEnum: NORMAL, ERROR, CRITICAL, WARN, NOTICE, INFO, DEBUG, FATAL, TRACE, DONE, SILENT
  - TimestampEnum: p.ex. HH_MM_SS (utilisé par défaut)

### Classe: Logger

- constructor(options: ILoggerOptions)
  - Crée une instance avec des options. La méthode d’instance `print` utilisera `options.level` (par défaut INFO) pour choisir la couleur et la sortie console adéquate.

- print(message: string, ...args: any[]) => void
  - Construit l’en-tête (timestamp, label de niveau, préfixe) puis délègue au bon flux console:
    - consoleForLevel(level) depuis `@protorians/core` (ex: console.error pour ERROR, etc.)
  - Respecte:
    - isColorEnabled (auto: `process.stdout.isTTY` si dispo)
    - timestamp (true par défaut)
    - timestampFormat (par défaut HH_MM_SS)
    - prefix + prefixSeparator
  - Émet un événement via `@protorians/events-bus` (voir plus bas).

- Méthodes statiques de commodité (créent un `Logger` avec options par défaut et le niveau indiqué, puis appellent `print`):
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

Remarques sur les valeurs par défaut utilisées par ces méthodes statiques:
- timestamp: true
- timestampFormat: TimestampEnum.HH_MM_SS
- isColorEnabled: auto selon TTY

### Exemple avec instance

import { Logger } from "@protorians/logger";
import { LevelEnum, TimestampEnum } from "@protorians/core";

const appLogger = new Logger({
  prefix: "api",
  level: LevelEnum.INFO,             // niveau utilisé par print
  timestamp: true,
  timestampFormat: TimestampEnum.HH_MM_SS,
  prefixSeparator: " | ",
  isColorEnabled: true
});

appLogger.print("Serveur prêt sur %s", "http://localhost:3000");

// Changer dynamiquement le niveau (instance) :
appLogger.options.level = LevelEnum.DEBUG;
appLogger.print("Requête: %o", { method: "GET", path: "/" });

### Désactiver couleurs ou horodatage

Logger.info("Couleurs auto selon TTY");
new Logger({ level: LevelEnum.INFO, isColorEnabled: false }).print("Sans couleur");
new Logger({ level: LevelEnum.INFO, timestamp: false }).print("Sans timestamp");

## Intégration Events Bus

Chaque log émet un événement via `EventBus.dispatch(key, payload)` où `payload` est:

- { message: string, level: LevelEnum, header: string, args: any[] }

La clé `key` dépend du niveau:

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

Cela permet de centraliser ou rediriger les logs vers d’autres cibles (fichier, télémétrie, etc.) en s’abonnant au bus d’événements du package `@protorians/events-bus`.

## Formats et rendu

- Le label du niveau est mis en majuscules (ex: INFO, ERROR). Pour `LevelEnum.NORMAL`, le label affiché est "LOG".
- Le timestamp est rendu entre crochets: [HH:MM:SS] par défaut.
- Les couleurs proviennent de `consoleColorizeLevel` de `@protorians/core`.

## Bonnes pratiques

- Utilisez les méthodes statiques pour des logs rapides.
- Créez des instances `Logger` si vous avez besoin d’un préfixe dédié (ex: un microservice), d’un format spécifique ou pour fixer un niveau.
- Configurez `isColorEnabled` à false pour des environnements CI non TTY si nécessaire.

## Licence

ISC
