/**
 * The config module.
 *
 * This module is responsible for obtaining and parsing any necessary
 * configuration.  It is the responsibility of this module to fail
 * hard and fast if any required config is missing.  Else the bugs
 * will probably just appear in production when you least expect it.
 * That wouldn't be good.
 */

class ConfigError extends Error {
  public name = "ConfigError";
}

// =====================================================================

export interface Config {
  environment: string;
  apiUri: string;
  museumOverride?: "demo" | "brighton" | "munch" | "mpu";
}

export const config: Config = {
  environment: readAsString(process.env.NEXT_PUBLIC_ENVIRONMENT),
  apiUri: readAsString(process.env.NEXT_PUBLIC_API_URI),
  cmsUri: readAsStringServerOnly(process.env.CMS_URI),
  revalidateTime: readAsIntServerOnly(process.env.REVALIDATE_TIME),
  museumOverride:
    process.env.NEXT_PUBLIC_MUSEUM_OVERRIDE === "demo"
      ? "demo"
      : process.env.NEXT_PUBLIC_MUSEUM_OVERRIDE === "brighton"
      ? "brighton"
      : process.env.NEXT_PUBLIC_MUSEUM_OVERRIDE === "munch"
      ? "munch"
      : process.env.NEXT_PUBLIC_MUSEUM_OVERRIDE === "mpu"
      ? "mpu"
      : undefined,
};

// =====================================================================

// =======
// Helpers
// =======

function readAsStringServerOnly(val?: string): string {
  if (typeof window !== "undefined") return "";
  return readOrThrow(val);
}

function readAsIntServerOnly(val?: Number): Number {
  if (typeof window !== "undefined") return 100;
  val = parseInt(val);
  if (val === undefined) {
    throw new ConfigError("Required value missing");
  }
  return val;
}

function readAsString(val?: string): string {
  return readOrThrow(val);
}

// function readAsBool(val?: string): boolean {
//   const val = readOrThrow(val).toLowerCase();
//   if (val === 'true') return true;
//   if (val === 'false') return false;
//   throw new ConfigError(`Invalid value: ${name}`);
// }

// function readAsInt(val?: string): number {
//   return parseInt(readOrThrow(val), 10);
// }

function readOrThrow(val?: string): string {
  if (val === undefined || val.trim() === "") {
    throw new ConfigError(`Required value missing`);
  }

  return val.trim();
}
