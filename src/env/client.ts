import { clientEnv, clientSchema, formatErrors } from "./schema";

const _clientEnv = clientSchema.safeParse(clientEnv);

if (!_clientEnv.success) {
  console.error(
    "❌ Invalid client environment variables:\n",
    ...formatErrors(_clientEnv.error.format())
  );
  throw new Error("Invalid client environment variables");
}

for (const key of Object.keys(_clientEnv.data)) {
  if (!key.startsWith("NEXT_PUBLIC_")) {
    console.warn(
      `❌ Invalid public environment variable name: ${key}. It must begin with 'NEXT_PUBLIC_'`
    );

    throw new Error("Invalid public environment variable name");
  }
}

export const env = _clientEnv.data;
