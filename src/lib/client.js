import { Miniflux, InvalidCredentialsError, OfflineError, EntryStatus } from "./miniflux.js"

class Client {
  miniflux;

  constructor() {
    this.miniflux = new Miniflux();
  }

  async connect(url, username, password) {
    return this.miniflux.connect(url, username, password);
  }

  get connected() {
    return this.miniflux.is_connected();
  }

  get offline() {
    return this.miniflux.is_offline();
  }

  mark_read(id) {
    this.miniflux.update_entries([id], EntryStatus["READ"]);
  }

  /** Transform Filter class into Miniflux filters */
  #filter(filter) {
    return {
      status: filter.status, // "read", "unread"
      order: "published_at", // "id", "status", "published_at", "category_title", "category_id"
      direction: filter.directionDesc ? "desc" : "asc",
      limit: 100
    }
  }

  async query(filter) {
    if(filter.feed > 0) {
      return this.miniflux.get_feed_entries(filter.feed, this.#filter(filter));
    }
    return this.miniflux.get_entries(this.#filter(filter));
  }

  async sync(entries) {
    let read = []
    let deleted = []
    for (let entry of entries) {
      if (entry.status ==  EntryStatus["READ"]) {
        read.push(entry.id)
      }
      if (entry.status ==  EntryStatus["REMOVED"]) {
        deleted.push(entry.id)
      }
    }

    if(read.length > 0) {
      await this.miniflux.update_entries(read, EntryStatus["READ"]);
    }
    if(deleted.length > 0) {
      await this.miniflux.update_entries(deleted, EntryStatus["REMOVED"]);
    }
  }
}

export let client = new Client();