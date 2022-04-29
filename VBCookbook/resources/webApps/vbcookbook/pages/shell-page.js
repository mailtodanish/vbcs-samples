/**
 * Copyright (c)2020, 2022, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
define(['knockout',
  'ojs/ojknockout-keyset',
  'ojs/ojarraytreedataprovider',
  'ojs/ojoffcanvas'
], function (ko, keySet, ArrayTreeDataProvider) {
  'use strict';

  var PageModule = function PageModule() {
    this.navlistExpanded = new keySet.ObservableKeySet();
  };

  /**
   * Return JET variable not nativelty supported by VB
   */
  PageModule.prototype.getNavigationListKeySet = function () {
    return this.navlistExpanded;
  };

  /**
   * Create ArrayTree data provider for left navigation menu
   */
  PageModule.prototype.getNavigationContent = function (metadata) {
    if (this.navigationContent === undefined) {
      this.navigationContent = ko.observable(new ArrayTreeDataProvider(
        this._getNavigationData(
          metadata.navigationMenu, metadata.demos), {
        keyAttributes: 'attr.id'
      }));
    }
    return this.navigationContent;
  };

  /**
   * Select current recipe in left navigation list and collapse all other nodes.
   */
  PageModule.prototype.collapseAllButSelection = function (sel) {
    this.navlistExpanded.clear();
    this.navlistExpanded.add(sel);
  };

  /**
   * Is tree node item selectable?
   */
  PageModule.prototype.itemSelectable = function (context) {
    return context['leaf'];
  };

  /**
   * Create data for left navigation menu from given metadata
   */
  PageModule.prototype._getNavigationData = function (menu, demos) {
    var navData = [],
      self = this;

    for (var i = 0; i < menu.length; i++) {
      var menuItem = {};
      var origMenuItem = menu[i];
      if (typeof origMenuItem === "object") {
        menuItem["attr"] = {
          "id": origMenuItem.id,
          "name": origMenuItem.label
        };
      } else if (typeof origMenuItem === "string") {
        menuItem["attr"] = {
          "id": origMenuItem,
          "name": self._getDemoOption(demos, origMenuItem, "label", "")
        };
      }

      if (origMenuItem.items && origMenuItem.items.length > 0)
        menuItem["children"] = this._getNavigationData(origMenuItem.items,
          demos);
      navData.push(menuItem);
    }
    return navData;
  };

  PageModule.prototype._getDemoOption = function (demoConfig, demoId,
    optionName, optionDefault) {
    var optionData = optionDefault;
    var demoObject = demoConfig[demoId];
    if (demoObject && demoObject.hasOwnProperty(optionName)) {
      optionData = demoObject[optionName];
    }
    return optionData;
  };

  /**
   * Go to vb cookbook of specified version
   * @param {String} newVersion new vb version to be used
   * @param {Array} vbVersions Array of VB version object
   * @return {String} URL of vbcookbook for a given version
   */
  PageModule.prototype.goToVBCookbook = function (newVersion, vbVersions) {
    for (var i = 0; i < vbVersions.length; i++) {
      if (vbVersions[i].label === newVersion) {
        return vbVersions[i];
      }
    }
  };

  /**
   * For given search term iterate over all recipes described by metadata
   * and match recipe name or recipe category name. Return structure to render
   * in combobox popup, eg.:
   * [{groupName: Table, items: [{recipeName : Foo, recipeId: bar}]}]
   */
  PageModule.prototype.findMatchingRecipes = function (metadata, term) {
    var results = [];
    term = term.toLowerCase();
    var recipeResults = [];

    var _addMatchingRecipe = function (_groupName, _categoryName, _recipeItem) {
      var groupNameMatch = _groupName.toLowerCase().indexOf(term) >= 0;
      var categoryNameMatch = _categoryName.toLowerCase().indexOf(term) >= 0;
      var recipe = metadata.demos[_recipeItem].label;
      var recipeNameMatch = recipe.toLowerCase().indexOf(term) >= 0;
      if (groupNameMatch || recipeNameMatch || categoryNameMatch) {
        recipeResults.push({
          recipeName: (_categoryName === "" ? recipe : _categoryName + ' / ' + recipe),
          recipeId: _recipeItem
        });
      }
    }

    metadata.navigationMenu.forEach(item => {
      recipeResults = [];
      if (item.items === undefined) {
        return;
      }
      var groupName = item.label;
      item.items.forEach(item2 => {
        if (item2.items === undefined) { // two level navigation items only
          _addMatchingRecipe(groupName, "", item2); // category name is not required for two level
        } else {  // three level navigation items
          var category = item2.label;
          item2.items.forEach(item3 => {
            _addMatchingRecipe(groupName, category, item3);
          });
        }
      });
      if (recipeResults.length > 0) {
        results.push({
          groupName: groupName,
          items: recipeResults
        });
      }
    });
    return results;
  };

  /**
   * Options provider which return empty array for no search term
   * or matched recipe/category names.
   */
  PageModule.prototype.createOptionsProvider = function (metadata) {
    var self = this;
    return function (context) {
      return new Promise(function (fulfill, reject) {
        var term = context.term;
        if (term) {
          fulfill(self.findMatchingRecipes(metadata, term));
        } else {
          fulfill([]);
        }
      });
    };
  };

  /**
   * Renderer which understands structure returned by findMatchingRecipes.
   */
  PageModule.prototype.createSearchResultsRenderer = function () {
    return function (context) {
      var elem, span;
      if (!context.leaf) {
        elem = document.createElement("oj-optgroup");
        elem.setAttribute("label", context.data.groupName);
      } else {
        elem = document.createElement("oj-option");
        span = document.createElement("span");
        span.className = "oj-listbox-highlighter-section";
        span.textContent = context.data.recipeName;
        elem.appendChild(span);
      }
      return elem;
    };
  };

  /**
   * Pause execution for given time in milliseconds.
   */
  PageModule.prototype.wait = function (ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  };

  return PageModule;
});
