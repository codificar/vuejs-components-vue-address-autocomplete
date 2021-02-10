<template>
  <div style="position: relative">
    <input
      type="text"
      class="form-control"
      :placeholder="PlaceHolderText"
      v-model="search_string"
      @input="debounceSearch"
      @blur="handleBlur"
    />

    <div v-if="show && !blur" class="container_results">
      <div v-for="(item, index) in places_result" :key="index">
        <div class="row_result" @click="handleSelectAddress(item)">
          <p style="margin-bottom: 0">{{ item.main_text }}</p>
          <p style="margin-bottom: 0">{{ item.secondary_text }}</p>
        </div>
      </div>
      <hr />
    </div>

    <div v-if="!hasNumber">
      <label> {{ NumberLabel }} :</label>
      <input
        v-model="address_number"
        @blur="setNumber"
        
        type="number"
        class="form-control"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "VueAddressAutocomplete", // vue component name
  props: {
    AutocompleteParams: {
      type: Object,
      default: {
        filter: {
          id: null,
          token: null,
          latitude: null,
          longitude: null,
        },
      },
    },
    AutocompleteUrl: {
      type: String,
      default: "",
    },
    GeocodeUrl: {
      type: String,
      default: "",
    },
    PlaceHolderText: {
      type: String,
      default: "Escreva o endereço",
    },
    NeedAddressNumberText: {
      type: String,
      default:
        "Você não informou o número do endereço, informando-o a busca fica mais precisa.",
    },
    NumberLabel: {
      type: String,
      default: "Numero",
    },
    MinLength: {
      type: Number,
      default: 5,
    },
    Delay: {
      type: Number,
      default: 1000,
    },
    Address: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      search_string: this.Address != null ? this.Address : "",
      places_result: [],
      api_params: {},
      autocomplete_url: "",
      geocode_url: "",
      blur: false,
      clicker: "primary",

      selectedAddress: null,
      address_number: null,
      hasNumber: true,
    };
  },

  methods: {
    setNumber() {
      let newAddressWithNumber = {...this.selectedAddress};

      newAddressWithNumber.address = `${newAddressWithNumber.address} ${this.address_number}`;
      newAddressWithNumber.main_text = `${newAddressWithNumber.main_text} ${this.address_number}`;
      newAddressWithNumber.secondary_text = `${newAddressWithNumber.secondary_text} ${this.address_number}`;

      this.$emit("addressSelected", newAddressWithNumber);      
    },

    removeInputNumber() {
      this.selectedAddress = null
      this.address_number = null
      this.hasNumber = true
    },
    
    setPropsAdress(address) {
      this.search_string = address;
      this.blur = true;
    },
    async setAdressAndSelectFirst(address) {
      this.setPropsAdress(address);

      const placesResponse = await axios.get(this.autocomplete_url, {
        params: { ...this.api_params, place: this.search_string },
      });

      const geocodeResponse = await this.callGeocodeApi(
        placesResponse.data.data[0].address
      );
      if (geocodeResponse.success) {
        geocodeResponse.data.latitude = geocodeResponse.data.latitude;
        geocodeResponse.data.longitude = geocodeResponse.data.longitude;
        this.$emit("addressSelected", geocodeResponse.data);
      } else this.$emit("addressSelected", geocodeResponse.data);
    },

    /**
     * Realiza chamada a api para sugestões de endereçõs
     */
    async callAutocompleteApi() {
      this.blur = false;
      try {
        if (this.search_string.length > this.MinLength) {
          const { data: response } = await axios.get(this.autocomplete_url, {
            params: { ...this.api_params, place: this.search_string },
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
        const { data: response } = await axios.get(this.geocode_url, {
          params: { ...this.api_params, address, clicker: this.clicker },
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
     
      this.hasNumber = true;
      if (!this.checkNumber(data.address)) {
        this.$toasted.show(this.NeedAddressNumberText, {
          theme: "bubble",
          type: "info",
          position: "bottom-center",
          duration: 5000,
        });
        this.hasNumber = false;
      }

      this.selectedAddress = data;
      if (data.place_id != null) {
        const response = await this.callGeocodeApi(data.address);

        if (response.success) {
          data.latitude = response.data.latitude;
          data.longitude = response.data.longitude;
          this.selectedAddress = data;
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
      setTimeout(() => (this.blur = true), 250);
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

      return (check = components.some(function(component, index) {
        let teste = parseInt(component.replace(",", "").replace("-", ""));
        if(typeof teste === "number" && !isNaN(teste) && index > 0){
          if(teste.toString().length > 4){
            return false;
          }else{
            return true
          }          
        };
        // return typeof teste === "number" && !isNaN(teste) && index > 0;
      }));
    },
  },

  watch: {
    AutocompleteParams: {
      handler: function() {
        this.setApiParams();
      },
      immediate: true,
    },
  },

  computed: {
    show() {
      if (this.search_string.length > this.MinLength) return true;

      return false;
    },
    showBlur() {
      return this.blur;
    },
  },

  mounted() {
    var vm = this;
    this.autocomplete_url = this.AutocompleteUrl;
    this.geocode_url = this.GeocodeUrl;

    this.$root.$on("seach_edit", function(address) {
      vm.search_string = address;
      vm.blur = true;
    });
  },
};
</script>

<style>
.container_results {
  position: absolute;
  z-index: 10;
  background-color: #fff;
  width: 100%;
}

.row_result {
  cursor: pointer;
  padding: 6px 15px;
}

.row_result:hover {
  background: #eee;
}
</style>
