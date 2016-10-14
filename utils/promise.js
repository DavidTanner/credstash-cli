'use strict';

module.exports = {

  mapPromise(array, fn) {
    let idx = 0;
    const results = [];

    function doNext() {
      if (idx >= array.length) {
        return results;
      }

      return fn(array[idx])
        .then((res) => {
          idx += 1;
          results.push(res);
        })
        .then(() => doNext());
    }

    return doNext();
  },
};
