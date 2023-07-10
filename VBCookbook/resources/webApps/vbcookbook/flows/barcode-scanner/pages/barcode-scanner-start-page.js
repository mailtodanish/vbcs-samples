/**
 * Copyright (c)2020, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
define([], function () {
  "use strict";

  class PageModule {
    constructor() {}

    /**
     *
     * @param {String} arg1
     * @return {String}
     */
    createImageBitmap(fileBlob) {
      return window.createImageBitmap(fileBlob);
    }
  }

  return PageModule;
});
