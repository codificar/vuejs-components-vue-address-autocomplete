'use strict';Object.defineProperty(exports,'__esModule',{value:true});var axios=require('axios');function _interopDefaultLegacy(e){return e&&typeof e==='object'&&'default'in e?e:{'default':e}}var axios__default=/*#__PURE__*/_interopDefaultLegacy(axios);function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}var script = {
  props: {
    AutocompleteParams: {
      type: Object,
      default: {
        filter: {
          id: null,
          token: null,
          latitude: null,
          longitude: null
        }
      }
    },
    AutocompleteUrl: {
      type: String,
      default: ""
    },
    GeocodeUrl: {
      type: String,
      default: ""
    },
    PlaceHolderText: {
      type: String,
      default: "Escreva o endereço"
    },
    NeedAddressNumberText: {
      type: String,
      default: "Você não informou o número do endereço, informando-o a busca fica mais precisa."
    },
    MinLength: {
      type: Number,
      default: 5
    },
    Delay: {
      type: Number,
      default: 1000
    }
  },
  data: function data() {
    return {
      search_string: "",
      places_result: [],
      api_params: {},
      autocomplete_url: "",
      geocode_url: "",
      blur: false,
      clicker: "primary"
    };
  },
  methods: {
    /**
     * Realiza chamada a api para sugestões de endereçõs
     */
    callAutocompleteApi: function callAutocompleteApi() {
      var _this = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _yield$axios$get, response;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.blur = false;
                _context.prev = 1;

                if (!(_this.search_string.length > _this.MinLength)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 5;
                return axios__default['default'].get(_this.autocomplete_url, {
                  params: _objectSpread2(_objectSpread2({}, _this.api_params), {}, {
                    place: _this.search_string
                  })
                });

              case 5:
                _yield$axios$get = _context.sent;
                response = _yield$axios$get.data;

                if (response.success) {
                  _this.places_result = response.data;
                  _this.clicker = response.clicker;
                } else console.log(response);

              case 8:
                _context.next = 13;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](1);
                console.log(_context.t0);

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 10]]);
      }))();
    },

    /**
     * Realiza chamada a api de geocode para recuperar a latitude
     * e logitude no caso de o provider ser google maps
     */
    callGeocodeApi: function callGeocodeApi(address) {
      var _this2 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _yield$axios$get2, response;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                console.log("callGeocodeApi ROUTE", _this2.geocode_url);
                console.log("callGeocodeApi PARAM", {
                  params: _objectSpread2(_objectSpread2({}, _this2.api_params), {}, {
                    address: address,
                    clicker: _this2.clicker
                  })
                });
                _context2.next = 5;
                return axios__default['default'].get(_this2.geocode_url, {
                  params: _objectSpread2(_objectSpread2({}, _this2.api_params), {}, {
                    address: address,
                    clicker: _this2.clicker
                  })
                });

              case 5:
                _yield$axios$get2 = _context2.sent;
                response = _yield$axios$get2.data;
                return _context2.abrupt("return", response);

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](0);
                console.log(_context2.t0);

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 10]]);
      }))();
    },

    /**
     * Seleciona uma sugestão de endereço
     */
    handleSelectAddress: function handleSelectAddress(data) {
      var _this3 = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var response;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _this3.search_string = data.address;
                _this3.places_result = [];
                !_this3.checkNumber(data.address) && _this3.$toasted.show(_this3.NeedAddressNumberText, {
                  theme: "bubble",
                  type: "info",
                  position: "bottom-center",
                  duration: 5000
                });

                if (!(data.place_id != null)) {
                  _context3.next = 9;
                  break;
                }

                _context3.next = 6;
                return _this3.callGeocodeApi(data.address);

              case 6:
                response = _context3.sent;

                if (response.success) {
                  data.latitude = response.data.latitude;
                  data.longitude = response.data.longitude;

                  _this3.$emit("addressSelected", data);
                } else _this3.$emit("addressSelected", data);

                return _context3.abrupt("return");

              case 9:
                _this3.$emit("addressSelected", data);

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },

    /**
     * Método usado para setar o array de parâmetros da api
     * no watcher
     */
    setApiParams: function setApiParams() {
      this.api_params = this.AutocompleteParams;
    },

    /**
     * Handle blur event
     */
    handleBlur: function handleBlur() {
      var _this4 = this;

      setTimeout(function () {
        return _this4.blur = true;
      }, 250);
    },

    /**
     * Delay para auxiliar na economia de requisições
     */
    debounceSearch: function debounceSearch(event) {
      var _this5 = this;

      clearTimeout(this.debounce);
      this.debounce = setTimeout(function () {
        _this5.callAutocompleteApi();
      }, this.Delay);
    },

    /**
     * Checa se o endereço escolhido possui número
     */
    checkNumber: function checkNumber(address) {
      var check = false;
      var components = address.split(" ");
      return check = components.some(function (component, index) {
        var teste = parseInt(component.replace(",", "").replace("-", ""));
        return typeof teste === "number" && !isNaN(teste) && index > 0;
      });
    }
  },
  watch: {
    AutocompleteParams: {
      handler: function handler() {
        this.setApiParams();
      },
      immediate: true
    }
  },
  computed: {
    show: function show() {
      if (this.search_string.length > this.MinLength) return true;
      return false;
    },
    showBlur: function showBlur() {
      return this.blur;
    }
  },
  mounted: function mounted() {
    this.autocomplete_url = this.AutocompleteUrl;
    this.geocode_url = this.GeocodeUrl;
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}function createInjectorSSR(context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
    }
    if (!context)
        return () => { };
    if (!('styles' in context)) {
        context._styles = context._styles || {};
        Object.defineProperty(context, 'styles', {
            enumerable: true,
            get: () => context._renderStyles(context._styles)
        });
        context._renderStyles = context._renderStyles || renderStyles;
    }
    return (id, style) => addStyle(id, style, context);
}
function addStyle(id, css, context) {
    const group =  css.media || 'default' ;
    const style = context._styles[group] || (context._styles[group] = { ids: [], css: '' });
    if (!style.ids.includes(id)) {
        style.media = css.media;
        style.ids.push(id);
        let code = css.source;
        style.css += code + '\n';
    }
}
function renderStyles(styles) {
    let css = '';
    for (const key in styles) {
        const style = styles[key];
        css +=
            '<style data-vue-ssr-id="' +
                Array.from(style.ids).join(' ') +
                '"' +
                (style.media ? ' media="' + style.media + '"' : '') +
                '>' +
                style.css +
                '</style>';
    }
    return css;
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticStyle: {
      "position": "relative"
    }
  }, [_vm._ssrNode("<input type=\"text\"" + _vm._ssrAttr("placeholder", _vm.PlaceHolderText) + _vm._ssrAttr("value", _vm.search_string) + " class=\"form-control\"> " + (_vm.show && !_vm.blur ? "<div class=\"container_results\">" + _vm._ssrList(_vm.places_result, function (item, index) {
    return "<div><div class=\"row_result\"><p style=\"margin-bottom: 0\">" + _vm._ssrEscape(_vm._s(item.main_text)) + "</p> <p style=\"margin-bottom: 0\">" + _vm._ssrEscape(_vm._s(item.secondary_text)) + "</p></div></div>";
  }) + " <hr></div>" : "<!---->"))]);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
  if (!inject) return;
  inject("data-v-7c24c7f9_0", {
    source: ".container_results{position:absolute;z-index:10;background-color:#fff;width:100%}.row_result{cursor:pointer;padding:6px 15px}.row_result:hover{background:#eee}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = "data-v-7c24c7f9";
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, createInjectorSSR, undefined);// Import vue component

var install = function installVueAddressAutocomplete(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('VueAddressAutocomplete', __vue_component__);
}; // Create module definition for Vue.use()


var plugin = {
  install: install
}; // To auto-install on non-es builds, when vue is found
// eslint-disable-next-line no-redeclare

/* global window, global */

{
  var GlobalVue = null;

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(plugin);
  }
} // Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()


__vue_component__.install = install; // Export component by default
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
exports.default=__vue_component__;