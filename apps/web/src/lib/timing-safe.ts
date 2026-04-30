import { timingSafeEqual } from "node:crypto";

export function timingSafeStateEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Pad to same length to avoid timing leak on length difference.
    // Compare against a zeroed buffer to maintain constant-time profile.
    const dummy = Buffer.alloc(bufA.length);
    timingSafeEqual(bufA, dummy);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
