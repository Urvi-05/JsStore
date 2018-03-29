import { Like } from "./like_logic";

export class Where extends Like {
    private executeWhereLogic(column, value, op) {
        value = op ? value[op] : value;
        var cursor_request,
            cursor: IDBCursorWithValue;
        if (this._checkFlag) {
            cursor_request = this._objectStore.index(column).openCursor(this.getKeyRange(value, op));
            cursor_request.onsuccess = function (e) {
                cursor = e.target.result;
                if (cursor) {
                    if (this._whereChecker.check(cursor.value)) {
                        ++this._resultCount;
                    }
                    cursor.continue();
                }
                else {
                    this.onQueryFinished();
                }
            }.bind(this);
        }
        else {
            if (this._objectStore.count) {
                cursor_request = this._objectStore.index(column).count(this.getKeyRange(value, op));
                cursor_request.onsuccess = function () {
                    this._resultCount = cursor_request.result;
                    this.onQueryFinished();
                }.bind(this);
            }
            else {
                cursor_request = this._objectStore.index(column).openCursor(this.getKeyRange(value, op));
                cursor_request.onsuccess = function (e) {
                    cursor = e.target.result;
                    if (cursor) {
                        ++this._resultCount;
                        cursor.continue();
                    }
                    else {
                        this.onQueryFinished();
                    }
                }.bind(this);
            }
        }
        cursor_request.onerror = function (e) {
            this._errorOccured = true;
            this.onErrorOccured(e);
        }.bind(this);
    }
}