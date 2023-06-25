import { Miniflux, InvalidCredentialsError, OfflineError, EntryStatus } from "./miniflux.js"
import { writable } from "svelte/store"
import { page, next } from "./router.js"
import { all_entries } from "./cache.js";

export const OK = "ONLINE", OFFLINE = "OFFLINE", NOT = "NOT CONNECTED"; // error either credentials or server error
export let connected = writable(NOT) // reactive property for the frontend
export let client = new Miniflux();
export {InvalidCredentialsError, OfflineError};

function get_client() {
  if(!client.is_connected()) {
    // next.set(page.subscribe);
    next.set("Article");
    page.set("Connect");
    return;
  }
  return client;
}

export function mark_read(id) {
  get_client()?.update_entries([id], EntryStatus["READ"]);
}

async function sync_cache_to_server(val) {
  console.log(`Syncing cache to server? ${val == OK}`)
  if(val != OK) return;

  let read = []
  let deleted = []
  let entries = await all_entries()
  entries.forEach((entry) => {
    if (entry.status ==  EntryStatus["READ"]) {
      read.push(entry.id)
    }
    if (entry.status ==  EntryStatus["REMOVED"]) {
      deleted.push(entry.id)
    }
  })
  if(read.length > 0) {
    get_client()?.update_entries(read, EntryStatus["READ"]);
  }
  if(deleted.length > 0) {
    get_client()?.update_entries(deleted, EntryStatus["REMOVED"]);
  }
}

connected.subscribe(sync_cache_to_server)
// connected.subscribe(updateEntries)
