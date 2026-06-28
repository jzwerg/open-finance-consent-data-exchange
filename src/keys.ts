/**
 * Signing-key bootstrap.
 *
 * First boot needs no pre-provisioned secrets: if the keys directory has no key,
 * we generate an EC P-256 (ES256) keypair and persist it to FAPI_KEYS_DIR. A
 * later milestone wires these into the FAPI 2.0 auth server (PAR + DPoP); for now
 * this just proves keys are created and available, idempotently.
 */
import { generateKeyPairSync, createPublicKey } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface SigningKeyInfo {
  dir: string;
  privateKeyPath: string;
  publicJwkPath: string;
  generated: boolean;
}

export function ensureSigningKeys(dir: string): SigningKeyInfo {
  const privateKeyPath = join(dir, "signing-key.pem");
  const publicJwkPath = join(dir, "signing-key.public.jwk.json");

  if (existsSync(privateKeyPath)) {
    return { dir, privateKeyPath, publicJwkPath, generated: false };
  }

  mkdirSync(dir, { recursive: true });

  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }) as string;
  const publicJwk = createPublicKey(privateKey).export({ format: "jwk" });

  writeFileSync(privateKeyPath, privatePem, { mode: 0o600 });
  writeFileSync(
    publicJwkPath,
    JSON.stringify({ ...publicJwk, use: "sig", alg: "ES256" }, null, 2),
  );

  return { dir, privateKeyPath, publicJwkPath, generated: true };
}

export function readPublicJwk(info: SigningKeyInfo): Record<string, unknown> {
  return JSON.parse(readFileSync(info.publicJwkPath, "utf8"));
}
