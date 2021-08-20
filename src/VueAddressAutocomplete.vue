<template>
  <div style="position: relative">

    <v-select
      v-model="selectedAddressOption"
      label="address"
      :filterable="false"
      :options="addressOptions"
      @search="onSearchAddress"
      @input="handleSelectAddress"
      inputId="vue-js-auto-complete-id"
    >
      <template #search="{ attributes, events }">
        <input
          maxlength="255"
          v-model="inputSearchAddress"
          class="vs__search"
          v-bind="attributes"
          v-on="events"
        >
      </template>

      <template slot="no-options">
        {{NotFoundAddress}}
      </template>
      <template slot="option" slot-scope="option" style="font-size: 15px;">
        <div class="d-center">
          <p style="margin-bottom: 0">{{ option.main_text }}</p>
          <p style="margin-bottom: 0">{{ option.secondary_text }}</p>
        </div>
      </template>
      <template slot="selected-option" slot-scope="option">
        <div class="selected d-center" style="font-size: 15px;">
         {{  option.address }}
        </div>
      </template>
    </v-select>

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
import { debounce } from "lodash";
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
export default {
  components: {
    vSelect,
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
    NotFoundAddress: {
      type: String,
      default:
        "Nenhum Endereço Encontrado.",
    },
    NumberLabel: {
      type: String,
      default: "Numero",
    },
  },
  data() {
    return {
      places_result: [],
      api_params: {},
      autocomplete_url: "",
      geocode_url: "",
      clicker: "primary",

      address_number: null,
      hasNumber: true,
      hasZipCode: false,


      inputSearchAddress: null,
      selectedAddressOption: null,
      addressOptions: [],
    };
  },

  methods: {
    // Manual Set Address
    openOptions(){
      document.getElementById("vue-js-auto-complete-id").focus();
    },
    setPropsAdress(value){
      this.selectedAddressOption = null
      this.inputSearchAddress = value
    },
    handleSearchInput: debounce(async (loading, search, vm) => {
      await vm.searchPlace(search);
      loading(false);
    }, 200),
    async onSearchAddress(search, loading) {
      if (search.length > this.MinLength) {
        loading(true);
        await this.handleSearchInput(loading, search, this);
      }
    },
    /**
     * Realiza chamada a api para sugestões de endereçõs
    */
    async searchPlace(search) {
      this.hasZipCode = false; // address is zipcode
      this.hasNumber = true; // address dont has Number
      this.address_number = null; // remove inputed number
      this.inputSearchAddress = search

      //Format If Is ZipCode
      if (this.checkZipCode(this.inputSearchAddress)) {
        this.hasZipCode = true;
        this.inputSearchAddress = await this.findZipCode(
          this.formatZipCode(this.inputSearchAddress)
        );
      }

      const { data: response } = await axios.get(this.autocomplete_url, {
        params: { ...this.api_params, place: this.inputSearchAddress },
      });

      if (response.success) {
        this.addressOptions = response.data;
        this.clicker = response.clicker;
      }else{
        console.log("searchPlace ERROR");
      }

    },

    async setNumber() {
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
        this.inputSearchAddress = `${this.selectedAddressOption.main_text} ${this.address_number}, ${this.selectedAddressOption.secondary_text}`

        this.selectedAddressOption = null
        this.removeInputNumber()
      
        await this.searchPlace(this.inputSearchAddress) 

        this.openOptions()

        return;

      } else {
        let newAddressWithNumber = { ...this.selectedAddressOption };

        newAddressWithNumber.main_text = `${newAddressWithNumber.main_text} ${this.address_number}`;
        newAddressWithNumber.address = `${newAddressWithNumber.main_text} ${newAddressWithNumber.secondary_text}`;

        // this.$emit("addressSelected", newAddressWithNumber);
        this.$emit('search', newAddressWithNumber.address, false);
        // faz uma pesquisa com o novo endereço:
        await this.searchPlace(newAddressWithNumber.address);
        this.openOptions();
      }
    },

    removeInputNumber() {
      this.address_number = null;
      this.hasNumber = true;
    },

    async setAdressAndSelectFirst(address) {
      this.setPropsAdress(address);
      
      const placesResponse = await axios.get(this.autocomplete_url, {
        params: { ...this.api_params, place: address },
      });

      this.inputSearchAddress = null
      this.selectedAddressOption = placesResponse.data.data[0]

      await this.getGeocode(this.selectedAddressOption);
    },
    
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

      if (data.place_id != null) {
        const response = await this.callPlaceId(data.place_id);
        if (response.success) {
          data.latitude = response.data.latitude;
          data.longitude = response.data.longitude;
        }
      }

      if (
        data.latitude === null ||
        data.longitude === null
      ) {
        const response = await this.callGeocodeApi(
          data.address
        );
        if (response.success) {
          data.latitude = response.data.latitude;
          data.longitude = response.data.longitude;
        }
      }
      this.$emit("addressSelected", data);
    },

    async findZipCode(value) {
      try {
        const response = await axios.post(
          "/api/v1/application/zip_code/geocode",
          {
            zipcode: value,
          }
        );
        if (response.status === 200 && response.data.success) {
          return `${response.data.street} ${response.data.district} - ${response.data.state}`;
        }
      } catch (error) {
        console.log("ZIP CODE ERROR ", error);
      }
    },

    /**
     * Seleciona uma sugestão de endereço
     */
    async handleSelectAddress(data) {
      this.places_result = [];
      this.hasNumber = true;
      this.inputSearchAddress = null

      this.selectedAddressOption = data

      await this.getGeocode(this.selectedAddressOption);

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
      if (!this.hasNumber && (this.address_number == null || this.address_number <= 0) && this.hasZipCode) return false;
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
  mounted() {
    this.autocomplete_url = this.AutocompleteUrl;
    this.geocode_url = this.GeocodeUrl;

    if(this.Address) this.setPropsAdress(this.Address)
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
