// src/lib/serialize.ts

import { Decimal } from "@prisma/client/runtime/library";

/**
 * Type helper: rekursif convert Decimal → number, bigint → string
 */
export type Serialized<T> = T extends Decimal
  ? number
  : T extends Date
  ? Date
  : T extends bigint
  ? string
  : T extends null
  ? null
  : T extends undefined
  ? undefined
  : T extends Array<infer U>
  ? Array<Serialized<U>>
  : T extends object
  ? { [K in keyof T]: Serialized<T[K]> }
  : T;

/**
 * Detect apakah value adalah Decimal object dari Prisma.
 * Cek multiple ways karena Decimal bisa datang dari berbagai instance.
 */
function isDecimal(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value !== "object") return false;

  // Cek instance check
  if (value instanceof Decimal) return true;

  // Cek constructor name (fallback untuk edge case)
  if (
    value.constructor &&
    value.constructor.name === "Decimal"
  ) {
    return true;
  }

  // Cek struktur internal Decimal (s, e, d properties)
  const obj = value as Record<string, unknown>;
  if (
    typeof obj.s === "number" &&
    typeof obj.e === "number" &&
    Array.isArray(obj.d) &&
    typeof obj.toString === "function"
  ) {
    return true;
  }

  return false;
}

/**
 * Convert Decimal-like object ke number secara aman.
 */
function decimalToNumber(value: unknown): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  // Fallback: pakai toString lalu parseFloat
  if (
    value &&
    typeof value === "object" &&
    typeof (value as { toString: () => string }).toString === "function"
  ) {
    return parseFloat((value as { toString: () => string }).toString());
  }
  return Number(value);
}

/**
 * Rekursif serialize semua non-plain values.
 */
export function serializePrisma<T>(input: T): Serialized<T> {
  if (input === null || input === undefined) {
    return input as Serialized<T>;
  }

  // Decimal → number (pakai defensive check)
  if (isDecimal(input)) {
    return decimalToNumber(input) as Serialized<T>;
  }

  // Date → keep as Date
  if (input instanceof Date) {
    return input as Serialized<T>;
  }

  // BigInt → string
  if (typeof input === "bigint") {
    return input.toString() as Serialized<T>;
  }

  // Array → recursive
  if (Array.isArray(input)) {
    return input.map((item) => serializePrisma(item)) as Serialized<T>;
  }

  // Plain object → recursive
  if (typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      result[key] = serializePrisma(value);
    }
    return result as Serialized<T>;
  }

  return input as Serialized<T>;
}