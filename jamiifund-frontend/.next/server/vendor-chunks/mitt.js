"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/mitt";
exports.ids = ["vendor-chunks/mitt"];
exports.modules = {

/***/ "(ssr)/./node_modules/mitt/dist/mitt.mjs":
/*!*****************************************!*\
  !*** ./node_modules/mitt/dist/mitt.mjs ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(n) {\n    return {\n        all: n = n || new Map,\n        on: function(t, e) {\n            var i = n.get(t);\n            i ? i.push(e) : n.set(t, [\n                e\n            ]);\n        },\n        off: function(t, e) {\n            var i = n.get(t);\n            i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t, []));\n        },\n        emit: function(t, e) {\n            var i = n.get(t);\n            i && i.slice().map(function(n) {\n                n(e);\n            }), (i = n.get(\"*\")) && i.slice().map(function(n) {\n                n(t, e);\n            });\n        }\n    };\n} //# sourceMappingURL=mitt.mjs.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWl0dC9kaXN0L21pdHQubWpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQSw2QkFBZSxvQ0FBU0EsQ0FBQztJQUFFLE9BQU07UUFBQ0MsS0FBSUQsSUFBRUEsS0FBRyxJQUFJRTtRQUFJQyxJQUFHLFNBQVNDLENBQUMsRUFBQ0MsQ0FBQztZQUFFLElBQUlDLElBQUVOLEVBQUVPLEdBQUcsQ0FBQ0g7WUFBR0UsSUFBRUEsRUFBRUUsSUFBSSxDQUFDSCxLQUFHTCxFQUFFUyxHQUFHLENBQUNMLEdBQUU7Z0JBQUNDO2FBQUU7UUFBQztRQUFFSyxLQUFJLFNBQVNOLENBQUMsRUFBQ0MsQ0FBQztZQUFFLElBQUlDLElBQUVOLEVBQUVPLEdBQUcsQ0FBQ0g7WUFBR0UsS0FBSUQsQ0FBQUEsSUFBRUMsRUFBRUssTUFBTSxDQUFDTCxFQUFFTSxPQUFPLENBQUNQLE9BQUssR0FBRSxLQUFHTCxFQUFFUyxHQUFHLENBQUNMLEdBQUUsRUFBRTtRQUFFO1FBQUVTLE1BQUssU0FBU1QsQ0FBQyxFQUFDQyxDQUFDO1lBQUUsSUFBSUMsSUFBRU4sRUFBRU8sR0FBRyxDQUFDSDtZQUFHRSxLQUFHQSxFQUFFUSxLQUFLLEdBQUdDLEdBQUcsQ0FBQyxTQUFTZixDQUFDO2dCQUFFQSxFQUFFSztZQUFFLElBQUcsQ0FBQ0MsSUFBRU4sRUFBRU8sR0FBRyxDQUFDLElBQUcsS0FBSUQsRUFBRVEsS0FBSyxHQUFHQyxHQUFHLENBQUMsU0FBU2YsQ0FBQztnQkFBRUEsRUFBRUksR0FBRUM7WUFBRTtRQUFFO0lBQUM7QUFBQyxFQUN6VCxpQ0FBaUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9qYW1paWZ1bmQtZnJvbnRlbmQvLi9ub2RlX21vZHVsZXMvbWl0dC9kaXN0L21pdHQubWpzPzAwNTEiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obil7cmV0dXJue2FsbDpuPW58fG5ldyBNYXAsb246ZnVuY3Rpb24odCxlKXt2YXIgaT1uLmdldCh0KTtpP2kucHVzaChlKTpuLnNldCh0LFtlXSl9LG9mZjpmdW5jdGlvbih0LGUpe3ZhciBpPW4uZ2V0KHQpO2kmJihlP2kuc3BsaWNlKGkuaW5kZXhPZihlKT4+PjAsMSk6bi5zZXQodCxbXSkpfSxlbWl0OmZ1bmN0aW9uKHQsZSl7dmFyIGk9bi5nZXQodCk7aSYmaS5zbGljZSgpLm1hcChmdW5jdGlvbihuKXtuKGUpfSksKGk9bi5nZXQoXCIqXCIpKSYmaS5zbGljZSgpLm1hcChmdW5jdGlvbihuKXtuKHQsZSl9KX19fVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWl0dC5tanMubWFwXG4iXSwibmFtZXMiOlsibiIsImFsbCIsIk1hcCIsIm9uIiwidCIsImUiLCJpIiwiZ2V0IiwicHVzaCIsInNldCIsIm9mZiIsInNwbGljZSIsImluZGV4T2YiLCJlbWl0Iiwic2xpY2UiLCJtYXAiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mitt/dist/mitt.mjs\n");

/***/ })

};
;