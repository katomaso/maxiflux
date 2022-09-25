import { Miniflux, InvalidCredentialsError, OfflineError, EntryStatus } from "./miniflux.js"
import { writable } from "svelte/store"
import { page, next } from "./router.js"

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

class Client {
  miniflux = null
  updated = null // datetime
  update_after_days = 5 // update cache from online only after 5 days of the last update
  
  /**
   * Connect
   * @param {string} url full url (can omit https:// because it will be enforced anyway)
   * @param {string} password password or APIkey
   * @param {string} username username when using password login (OPTIONAL)
   */
  connect(url, password, username) {
    if (!username) {
      // using API key sign-on without username
    }
  }

  is_connected() {
  }

  get_name() {
  }

  /**
   * Return data object with {total:int, updated:Date, source="cache"|"online", entries:[Entry]} keys.
   * Might throw exception Login
   */
  get_data(force_refresh) {

  }

  mark_read(id) {}
  delete(id) {}

}
