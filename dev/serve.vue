<script>
import Vue from 'vue';
import VueAddressAutocomplete from '@/vue-address-autocomplete.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueAddressAutocomplete
  },
  methods: {
    getSelectedData(value) {	
      console.log(value);
    }
	}
});
</script>

<template>
  <div id="app">
    <vue-address-autocomplete 
      ref="autocomplete"
      PlaceHolderText="Escreva o endereço"
      NeedAddressNumberText="Escreva o endereço"
      :AutocompleteParams='{ 
        "id": "",
        "token": "",
        "latitude": -19.743745,
        "longitude": -43.8386481
      }'            
      AutocompleteUrl="teste.com"
      GeocodeUrl='teste.com'
      :MinLength='5'
      :Delay='1000'
      @addressSelected='getSelectedData'
    />
  </div>
</template>
