class Filter {
    _status = "unread";
    _feed = 0;
    _desc = true;

    setDirectionDesc() {
        this._desc = true;
    }
    setDirectionAsc() {
        this._desc = false;
    }

    setStatus(status) {
        this._status = status;
    }

    setFeed(feed) {
        this._feed = feed;
    }

    get feed() {return this._feed}
    get status() {return this._status}
    get directionDesc() {return this._desc}
}

export let filter = new Filter();