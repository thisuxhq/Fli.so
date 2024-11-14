// generate a random slug using nanoid with custom alphabet
import { customAlphabet } from "nanoid";
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 6);

export function generateSlug() {
  return nanoid();
}

// cn utility function
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
