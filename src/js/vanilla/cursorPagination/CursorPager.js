/*
    pageResponse {
        nextPageCursor: "" || null // the cursor for loading the next page
        items: [ ... ] // the items array of items loaded in this request
    }

    pagingParameters {
        cursor: "" // the cursor for the page being loaded
        count: 000 // will be set to loadPageSize from options
        pageNumber: 000 // the current page number this request is being loaded for
        // This object can additionally contain whatever else you want to throw in here, it will be passed to getItems
    }
*/

class CursorPager {
    constructor(
        pageSize, // this should be the number of items each page should have (how many items should be returned from a load page promise)
        loadPageSize, // how many results should be loaded at once to fill these pages (how many items should be requested by getItems)
        getItems // promise function(pagingParameters), function that returns promise for getting items, promise should resolve in pageResponse format
    ) {
        this._pageSize = pageSize;
        this._loadPageSize = loadPageSize;
        this._getItems = getItems;

        this._cache = new PaginationCache(pageSize);
        this._firstPagePagingParameters = {};
        this._pagingParameters = {};
        this._indexCursors = {};

        this._initId = 0;
        this._status = cursorPaginationConstants.status.idle;
        this._currentPageNumber = 1;

        this._setNextPageCursor("");
    }

    // the current status of what the pager is doing (see: cursorPaginationConstants.status)
    get status() {
        return this._status;
    }

    // whether or not the pager is currently loading something
    get isBusy() {
        return this.status !== cursorPaginationConstants.status.idle;
    }

    // gets the current page number
    get currentPageNumber() {
        return this._currentPageNumber;
    }

    // gets the paging parameters set by setPagingParametersAndLoadFirstPage
    get pagingParameters() {
        return Object.assign({}, this._firstPagePagingParameters);
    }
    
    // whether or not the pager has reached the end of the pages of items (will return false if there is no next page to load)
    get hasNextPage() {
        let cacheKey = this._getCacheKey();
        if (this._cache.getLength(cacheKey) > this.currentPageNumber * this._pageSize) {
            // If we have enough in the cache we're good to load the next page
            return true;
        }

        // The cursor for the next page must be defined as a string before we can load the next page with it.
        return typeof (this._pagingParameters.cursor) === "string";
    }

    // whether or not the pager can load the next page of items (will return false if it's busy or there is no next page)
    get canLoadNextPage() {
        return this.hasNextPage && !this.isBusy;
    }

    // whether or not the pager can load the previous page of items (will be false if it's busy or there is no previous page)
    get canLoadPreviousPage() {
        return !this.isBusy && this.currentPageNumber > 1;
    }

    // whether or not the pager can load the first page of items (will return false if it's busy)
    get canLoadFirstPage() {
        return !this.isBusy;
    }

    // whether or not the pager can load the first page of items (will return false if it's busy)
    get canReloadCurrentPage() {
        return !this.isBusy;
    }

    // sets new paging parameters then returns loadFirstPage
    setPagingParametersAndLoadFirstPage(newPagingParameters) {
        let cacheKey = this._getCacheKey();
        this._cache.clear(cacheKey);

        this._currentPageNumber = 1;
        this._indexCursors = {};
        this._firstPagePagingParameters = Object.assign({}, newPagingParameters);
        this._pagingParameters = Object.assign({}, newPagingParameters);

        this._setNextPageCursor("");

        return this._loadPage(1);
    }

    // clears the cache, then loads the first page of items
    reloadCurrentPage() {
        if (this.currentPageNumber === 1) {
            return this.loadFirstPage();
        }

        let cacheKey = this._getCacheKey();
        let highestIndex = 0;
        let indexCursors = this._indexCursors;
        let currentIndex = this.currentPageNumber * (this._pageSize - 1);

        let indexes = Object.keys(indexCursors);
        indexes.forEach((index) => {
            if (Number(index) > currentIndex) {
                // Delete all cursors higher than the index we're at.
                delete indexCursors[index];
            } else {
                highestIndex = Math.max(index, highestIndex);
            }
        });

        let invalidationIndex = Math.floor(currentIndex / this._loadPageSize) * this._loadPageSize;
        this._cache.removeAfterIndex(cacheKey, invalidationIndex);

        this._setNextPageCursor(indexCursors[highestIndex] || "");

        return this._loadPage(this._currentPageNumber);
    }

    // similar to reloadCurrentPage but does not clear the cache first
    getCurrentPage() {
        return this._loadPage(this.currentPageNumber);
    }

    // loads the next page of items
    loadNextPage() {
        return this._loadPage(this.currentPageNumber + 1);
    }

    // loads the previous page of items
    loadPreviousPage() {
        return this._loadPage(this.currentPageNumber - 1);
    }

    // clears the cache, then loads the first page of items
    loadFirstPage() {
        return this.setPagingParametersAndLoadFirstPage(this._firstPagePagingParameters);
    }
    
    _loadPage(pageNumber, id) {
        let cursorPager = this;

        if (!id) {
            id = ++cursorPager._initId;
        }

        return new Promise((originalResolve, originalReject) => {
            const reject = (e) => {
                if (cursorPager._initId === id) {
                    cursorPager._status = cursorPaginationConstants.status.idle;
                    originalReject(e);
                } else {
                    originalReject({
                        type: cursorPaginationConstants.errorType.pagingParametersChanged
                    });
                }
            };

            const resolve = (data) => {
                if (cursorPager._initId === id) {
                    cursorPager._status = cursorPaginationConstants.status.idle;
                    cursorPager._currentPageNumber = pageNumber;
                    originalResolve(data);
                } else {
                    originalReject({
                        type: cursorPaginationConstants.errorType.pagingParametersChanged
                    });
                }
            };

            if (pageNumber < 1) {
                reject({
                    type: cursorPaginationConstants.errorType.invalidPageNumber
                });
                return;
            }

            let cacheKey = cursorPager._getCacheKey();
            let items = cursorPager._cache.getPage(cacheKey, pageNumber);

            if (items.length === cursorPager._pageSize) {
                resolve(items);
                return;
            }

            if (typeof (cursorPager._pagingParameters.cursor) !== "string") {
                if (items.length <= 0 && pageNumber > 1) {
                    // There's no next page to load and no items in the cache for this page.
                    reject({
                        type: cursorPaginationConstants.errorType.invalidPageNumber
                    });
                    return;
                }

                resolve(items);
                return;
            }

            cursorPager._status = cursorPaginationConstants.status.loading;
            cursorPager._loadNextPageIntoCache(cacheKey, id).then(() => {
                // Call loadPage and we will read from the cache.
                // This will also invoke another call to load more items until either 
                // the cache has a sufficient number of items or we run out of next pages.
                cursorPager._loadPage(pageNumber, id).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    _getCacheKey() {
        return JSON.stringify(this._firstPagePagingParameters);
    }

    _setNextPageCursor(nextPageCursor) {
        this._pagingParameters = Object.assign({}, this._pagingParameters, { cursor: nextPageCursor });
    }

    _loadNextPageIntoCache(cacheKey, id) {
        let cursorPager = this;

        return new Promise((resolve, reject) => {
            cursorPager._indexCursors[cursorPager._cache.getLength(cacheKey)] = cursorPager._pagingParameters.cursor;

            // The page number according to getItems (based on loadPageSize, not pageSize)
            let loadPageNumber = Object.keys(cursorPager._indexCursors).length;

            cursorPager._getItems(Object.assign({}, cursorPager._pagingParameters, {
                count: cursorPager._loadPageSize,
                pageNumber: loadPageNumber
            })).then((result) => {
                if (id === cursorPager._initId) {
                    cursorPager._setNextPageCursor(result.nextPageCursor);
                    cursorPager._cache.append(cacheKey, result.items);
                    resolve();
                } else {
                    reject({
                        type: cursorPaginationConstants.errorType.pagingParametersChanged
                    });
                }
            }).catch((e) => {
                if (id === cursorPager._initId) {
                    reject({
                        type: cursorPaginationConstants.errorType.getItemsFailure,
                        data: e
                    });
                } else {
                    reject({
                        type: cursorPaginationConstants.errorType.pagingParametersChanged
                    });
                }
            });
        });
    }
}
