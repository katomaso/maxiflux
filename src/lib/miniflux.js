let esc = str => {
    if (str != null)
        return str.replace('"', '\\"').replace('\'', '\\\'');
    else
        return null;
};
export class InvalidCredentialsError extends Error {
}
export class OfflineError extends Error {
}
export class Miniflux {
    url;
    username;
    connected = false;
    offline = false;
    authorization;
    async connect(url, username, password) {
        if (this.connected) {
            return true;
        }
        this.url = url;
        this.username = username;
        this.authorization = `Basic ${btoa(username + ':' + password)}`;
        this.connected = await this.get_me().then(user => user != null);
        return this.connected;
    }
    is_connected() { return this.connected; }
    is_offline() { return this.offline; }
    request(path, data = null, method = 'GET') {
        let options = {
            method: method,
            headers: {
                'Authorization': this.authorization
            }
        };
        if (data != null) {
            if (typeof data == 'object') {
                data = JSON.stringify(data);
            }
            options.body = data;
        }
        return fetch(new Request(this.url + path, options))
            .catch(err => {
            this.offline = true;
            throw new OfflineError("you are offline");
        })
            .then((response) => {
            this.offline = false;
            if (!response.ok) {
                if (response.status == 401) {
                    throw new InvalidCredentialsError("invalid credentials");
                }
                else {
                    throw new Error(`${response.status}: ${response.statusText}`);
                }
            }
            return response.json();
        });
    }
    get = (path) => this.request(path, null, 'GET');
    put = (path, data) => this.request(path, data, 'PUT');
    post = (path, data) => this.request(path, data, 'POST');
    delete = (path) => this.request(path, null, 'DELETE');
    discover = (url) => this.post('/v1/discover', `{"url":"${url}"}`);
    feeds = () => this.get('/v1/feeds');
    get_feed = (feed_id) => this.get(`/v1/feeds/${feed_id}`);
    get_feed_icon = (feed_id) => this.get(`/v1/feeds/${feed_id}/icon`);
    create_feed = (feed_url, category_id) => {
        let feed_settings = `{"feed_url": "${feed_url}"`;
        if (category_id !== 0) {
            feed_settings += ', "category_id": ';
            feed_settings += category_id;
        }
        feed_settings += '}';
        return this.post(`/v1/feeds`, feed_settings);
    };
    update_feed = (feed_id, title, category_id) => {
        title = esc(title);
        if (title == null && category_id == null)
            return new Promise((resolve, reject) => reject('No title or category specified'));
        let feed_settings = '{';
        if (title != null)
            feed_settings += `"title": "${esc(title)}"`;
        if (category_id != null) {
            if (title != null)
                feed_settings += ',';
            feed_settings += `"category": {"id": ${category_id}}`;
        }
        feed_settings += '}';
        return this.put(`/v1/feeds/${feed_id}`, feed_settings);
    };
    refresh_feed = (feed_id) => this.put(`/v1/feeds/${feed_id}/refresh`);
    remove_feed = (feed_id) => this.delete(`/v1/feeds/${feed_id}`);
    get_feed_entry = (feed_id, entry_id) => this.get(`/v1/feeds/${feed_id}/entries/${entry_id}`);
    get_entry = (entry_id) => this.get(`/v1/entries/${entry_id}`);
    get_feed_entries = (feed_id, filter) => {
        let options = [];
        if (filter != null) {
            if (filter.status != null)
                options.push(`status=${filter.status}`);
            if (filter.offset != null)
                options.push(`offset=${filter.offset}`);
            if (filter.limit != null)
                options.push(`limit=${filter.limit}`);
            if (filter.direction != null)
                options.push(`direction=${filter.direction}`);
            if (filter.order != null)
                options.push(`order=${filter.order}`);
        }
        let path = `/v1/feeds/${feed_id}/entries`;
        if (options.length > 0) {
            path += '?';
            path += options.join('&');
        }
        return this.get(path);
    };
    get_entries = (filter) => {
        let options = [];
        if (filter != null) {
            if (filter.status != null)
                options.push(`status=${filter.status}`);
            if (filter.offset != null)
                options.push(`offset=${filter.offset}`);
            if (filter.limit != null)
                options.push(`limit=${filter.limit}`);
            if (filter.direction != null)
                options.push(`direction=${filter.direction}`);
            if (filter.order != null)
                options.push(`order=${filter.order}`);
        }
        let path = `/v1/entries`;
        if (options.length > 0) {
            path += '?';
            path += options.join('&');
        }
        return this.get(path);
    };
    update_entries = (entry_ids, status) => this.put(`/v1/entries`, `{\"entry_ids\": [${entry_ids.join(',')}], \"status\": \"${esc(status)}\"}`);
    toggle_bookmark = (entry_id) => this.put(`/v1/entries/${entry_id}/bookmark`);
    categories = () => this.get(`/v1/categories`);
    create_category = (title) => this.post('/v1/categories', `{\"title\": \"${esc(title)}\"}`);
    update_category = (category_id, title) => this.put(`/v1/categories/${category_id}`, `{\"title\": \"${esc(title)}\"}`);
    delete_category = (category_id) => this.delete(`/v1/categories/${category_id}`);
    ompl_export = () => this.get('/v1/export');
    create_user = (username, password, is_admin) => this.post(`/v1/users`, `{\"username\":\"${esc(username)}\", \"password:\": \"${esc(password)}\", \"is_admin\": ${is_admin}}`);
    update_user = (user_id, user_settings) => this.put(`/v1/users/${user_id}`, user_settings);
    users = () => this.get('/v1/users');
    get_user = (user) => this.get(`/v1/users/${user}`);
    get_me = () => this.get(`/v1/users/${this.username}`);
    delete_user = (user_id) => this.delete(`/v1/users/${user_id}`);
}
export var EntryStatus;
(function (EntryStatus) {
    EntryStatus["READ"] = "read";
    EntryStatus["UNREAD"] = "unread";
    EntryStatus["REMOVED"] = "removed";
})(EntryStatus || (EntryStatus = {}));
export var EntryOrder;
(function (EntryOrder) {
    EntryOrder["ID"] = "id";
    EntryOrder["STATUS"] = "status";
    EntryOrder["PUBLISHED_AT"] = "published_at";
    EntryOrder["CATEGORY_TITLE"] = "category_title";
    EntryOrder["CATEGORY_ID"] = "category_id";
})(EntryOrder || (EntryOrder = {}));
export var EntryDirection;
(function (EntryDirection) {
    EntryDirection["ASCENDING"] = "asc";
    EntryDirection["DESCENDING"] = "desc";
})(EntryDirection || (EntryDirection = {}));
//# sourceMappingURL=miniflux.js.map
