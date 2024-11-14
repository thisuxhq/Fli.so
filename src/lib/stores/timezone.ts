import { persisted } from 'svelte-persisted-store'

export const timezone = persisted('timezone', 
  Intl.DateTimeFormat().resolvedOptions().timeZone // Default to browser timezone
); 