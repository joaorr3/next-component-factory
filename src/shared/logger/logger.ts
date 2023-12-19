import winston from "winston";
import type { Logs, PrismaClient } from "@prisma/client";
import Transport, { type TransportStreamOptions } from "winston-transport";
import Prisma from "../prisma/client";

const prisma = Prisma.Instance;

enum LogEnvs {
  db = "db",
  console = "console",
}

enum LogScopes {
  Discord = "Discord",
  Notion = "Notion",
  Server = "Server",
}

interface PrismaTransporterOptions extends TransportStreamOptions {
  prisma: PrismaClient;
}

class PrismaTransport extends Transport {
  private prisma: PrismaClient;

  constructor(options: PrismaTransporterOptions) {
    super(options);
    this.prisma = options.prisma;
  }

  async log(info: Logs, callback?: (error?: Error, value?: unknown) => void) {
    try {
      const { level, message, meta, scope } = info;

      process.nextTick(async () => {
        await this.prisma.logs.create({
          data: {
            level,
            message,
            // @ts-ignore
            meta,
            scope,
          },
        });
        setImmediate(() => {
          this.emit("logged", info);
        });

        return callback?.(undefined, true);
      });
    } catch (error) {
      setImmediate(() => {
        this.emit("error", error);
      });

      // @ts-ignore
      callback?.(error, null);
    }
  }
}

type Level = "info" | "error" | "debug" | "warn";

const createScopedLog = (scope: LogScopes, logger: winston.Logger) => {
  return ({ level, message }: { level: Level; message: string }) => {
    logger.log({
      scope,
      level,
      message,
    });
  };
};

const baseLogger = winston.createLogger({
  level: "http",
  format: winston.format.combine(
    winston.format((info) => {
      const message = `[${info.scope}]: ${info.message}`;
      info.message = message;
      return info;
    })(),
    winston.format.json()
  ),
});

winston.loggers.add(LogEnvs.db, {
  ...baseLogger,
  transports: [
    new PrismaTransport({
      level: "http",
      prisma: prisma.client,
    }),
  ],
});

winston.loggers.add(LogEnvs.console, {
  ...baseLogger,
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const createPrismaLogger = () => {
  const logger = winston.loggers.get(LogEnvs.db);

  const discord = createScopedLog(LogScopes.Discord, logger);
  const notion = createScopedLog(LogScopes.Notion, logger);
  const server = createScopedLog(LogScopes.Server, logger);

  return {
    discord,
    notion,
    server,
  };
};

const createConsoleLogger = () => {
  const logger = winston.loggers.get(LogEnvs.console);

  const discord = createScopedLog(LogScopes.Discord, logger);
  const notion = createScopedLog(LogScopes.Notion, logger);
  const server = createScopedLog(LogScopes.Server, logger);

  return {
    discord,
    notion,
    server,
  };
};

const logger = {
  db: createPrismaLogger(),
  console: createConsoleLogger(),
} as const;

export default logger;
