# vue-address-autocomplete

## Project setup

Need [laravel-geolocation](https://git.codificar.com.br/laravel-libs/laravel-geolocation) in the project, to have access to the places and geocode routes

## Install

add in package.json:

```bash
"vue-address-autocomplete": "git+https://libs:ofImhksJ@git.codificar.com.br/vuejs-components/vue-address-autocomplete.git#master",
```

## PHP Routes

```php
   $enviroment = 'user'; // corp|admin|user
   $AutocompleteRoute  =  URL::Route($enviroment.'AutocompleteUrl');
   $AutocompleteRoute  =   URL::Route($enviroment.'GeocodeUrl');
```

## Usage

```js
<VueAddressAutocomplete
    ref="address_autocomplete"
    PlaceHolderText="Digite Aki"
    :AutocompleteParams="userParams"
    :AutocompleteUrl="AutocompleteRoute"
    :GeocodeUrl="GeocodeRoute"
    :MinLength="5"
    :Delay="1000"
    :NeedAddressNumberText="Digite o Número"
    :Address="address ? address : null"
    :RequiredNumber="false"
    @addressSelected="setPlace"
/>

<script>
    import VueAddressAutocomplete from "vue-address-autocomplete";
    export default {
      components: { VueAddressAutocomplete }
      data() {
        return {
         address: "User Navigator Address",
         userParams: {
            id: 1,
            token: "token123",
            latitude: -25,
            longitude: -45,
         }
        }
      },
      methods: {
        setPlace(place) {
            console.log("Place ", place)
            //place.address
            //place.latitude
            //place.longitude
        }
      }
    }
<script>
```

## Props

| Prop                    | Type      | Required | Default                                  | Note                                                              |
| ----------------------- | --------- | -------- | ---------------------------------------- | ----------------------------------------------------------------- |
| `AutocompleteParams`    | `Object`  | `YES`    | `"{}"`                                   | Auth current user and search and search near address with lat/lng |
| `AutocompleteUrl`       | `String`  | `YES`    | `""`                                     | Url to search a place.                                            |
| `GeocodeUrl`            | `String`  | `YES`    | `""`                                     | Url to search a geocode.                                          |
| `PlaceHolderText`       | `String`  | `NO`     | `Escreva o endereço`                     | Address Input Placeholder                                         |
| `MinLength`             | `Number`  | `NO`     | `5`                                      | Minimum length of characters to start searching                   |
| `Delay`                 | `Number`  | `NO`     | `1000`                                   | Time in milliseconds to start searching                           |
| `Address`               | `String`  | `NO`     | `""`                                     | Address text default value                                        |
| `RequiredNumber`        | `Boolean` | `NO`     | `true`                                   | The address number is required.                                   |
| `NeedAddressNumberText` | `String`  | `NO`     | `Você não informou o número do endereço` | Text alert with not insert address number                         |
| `NumberLabel`           | `String`  | `NO`     | `Numero`                                 | number input label.                                               |

## Events

| Event             | Note                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| `addressSelected` | Returns address object `{address: "Rua Teste", latitude: 1, longitude: 1'}` |

## Children Functions

| Function                               | Note                                           |
| -------------------------------------- | ---------------------------------------------- |
| `removeInputNumber()`                  | Remove Number Input                            |
| `setPropsAdress(addressText)`          | Set address input text                         |
| `setAdressAndSelectFirst(addressText)` | Set address input text and select first option |
