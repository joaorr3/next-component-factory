export type ErrorScope =
  | "DISCORD"
  | "NOTION"
  | "PRISMA"
  | "DATA_EXCHANGE"
  | "AZURE"
  | "UNKNOWN";

type ServiceErrorOptions = {
  message?: string;
  code: ErrorScope;
  cause?: unknown;
  fnArgs?: any[];
};

export function getMessageFromUnknownError(
  err: unknown,
  fallback: string
): string {
  if (typeof err === "string") {
    return err;
  }

  if (err instanceof Error && typeof err.message === "string") {
    return err.message;
  }
  return fallback;
}

export function getErrorFromUnknown(cause: unknown): Error {
  if (cause instanceof Error) {
    return cause;
  }
  const message = getMessageFromUnknownError(cause, "Unknown error");
  return new Error(message);
}

export class ServiceError extends Error {
  public readonly cause?;
  public readonly code;
  public readonly details;
  public readonly fnArgs;

  constructor(opts: ServiceErrorOptions) {
    const code = opts.code;

    const message = opts.message;
    const cause: Error | undefined =
      opts !== undefined ? getErrorFromUnknown(opts.cause) : undefined;

    // @ts-ignore
    super(message, { cause });

    this.code = code;
    this.cause = cause;
    this.name = "ServiceError";
    this.details = opts.message;
    this.fnArgs = opts.fnArgs;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  log() {
    return {
      name: this.name,
      code: this.code,
      cause: this.cause?.message,
      message: this.message,
      stack: this.stack,
      fnArgs: this.fnArgs,
    };
  }
}

/**
 * 
 * 
 * @example
 ```ts
  handledServiceCall(
    () => {
      console.log();
    },
    { code: "DISCORD", message: "Hey" }
  );
  ```
 */
export const handledServiceCall = <T>(
  fn: () => Promise<T>,
  {
    code = "UNKNOWN",
    message = "Unknown Error",
    fnArgs,
  }: Omit<ServiceErrorOptions, "cause">
) => {
  try {
    fn().catch((error) => {
      const serviceError = new ServiceError({
        code,
        message,
        cause: error,
        fnArgs,
      });

      console.warn(serviceError.log());
    });
  } catch (error) {
    console.error("ERROR?: ", error);
  }

  // try {
  //   const res = await fn();
  //   return res;
  // } catch (error) {
  //   const serviceError = new ServiceError({
  //     code,
  //     message,
  //     cause: error,
  //     fnArgs,
  //   });

  //   console.warn(serviceError.log());
  //   return serviceError.log() as T;
  // }
};

export function ServiceErrorHandler({
  code,
  message,
}: Omit<ServiceErrorOptions, "cause">) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return handledServiceCall(() => originalMethod.apply(this, args), {
        code,
        message,
        fnArgs: args,
      });
    };

    return descriptor;
  };
}

export const handledMethodCall = <T>(fn: () => T): T => {
  try {
    return fn();
  } catch (error) {
    console.warn("error: ", error);
    return undefined as T;
  }
};

export function ErrorHandler() {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return handledMethodCall(() => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
