// Cache incoming articles in IndexedDB implementing a logic to update read/obsolete articles.\
// Try to keep max MAX_ARTICLES in the cache.

import { Miniflux, EntryStatus } from "./miniflux";

console.log("./cache.js imported");

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
const dbName = "maxiflux";
const dbOpened = new Promise((resolve, reject) => {
  const dbOpen = indexedDB.open(dbName, 1);
  dbOpen.onerror = (event) => {
    // Handle errors.
  };
  dbOpen.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('articles')) {
      const objectStore = db.createObjectStore("articles", { keyPath: "id" });
      objectStore.createIndex("status", "status", { unique: false });
    }
  }

  dbOpen.onsuccess = function (event) {
    // Equal to: db = req.result;
    resolve(event.target.result);
    console.log("Offline database ready");
  };
});

export async function get_data() {
  return dbOpened.then(db => {
    const dbx = db.transaction(["articles"]).objectStore("articles");
    let articles = {total: 0, entries: [], updated: new Date(localStorage.getItem("cache_updated"))}
    return new Promise((resolve, _) => {
      dbx.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if(cursor.value.status != EntryStatus["REMOVED"]) {
          articles.entries.push(cursor.value);
          articles.total += 1;
        }
        cursor.continue();
      } else {
        resolve(articles);
      }
    }});
  });
}

export async function mark_read(id) {
  return dbOpened.then(db => {
    const dbx = db.transaction(["articles"]).objectStore("articles");
    const req = dbx.get(id)
    
    return new Promise((resolve, _) => {
      req.onsuccess = () => {
        let data = req.result;
        data.status = EntryStatus["READ"]
        let res = dbx.update(data);
        res.onsuccess = () => {
          resolve();
        }
      }
    })
  });
}

export async function get_entry(id) {
  return dbOpened.then(db => {
    const dbx = db.transaction(["articles"]).objectStore("articles");
    const req = dbx.get(id)
    return new Promise((resolve, _) => {
      req.onsuccess = () => {
        resolve(req.result);
      } 
    });
  });
}

export async function mark(id, status) {
  if (status != "READ" && status != "REMOVED") throw new Error("Must be READ or REMOVED");
  let data = await get_entry(id)
  return dbOpened.then(db => {
    const dbx = db.transaction(["articles"], "readwrite").objectStore("articles");
    const req = dbx.get(id)
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


export async function all_entries() {
  return dbOpened.then(db => {
    const dbx = db.transaction(["articles"]).objectStore("articles");
    const req = dbx.getAll()
    return new Promise((resolve, _) => {
      req.onsuccess = () => {
        resolve(req.result);
      } 
    });
  });
}

export async function update_data(data) {
  return dbOpened.then(db => {
    const dbx = db.transaction(["articles"], "readwrite").objectStore("articles");
    data.entries.forEach((entry) => {
      // get or update the article
      dbx.add(entry)
    });
    // reset the max_age to `now` to show the DB was just updated
    localStorage.setItem("cache_updated", new Date().toISOString())
  });
}

// @return age in miliseconds from now
export function get_age() {
  if (localStorage.getItem("cache_updated") == null) {
    return NaN
  }
  return Date.now() - new Date(localStorage.getItem("cache_updated")).getTime();
}

// @return age in days from now
export function to_days() {
  let age = get_age();
  return Math.round(age / 1000 / 3600 / 24);
}
