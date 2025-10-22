import "dotenv/config"

function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

type Config = {
  baseURL: string;
  port: string;
  platform: string;
  clientURL: string;
};

export const config: Config = {
  baseURL: envOrThrow("BASE_URL"),
  port: envOrThrow("PORT"),
  platform: envOrThrow("PLATFORM"),
  clientURL: envOrThrow("CLIENT_URL"),
};

