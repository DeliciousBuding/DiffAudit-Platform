import { timingSafeEqual } from "node:crypto";

const MAX_STATE_LENGTH = 256;

export function timingSafeStateEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length || bufA.length > MAX_STATE_LENGTH) {
    // Compare against zeroed buffer to maintain constant-time profile.
    const dummy = Buffer.alloc(Math.min(bufA.length, MAX_STATE_LENGTH));
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
