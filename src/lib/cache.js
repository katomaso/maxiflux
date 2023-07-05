// Cache incoming articles in IndexedDB implementing a logic to update read/obsolete articles.\
// Try to keep max MAX_ARTICLES in the cache.

import { EntryStatus } from "./miniflux";

function promise_result(req) {
  return new Promise((resolve, _) => {
    req.onsuccess = () => {
      console.log("PromiseResult resolved: ", req.result);
      resolve(req.result);
    } 
  });
}

/** Example data:
 * {
 * feed_id: 1,
 * hash : "b480338fc0de3b5af9cd7832afd2d5c0e908f1d2d941d1eaeab328fc269ca075",
 * id : 3,
 * published_at : "2022-08-20T13:28:00+02:00",
 * reading_time : 10,
 * share_code : "",
 * starred : false,
 * status : "unread", 
 * title : "...",
 * url : "...original external URL...",
 * user_id : 1,
 * changed_at: "2022-08-20T15:31:00+02:00" // OPTIONAL
 * }
*/

class Cache {

  dbPromise;
  db = null;
  status = "unread";
  index = "status-age";
  indexes = ["status-age", "feed-age"];

  constructor(dbName) {
    this.dbPromise = new Promise((resolve, reject) => {
      const dbOpen = indexedDB.open(dbName, 1);
      dbOpen.onerror = (event) => {
        // Handle errors.
      };
      dbOpen.onupgradeneeded = (event) => {
        const db = event.target.result;
        const articleStore = db.createObjectStore("articles", { keyPath: "id" });
        articleStore.createIndex("status-age", ["status", "published_at"], { unique: false });
        articleStore.createIndex("feed-age", ["feed_id", "published_at"], { unique: false });
        const feedStore = db.createObjectStore("feeds", { keyPath: "id" });
      }
      dbOpen.onsuccess = function (event) {
        resolve(event.target.result);
        console.log(`Cache ${dbName} ready`);
      };
    });
  }

  async connect() {
    return this.dbPromise.then((db) => {
      this.db = db;
    });
  }

  /** Query entries from the database with respect to global `sort` and `status` ordering/filtering */
  async query(filter) {
    return this.dbPromise.then((db) => {
      const dbx = db.transaction(["articles"]).objectStore("articles");
      let index = "status-age";
      let keyrange = IDBKeyRange.bound([filter.status, new Date(0)], [filter.status, new Date()]);
      if(filter.feed > 0) {
        index = "feed-age";
        keyrange = IDBKeyRange.bound([filter.feed, new Date(0)], [filter.feed, new Date()]);
      }
      return new Promise((resolve, _) => {
        let articles = [];
        dbx.index(index).openCursor(keyrange, filter.directionDesc ? "prev" : "next").onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          articles.push(cursor.value);
          cursor.continue();
        } else {
          resolve(articles);
        }
      }});
    });
  }

  async get_entry(id) {
    return promise_result(
      this.db.transaction(["articles"]).objectStore("articles").get(id)
    );
  }

  async mark(id, status) {
    if (status != "READ" && status != "REMOVED") throw new Error("Must be READ or REMOVED");
    return this.dbPromise.then(db => {
      const dbx = db.transaction(["articles"], "readwrite").objectStore("articles");
      const req = dbx.get(id)
      console.log(`Marking article ${id} as ${status}`);
      return new Promise((resolve, _) => {
        req.onsuccess = () => {
          let entry = req.result;
          entry.status = EntryStatus[status]
          let res = dbx.put(entry);
          res.onsuccess = () => {
            resolve();
          }
        } 
      });
    });
  }

  async entries() {
    return this.dbPromise.then(db => {
      const dbx = db.transaction(["articles"]).objectStore("articles");
      const req = dbx.getAll();
      return new Promise((resolve, _) => {
        req.onsuccess = () => {
          resolve(req.result);
        } 
      });
    });
  }

  async feeds() {
    return promise_result(
      this.db.transaction(["feeds"]).objectStore("feeds").getAll()
    );
  }

  async next_article(current, filter) {
    const data = await this.query(filter);
    let found = false;
    for(const entry of data.entries) {
      if (found) return entry; // return the record after the current item was found
      found = (entry.id == current.id);
    }
    return data.entries.at(-1);
  }

  async clear() {
    let db = await this.dbPromise;
    const dbx = db.transaction(["articles"], "readwrite").objectStore("articles");
    return new Promise((resolve, _) => {
      dbx.clear().onsuccess = resolve;
      localStorage.removeItem("cache_updated");
      console.log("Cache cleared");
    });
  }

  async update(entries) {
    let db = await this.dbPromise;
    const dbx = db.transaction(["articles"], "readwrite").objectStore("articles");
    console.log("Cache updated");
    
    function max(values) {
      let max = values[0];
      for (let i = 1; i < values.length; i++) {
        if (values[i] > max) max = values[i];
      }
      return max;
    }

    return entries.map( // TODO: update "cache_updated" only when all records were added successfully : Promise.all or something
      (entry) => new Promise((resolve, _) => {
        entry.published_at = new Date(entry.published_at);
        entry.changed_at = max([new Date(entry.published_at), new Date(entry.changed_at), new Date(entry.created_at), new Date(entry.modified)]);
        dbx.add(entry).onsuccess = () => {
          localStorage.setItem("cache_updated", new Date().toISOString());
          resolve();
        }
      }
    ));
  }

  // @return age in miliseconds from now
  get age() {
    if (localStorage.getItem("cache_updated") == null) {
      return null;
    }
    return new Date(localStorage.getItem("cache_updated"));
  }

  
}

export const cache = new Cache("maxiflux");
