export type ErrorScope = "DISCORD" | "NOTION" | "PRISMA" | "UNKNOWN";

type ServiceErrorOptions = {
  message?: string;
  code: ErrorScope;
  cause?: unknown;
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

    Object.setPrototypeOf(this, new.target.prototype);
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
  fn: () => T,
  {
    code = "UNKNOWN",
    message = "Unknown Error",
  }: Omit<ServiceErrorOptions, "cause">
): T => {
  try {
    return fn();
  } catch (error) {
    throw new ServiceError({
      code,
      message,
      cause: error,
    });
  }
};

export function ErrorHandler({
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
      });
    };

    return descriptor;
  };
}
