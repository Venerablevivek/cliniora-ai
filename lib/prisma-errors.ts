import { Prisma } from "@/lib/generated/prisma/client";

/** True when a write failed because it violated a unique constraint (Postgres 23505). */
export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
