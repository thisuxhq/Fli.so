// See https://svelte.dev/docs/kit/types#app

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: import("$lib/server/auth").SessionValidationResult["user"];
      session: import("$lib/server/auth").SessionValidationResult["session"];
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
