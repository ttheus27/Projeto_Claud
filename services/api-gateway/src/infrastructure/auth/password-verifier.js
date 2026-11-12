import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function createPasswordVerifier(username, password) {
  const salt = randomBytes(16); const hash = scryptSync(password, salt, 32);
  return { verify: data => timingSafeEqual(scryptSync(data.password, salt, 32), hash) && data.username === username ? username : null };
}
