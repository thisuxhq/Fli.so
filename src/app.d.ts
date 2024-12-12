// See https://svelte.dev/docs/kit/types#app

import type { TypedPocketBase } from "$lib/types";
import type PocketBase from "pocketbase";
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      pb: TypedPocketBase;
      cmsPb: PocketBase;
      user: import("pocketbase").default["authStore"]["model"];
    }
    // interface PageData {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
