"use strict";
(self["webpackChunkreprolab"] = self["webpackChunkreprolab"] || []).push([["style_index_js"],{

/***/ "./node_modules/css-loader/dist/cjs.js!./style/base.css":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./style/base.css ***!
  \**************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/*
    See the JupyterLab Developer Guide for useful CSS Patterns:

    https://jupyterlab.readthedocs.io/en/stable/developer/css.html
*/

.reprolab-widget {
  padding: 10px;
  width: 40%;
  min-width: 400px;
  max-width: 600px;
  height: 100%;
  overflow-y: auto;
  background: var(--jp-layout-color1);
  color: var(--jp-ui-font-color1);
}

.reprolab-widget h2 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--jp-border-color2);
}

.reprolab-sidebar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  min-width: 440px;
  max-width: 700px;
  background: var(--jp-layout-color1);
  color: var(--jp-ui-font-color1);
  padding: 0;
  box-sizing: border-box;
  overflow-y: auto;
}

.reprolab-sidebar > div {
  margin: 0;
  padding: 24px 18px 18px 18px;
  width: 100%;
  box-sizing: border-box;
}

.reprolab-header {
  text-align: left;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.reprolab-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  text-align: left;
}

.reprolab-header h3 {
  margin: 10px 0 0;
  font-size: 16px;
  color: #666;
  text-align: left;
}

.reprolab-help h2 {
  margin-top: 0;
  font-size: 1.2em;
  border-bottom: 1px solid var(--jp-border-color2);
  padding-bottom: 6px;
}

.reprolab-help ol {
  margin: 0 0 10px 18px;
  padding: 0;
}

.reprolab-help p {
  margin: 0;
  color: var(--jp-ui-font-color2);
}

.reprolab-launcher {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: var(--jp-layout-color1);
  border: 1px solid var(--jp-border-color2);
}

.reprolab-launcher:hover {
  background-color: var(--jp-layout-color2);
}

.reprolab-launcher-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reprolab-launcher-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reprolab-launcher-icon svg {
  width: 20px;
  height: 20px;
}

.reprolab-launcher-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--jp-ui-font-color1);
}

/* Section styles */
.reprolab-section {
  background-color: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.reprolab-section > * {
  width: 100%;
  max-width: 500px;
  text-align: left;
}

.reprolab-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  text-align: left;
}

.reprolab-section p {
  margin: 10px 0;
  color: #666;
  text-align: left;
}

/* Button styles */
.reprolab-button {
  padding: 8px 16px;
  font-size: 1em;
  cursor: pointer;
  background: var(--jp-brand-color1);
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.2s;
  margin: 10px auto;
  display: block;
}

.reprolab-button:hover {
  background: var(--jp-brand-color2);
}

/* Input styles */
.reprolab-input {
  padding: 8px 12px;
  font-size: 1em;
  width: 100%;
  margin: 8px 0;
  border: 1px solid var(--jp-border-color2);
  border-radius: 4px;
  box-sizing: border-box;
}

/* Modal styles */
.reprolab-modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: none;
  justify-content: center;
  align-items: center;
}

.reprolab-modal-content {
  background-color: var(--jp-layout-color1);
  margin: 15% auto;
  padding: 20px;
  border: 1px solid var(--jp-border-color2);
  width: 80%;
  max-width: 500px;
  border-radius: 5px;
  position: relative;
}

.reprolab-modal-close {
  color: var(--jp-ui-font-color2);
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.reprolab-modal-close:hover {
  color: var(--jp-ui-font-color1);
}

/* Checklist styles */
.reprolab-checklist ul {
  list-style: none;
  padding: 0;
  text-align: left;
  max-width: 90%;
  margin: 0 auto;
}

.reprolab-checklist li {
  margin: 12px 0;
  display: flex;
  align-items: center;
}

.reprolab-checklist label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

/* Archive section styles */
.reprolab-archive-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
  width: 100%;
  align-items: center;
}

/* Demo section styles */
.reprolab-demo {
  margin: 20px 0;
}

.reprolab-demo p {
  margin: 10px 0;
}

/* Experiment section styles */
.reprolab-experiment-input {
  margin: 15px 0;
  width: 100%;
  text-align: center;
}

.reprolab-experiment-label {
  display: block;
  margin-bottom: 8px;
  text-align: center;
}

/* Experiment options styles */
.reprolab-experiment-options {
  margin: 15px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reprolab-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--jp-ui-font-color1);
}

.reprolab-checkbox-label input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}
`, "",{"version":3,"sources":["webpack://./style/base.css"],"names":[],"mappings":"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","sourcesContent":["/*\n    See the JupyterLab Developer Guide for useful CSS Patterns:\n\n    https://jupyterlab.readthedocs.io/en/stable/developer/css.html\n*/\n\n.reprolab-widget {\n  padding: 10px;\n  width: 40%;\n  min-width: 400px;\n  max-width: 600px;\n  height: 100%;\n  overflow-y: auto;\n  background: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color1);\n}\n\n.reprolab-widget h2 {\n  margin-top: 0;\n  padding-bottom: 10px;\n  border-bottom: 1px solid var(--jp-border-color2);\n}\n\n.reprolab-sidebar {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  justify-content: flex-start;\n  width: 100%;\n  height: 100%;\n  min-width: 440px;\n  max-width: 700px;\n  background: var(--jp-layout-color1);\n  color: var(--jp-ui-font-color1);\n  padding: 0;\n  box-sizing: border-box;\n  overflow-y: auto;\n}\n\n.reprolab-sidebar > div {\n  margin: 0;\n  padding: 24px 18px 18px 18px;\n  width: 100%;\n  box-sizing: border-box;\n}\n\n.reprolab-header {\n  text-align: left;\n  padding: 20px;\n  background-color: #f8f9fa;\n  border-bottom: 1px solid #e9ecef;\n}\n\n.reprolab-header h1 {\n  margin: 0;\n  font-size: 24px;\n  color: #333;\n  text-align: left;\n}\n\n.reprolab-header h3 {\n  margin: 10px 0 0;\n  font-size: 16px;\n  color: #666;\n  text-align: left;\n}\n\n.reprolab-help h2 {\n  margin-top: 0;\n  font-size: 1.2em;\n  border-bottom: 1px solid var(--jp-border-color2);\n  padding-bottom: 6px;\n}\n\n.reprolab-help ol {\n  margin: 0 0 10px 18px;\n  padding: 0;\n}\n\n.reprolab-help p {\n  margin: 0;\n  color: var(--jp-ui-font-color2);\n}\n\n.reprolab-launcher {\n  display: flex;\n  align-items: center;\n  padding: 8px;\n  margin: 4px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background-color 0.2s;\n  background-color: var(--jp-layout-color1);\n  border: 1px solid var(--jp-border-color2);\n}\n\n.reprolab-launcher:hover {\n  background-color: var(--jp-layout-color2);\n}\n\n.reprolab-launcher-content {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.reprolab-launcher-icon {\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.reprolab-launcher-icon svg {\n  width: 20px;\n  height: 20px;\n}\n\n.reprolab-launcher-label {\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--jp-ui-font-color1);\n}\n\n/* Section styles */\n.reprolab-section {\n  background-color: #f5f5f5;\n  padding: 20px;\n  margin-bottom: 20px;\n  border-radius: 4px;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n}\n\n.reprolab-section > * {\n  width: 100%;\n  max-width: 500px;\n  text-align: left;\n}\n\n.reprolab-section h3 {\n  margin-top: 0;\n  margin-bottom: 15px;\n  color: #333;\n  text-align: left;\n}\n\n.reprolab-section p {\n  margin: 10px 0;\n  color: #666;\n  text-align: left;\n}\n\n/* Button styles */\n.reprolab-button {\n  padding: 8px 16px;\n  font-size: 1em;\n  cursor: pointer;\n  background: var(--jp-brand-color1);\n  color: white;\n  border: none;\n  border-radius: 4px;\n  transition: background-color 0.2s;\n  margin: 10px auto;\n  display: block;\n}\n\n.reprolab-button:hover {\n  background: var(--jp-brand-color2);\n}\n\n/* Input styles */\n.reprolab-input {\n  padding: 8px 12px;\n  font-size: 1em;\n  width: 100%;\n  margin: 8px 0;\n  border: 1px solid var(--jp-border-color2);\n  border-radius: 4px;\n  box-sizing: border-box;\n}\n\n/* Modal styles */\n.reprolab-modal {\n  position: fixed;\n  z-index: 1000;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(0,0,0,0.4);\n  display: none;\n  justify-content: center;\n  align-items: center;\n}\n\n.reprolab-modal-content {\n  background-color: var(--jp-layout-color1);\n  margin: 15% auto;\n  padding: 20px;\n  border: 1px solid var(--jp-border-color2);\n  width: 80%;\n  max-width: 500px;\n  border-radius: 5px;\n  position: relative;\n}\n\n.reprolab-modal-close {\n  color: var(--jp-ui-font-color2);\n  float: right;\n  font-size: 28px;\n  font-weight: bold;\n  cursor: pointer;\n}\n\n.reprolab-modal-close:hover {\n  color: var(--jp-ui-font-color1);\n}\n\n/* Checklist styles */\n.reprolab-checklist ul {\n  list-style: none;\n  padding: 0;\n  text-align: left;\n  max-width: 90%;\n  margin: 0 auto;\n}\n\n.reprolab-checklist li {\n  margin: 12px 0;\n  display: flex;\n  align-items: center;\n}\n\n.reprolab-checklist label {\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n/* Archive section styles */\n.reprolab-archive-inputs {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  margin: 15px 0;\n  width: 100%;\n  align-items: center;\n}\n\n/* Demo section styles */\n.reprolab-demo {\n  margin: 20px 0;\n}\n\n.reprolab-demo p {\n  margin: 10px 0;\n}\n\n/* Experiment section styles */\n.reprolab-experiment-input {\n  margin: 15px 0;\n  width: 100%;\n  text-align: center;\n}\n\n.reprolab-experiment-label {\n  display: block;\n  margin-bottom: 8px;\n  text-align: center;\n}\n\n/* Experiment options styles */\n.reprolab-experiment-options {\n  margin: 15px 0;\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.reprolab-checkbox-label {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  font-size: 14px;\n  color: var(--jp-ui-font-color1);\n}\n\n.reprolab-checkbox-label input[type=\"checkbox\"] {\n  margin: 0;\n  cursor: pointer;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./style/base.css":
/*!************************!*\
  !*** ./style/base.css ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./base.css */ "./node_modules/css-loader/dist/cjs.js!./style/base.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./style/index.js":
/*!************************!*\
  !*** ./style/index.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _base_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.css */ "./style/base.css");



/***/ })

}]);
//# sourceMappingURL=style_index_js.7c999a9bfe93683ce9a3.js.map