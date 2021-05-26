<template>
  <div style="position: relative">
    <div
      style="
      display: flex;
      align-items: center;
      justify-content: center;"
    >
      <input
        type="text"
        class="form-control"
        :placeholder="PlaceHolderText"
        v-model="search_string"
        @input="debounceSearch"
        @blur="handleBlur"
      />

      <VueElementLoading
        :active="isLoading"
        spinner="spinner"
        color="#6666FF"
      />
    </div>

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
import VueElementLoading from "vue-element-loading";

export default {
  components: {
    VueElementLoading,
  },
  name: "VueAddressAutocomplete", // vue component name
  props: {
    AutocompleteParams: {
      type: Object,
      default: {
        id: null,
        token: null,
        latitude: -25,
        longitude: -45,
      },
    },
    AutocompleteUrl: {
      type: String,
      default: "",
    },
    GetPlaceDetailsRoute: {
      type: String,
      default: "/api/v1/libs/geolocation/admin/get_place_details",
    },
    GeocodeUrl: {
      type: String,
      default: "",
    },
    PlaceHolderText: {
      type: String,
      default: "Escreva o endereço",
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
    RequiredNumber: {
      type: Boolean,
      default: true,
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
  },
  data() {
    return {
      isLoading: false,
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
      hasZipCode: false,
    };
  },

  methods: {
    setNumber() {
      if(this.address_number <= 0){
        if (this.$toasted)
        this.$toasted.show(this.NeedAddressNumberText, {
          theme: "bubble",
          type: "info",
          position: "bottom-center",
          duration: 5000,
        });
        return
      }
      if (this.hasZipCode) {
        const fullAddress = `${this.address_number} ${this.selectedAddress.address}`;
        this.setAdressAndSelectFirst(fullAddress);
        return;
      } else {
        let newAddressWithNumber = { ...this.selectedAddress };
        newAddressWithNumber.address = `${newAddressWithNumber.address} ${this.address_number}`;
        newAddressWithNumber.main_text = `${newAddressWithNumber.main_text} ${this.address_number}`;
        newAddressWithNumber.secondary_text = `${newAddressWithNumber.secondary_text} ${this.address_number}`;
        this.$emit("addressSelected", newAddressWithNumber);
      }
    },

    removeInputNumber() {
      this.selectedAddress = null;
      this.address_number = null;
      this.hasNumber = true;
    },

    setPropsAdress(address) {
      this.search_string = address;
      this.blur = true;
    },

    async setAdressAndSelectFirst(address) {
      this.isLoading = true;

      this.setPropsAdress(address);

      const placesResponse = await axios.get(this.autocomplete_url, {
        params: { ...this.api_params, place: this.search_string },
      });
      await this.getGeocode(placesResponse.data.data[0]);

      this.isLoading = false;
    },

    /**
     * Realiza chamada a api para sugestões de endereçõs
     */
    async callAutocompleteApi() {
      this.blur = false;
      this.hasZipCode = false;
      this.address_number = null;
      this.isLoading = true;

      try {
        if (this.search_string.length > this.MinLength) {
          //Format If Is ZipCode
          if (this.checkZipCode(this.search_string)) {
            this.hasZipCode = true;
            this.search_string = await this.findZipCode(
              this.formatZipCode(this.search_string)
            );
          }

          const { data: response } = await axios.get(this.autocomplete_url, {
            params: { ...this.api_params, place: this.search_string },
          });
          if (response.success) {
            this.places_result = response.data;
            this.clicker = response.clicker;
          } else {
            console.log("callAutocompleteApi ", response);
          }
        }
      } catch (error) {
        console.log("callAutocompleteApi ", error);
      }
      this.isLoading = false;
    },
    /**
     * Realiza chamada a api de geocode para recuperar a latitude
     * e logitude no caso de o provider ser google maps
     */
    async callPlaceId(place_id) {
      try {
        const { data: response } = await axios.get(this.GetPlaceDetailsRoute, {
          params: {
            ...this.api_params,
            place_id,
            clicker: this.clicker,
          },
        });
        return response;
      } catch (error) {
        console.log("callPlaceId ", error);
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
        console.log("callGeocodeApi ",error);
      }
    },

    async getGeocode(data) {
      this.isLoading = true;
      this.selectedAddress = data;

      if (this.selectedAddress.place_id != null) {
        const response = await this.callPlaceId(this.selectedAddress.place_id);
        if (response.success) {
          this.selectedAddress.latitude = response.data.latitude;
          this.selectedAddress.longitude = response.data.longitude;
        }
      }

      if (
        this.selectedAddress.latitude === null ||
        this.selectedAddress.longitude === null
      ) {
        const response = await this.callGeocodeApi(
          this.selectedAddress.address
        );
        if (response.success) {
          this.selectedAddress.latitude = response.data.latitude;
          this.selectedAddress.longitude = response.data.longitude;
        }
      }
      this.isLoading = false;
      this.$emit("addressSelected", this.selectedAddress);
    },

    async findZipCode(value) {
      this.isLoading = true;
      try {
        const response = await axios.post(
          "/api/v1/application/zip_code/geocode",
          {
            zipcode: value,
          }
        );
        if (response.status === 200 && response.data.success) {
          this.isLoading = false;
          return `${response.data.street} ${response.data.district} - ${response.data.state}`;
        }
      } catch (error) {
        this.isLoading = false;
        console.log("ZIP CODE ERROR ", error);
      }
    },

    /**
     * Seleciona uma sugestão de endereço
     */
    async handleSelectAddress(data) {
      this.search_string = data.address;
      this.places_result = [];
      this.hasNumber = true;

      await this.getGeocode(data);
      this.validateNumber(data);
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
    validateNumber(data) {
      if (!this.checkNumber(data.address) && this.RequiredNumber) {
        if (this.$toasted)
          this.$toasted.show(this.NeedAddressNumberText, {
            theme: "bubble",
            type: "info",
            position: "bottom-center",
            duration: 5000,
          });
        this.hasNumber = false;
      }
    },

    /**
     * Checa se o endereço escolhido possui número
     */
    validateRequiredNumber() {
      if (
        !this.hasNumber &&
        (this.address_number == null || this.address_number <= 0) &&
        this.hasZipCode &&
        !this.isLoading &&
        this.search_string.length > 0
      )
        return false;

      return true;
    },

    /**
     * Checa se o endereço escolhido possui número
     */
    checkNumber(address) {
      let check = false;
      let components = address.split(" ");

      return (check = components.some(function(component, index) {
        let teste = parseInt(component.replace(",", "").replace("-", ""));
        if (typeof teste === "number" && !isNaN(teste) && index > 0) {
          if (teste.toString().length > 4) {
            return false;
          } else {
            return true;
          }
        }
        // return typeof teste === "number" && !isNaN(teste) && index > 0;
      }));
    },

    /**
     * Checa se o endereço escolhido é um CEP
     */
    checkZipCode(address) {
      var validacep = /^[0-9]{8}$/;

      const zipCode = address.replace(/\D/g, "");

      return validacep.test(zipCode);
    },

    /**
     * Formata o Cep com 5-3
     */
    formatZipCode(address) {
      const zipCode = address.replace(/\D/g, "");

      return zipCode.replace(/(\d{5})(\d{3})$/, "$1-$2");
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
    this.blur = true;
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
