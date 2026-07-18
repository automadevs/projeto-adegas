export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type TenantId = Brand<string, "TenantId">;
export type BranchId = Brand<string, "BranchId">;
export type UserId = Brand<string, "UserId">;
export type IdempotencyKey = Brand<string, "IdempotencyKey">;
export type MoneyCents = Brand<bigint, "MoneyCents">;

export interface TenantScope {
  readonly tenantId: TenantId;
  readonly branchId: BranchId;
  readonly userId: UserId;
}

export const Money = {
  zero(): MoneyCents {
    return 0n as MoneyCents;
  },

  fromCents(value: bigint | number | string): MoneyCents {
    const cents = toBigInt(value);

    if (cents < 0n) {
      throw new RangeError("Money cannot be negative in this context.");
    }

    return cents as MoneyCents;
  },

  add(left: MoneyCents, right: MoneyCents): MoneyCents {
    return (left + right) as MoneyCents;
  },

  subtract(left: MoneyCents, right: MoneyCents): MoneyCents {
    if (right > left) {
      throw new RangeError("Money subtraction cannot produce a negative value.");
    }

    return (left - right) as MoneyCents;
  },

  multiplyByQuantity(value: MoneyCents, quantity: bigint | number | string): MoneyCents {
    const normalizedQuantity = toBigInt(quantity);

    if (normalizedQuantity < 0n) {
      throw new RangeError("Quantity cannot be negative.");
    }

    return (value * normalizedQuantity) as MoneyCents;
  }
};

export function asTenantId(value: string): TenantId {
  return assertNonEmpty(value, "tenantId") as TenantId;
}

export function asBranchId(value: string): BranchId {
  return assertNonEmpty(value, "branchId") as BranchId;
}

export function asUserId(value: string): UserId {
  return assertNonEmpty(value, "userId") as UserId;
}

export function asIdempotencyKey(value: string): IdempotencyKey {
  return assertNonEmpty(value, "idempotencyKey") as IdempotencyKey;
}

function assertNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new RangeError(`${field} cannot be empty.`);
  }

  return trimmed;
}

function toBigInt(value: bigint | number | string): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new RangeError("Monetary numbers must be safe integers in cents.");
    }

    return BigInt(value);
  }

  if (!/^-?\d+$/.test(value)) {
    throw new RangeError("Expected an integer string.");
  }

  return BigInt(value);
}
