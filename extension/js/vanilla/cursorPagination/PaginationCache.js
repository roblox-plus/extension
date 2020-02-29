class PaginationCache {
    constructor(pageSize) {
        this.pageSize = pageSize;
        this.cache = {};
    }

    getPage(cacheKey, pageNumber) {
        let cacheList = this.cache[cacheKey];
        if (cacheList) {
            return cacheList.slice((pageNumber - 1) * this.pageSize, pageNumber * this.pageSize);;
        }

        return [];

    }

    getLength(cacheKey) {
        let cacheList = this.cache[cacheKey];
        if (cacheList) {
            return cacheList.length;
        }

        return 0;
    }

    append(cacheKey, values) {
        if (!this.cache[cacheKey]) {
            this.cache[cacheKey] = [];
        }

        this.cache[cacheKey] = this.cache[cacheKey].concat(values);
    }

    removeAfterIndex(cacheKey, index) {
        if (this.cache[cacheKey]) {
            this.cache[cacheKey] = this.cache[cacheKey].slice(0, index);
        }
    }

    clear(cacheKey) {
        delete this.cache[cacheKey];
    }
}
