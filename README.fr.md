# @protorians/logger

Un logger minimaliste et typé pour Node.js et ESM, avec mise en forme de timestamps, niveaux colorés, préfixes et intégration à @protorians/events-bus.

- Runtime: Node >= 22
- Exports: ESM et CJS (types inclus)
- Dépendances: `@protorians/core`, `@protorians/events-bus`

## Sommaire

- [Installation](#installation)
- [Aperçu](#aperçu)
- [Utilisation rapide](#utilisation-rapide)
- [API](#api)
  - [Types](#types)
  - [Classe: Logger](#classe-logger)
  - [Exemple avec instance](#exemple-avec-instance)
  - [Désactiver couleurs ou horodatage](#désactiver-couleurs-ou-horodatage)
- [Intégration Events Bus](#intégration-events-bus)
- [Formats et rendu](#formats-et-rendu)
- [Bonnes pratiques](#bonnes-pratiques)
- [Licence](#licence)

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

Propriétés (ILoggerOptions) :

| Propriété         | Type            | Par défaut                    | Description                                                    |
|-------------------|-----------------|--------------------------------|----------------------------------------------------------------|
| prefix            | string          | —                              | Préfixe affiché avant le message                               |
| timestampFormat   | TimestampEnum   | TimestampEnum.HH_MM_SS         | Format du timestamp                                            |
| level             | LevelEnum       | LevelEnum.INFO (pour print)    | Niveau utilisé par l’instance lors de l’affichage              |
| timestamp         | boolean         | true                           | Activer/désactiver l’horodatage                                |
| prefixSeparator   | string          | " " (espace)                  | Séparateur entre le préfixe et le message                      |
| isInteractive     | boolean         | —                              | Indicateur libre (non utilisé dans la mise en forme actuelle)  |
| isVerbose         | boolean         | —                              | Indicateur libre (non utilisé dans la mise en forme actuelle)  |
| isColorEnabled    | boolean         | auto (selon TTY)               | Activer/désactiver les couleurs                                |

Enums depuis `@protorians/core` :

| Enum          | Valeurs                                                                                  | Notes                     |
|---------------|-------------------------------------------------------------------------------------------|---------------------------|
| LevelEnum     | NORMAL, ERROR, CRITICAL, WARN, NOTICE, INFO, DEBUG, FATAL, TRACE, DONE, SILENT           | Utilisé pour les niveaux  |
| TimestampEnum | p.ex. HH_MM_SS                                                                            | Défaut: HH_MM_SS          |

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

- Méthodes statiques de commodité (chacune crée un `Logger` avec les valeurs par défaut, fixe le niveau, puis appelle `print`) :

| Méthode                     | LevelEnum | Description                         |
|----------------------------|-----------|-------------------------------------|
| Logger.log(msg, ...args)   | NORMAL    | Log standard                        |
| Logger.notice(msg, ...args)| NOTICE    | Log de type notice                  |
| Logger.error(msg, ...args) | ERROR     | Erreur (stderr)                     |
| Logger.warn(msg, ...args)  | WARN      | Avertissement                       |
| Logger.debug(msg, ...args) | DEBUG     | Informations de debug               |
| Logger.trace(msg, ...args) | TRACE     | Détails de trace                    |
| Logger.fatal(msg, ...args) | FATAL     | Erreurs fatales                     |
| Logger.critical(msg, ...args)| CRITICAL| Erreurs critiques                   |
| Logger.info(msg, ...args)  | INFO      | Message d’information               |
| Logger.success(msg, ...args)| DONE     | Message de succès                   |

Valeurs par défaut utilisées par ces helpers :

| Option           | Par défaut                 |
|------------------|----------------------------|
| timestamp        | true                       |
| timestampFormat  | TimestampEnum.HH_MM_SS     |
| isColorEnabled   | auto (selon TTY)           |

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

La clé `key` dépend du niveau :

| LevelEnum | Clé EventBusEnum |
|-----------|-------------------|
| NORMAL    | LOG               |
| ERROR     | LOG_ERROR         |
| CRITICAL  | LOG_CRITICAL      |
| WARN      | LOG_WARNING       |
| NOTICE    | LOG_NOTICE        |
| INFO      | LOG_INFO          |
| DEBUG     | LOG_DEBUG         |
| FATAL     | LOG_EMERGENCY     |
| TRACE     | LOG_TRACE         |
| SILENT    | LOG_SILENT        |

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
