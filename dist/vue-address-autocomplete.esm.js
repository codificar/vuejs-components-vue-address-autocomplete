import axios from 'axios';

//
var script = {
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

  data() {
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
    async callAutocompleteApi() {
      this.blur = false;

      try {
        if (this.search_string.length > this.MinLength) {
          const {
            data: response
          } = await axios.get(this.autocomplete_url, {
            params: { ...this.api_params,
              place: this.search_string
            }
          });

          if (response.success) {
            this.places_result = response.data;
            this.clicker = response.clicker;
          } else console.log(response);
        }
      } catch (error) {
        console.log(error);
      }
    },

    /**
     * Realiza chamada a api de geocode para recuperar a latitude
     * e logitude no caso de o provider ser google maps
     */
    async callGeocodeApi(address) {
      try {
        console.log("callGeocodeApi ROUTE", this.geocode_url);
        console.log("callGeocodeApi PARAM", {
          params: { ...this.api_params,
            address,
            clicker: this.clicker
          }
        });
        const {
          data: response
        } = await axios.get(this.geocode_url, {
          params: { ...this.api_params,
            address,
            clicker: this.clicker
          }
        });
        return response;
      } catch (error) {
        console.log(error);
      }
    },

    /**
     * Seleciona uma sugestão de endereço
     */
    async handleSelectAddress(data) {
      this.search_string = data.address;
      this.places_result = [];
      !this.checkNumber(data.address) && this.$toasted.show(this.NeedAddressNumberText, {
        theme: "bubble",
        type: "info",
        position: "bottom-center",
        duration: 5000
      });

      if (data.place_id != null) {
        const response = await this.callGeocodeApi(data.address);

        if (response.success) {
          data.latitude = response.data.latitude;
          data.longitude = response.data.longitude;
          this.$emit("addressSelected", data);
        } else this.$emit("addressSelected", data);

        return;
      }

      this.$emit("addressSelected", data);
    },

    /**
     * Método usado para setar o array de parâmetros da api
     * no watcher
     */
    setApiParams() {
      this.api_params = this.AutocompleteParams;
    },

    /**
     * Handle blur event
     */
    handleBlur() {
      setTimeout(() => this.blur = true, 250);
    },

    /**
     * Delay para auxiliar na economia de requisições
     */
    debounceSearch(event) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.callAutocompleteApi();
      }, this.Delay);
    },

    /**
     * Checa se o endereço escolhido possui número
     */
    checkNumber(address) {
      let check = false;
      let components = address.split(" ");
      return check = components.some(function (component, index) {
        let teste = parseInt(component.replace(",", "").replace("-", ""));
        return typeof teste === "number" && !isNaN(teste) && index > 0;
      });
    }

  },
  watch: {
    AutocompleteParams: {
      handler: function () {
        this.setApiParams();
      },
      immediate: true
    }
  },
  computed: {
    show() {
      if (this.search_string.length > this.MinLength) return true;
      return false;
    },

    showBlur() {
      return this.blur;
    }

  },

  mounted() {
    this.autocomplete_url = this.AutocompleteUrl;
    this.geocode_url = this.GeocodeUrl;
  }

};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticStyle: {
      "position": "relative"
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.search_string,
      expression: "search_string"
    }],
    staticClass: "form-control",
    attrs: {
      "type": "text",
      "placeholder": _vm.PlaceHolderText
    },
    domProps: {
      "value": _vm.search_string
    },
    on: {
      "input": [function ($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.search_string = $event.target.value;
      }, _vm.debounceSearch],
      "blur": _vm.handleBlur
    }
  }), _vm._v(" "), _vm.show && !_vm.blur ? _c('div', {
    staticClass: "container_results"
  }, [_vm._l(_vm.places_result, function (item, index) {
    return _c('div', {
      key: index
    }, [_c('div', {
      staticClass: "row_result",
      on: {
        "click": function ($event) {
          return _vm.handleSelectAddress(item);
        }
      }
    }, [_c('p', {
      staticStyle: {
        "margin-bottom": "0"
      }
    }, [_vm._v(_vm._s(item.main_text))]), _vm._v(" "), _c('p', {
      staticStyle: {
        "margin-bottom": "0"
      }
    }, [_vm._v(_vm._s(item.secondary_text))])])]);
  }), _vm._v(" "), _c('hr')], 2) : _vm._e()]);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = function (inject) {
  if (!inject) return;
  inject("data-v-7c24c7f9_0", {
    source: ".container_results{position:absolute;z-index:10;background-color:#fff;width:100%}.row_result{cursor:pointer;padding:6px 15px}.row_result:hover{background:#eee}",
    map: undefined,
    media: undefined
  });
};
/* scoped */


const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, createInjector, undefined, undefined);

// Import vue component

const install = function installVueAddressAutocomplete(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('VueAddressAutocomplete', __vue_component__);
}; // Create module definition for Vue.use()
// to be registered via Vue.use() as well as Vue.component()


__vue_component__.install = install; // Export component by default
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;

export default __vue_component__;
