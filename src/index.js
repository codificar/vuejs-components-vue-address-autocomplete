import AddressAutocomplete from "./components/AddressAutocomplete.vue";

function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component("vue-address-autocomplete", AddressAutocomplete);
}

const plugin = {
  install
};

let GlobalVue = null;
if (typeof window !== "undefined") {
  GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
  GlobalVue = global.vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

AddressAutocomplete.install = install;

export default AddressAutocomplete;