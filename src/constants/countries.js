const { zString } = require('zavid-modules');

exports.loadCountries = () => {
  return fetch('https://restcountries.eu/rest/v2/all')
    .then((res) => res.json())
    .catch((error) => console.error(error));
};

/** Retrieve demonym from country */
exports.getDemonym = (value, data) => {
  const matchedCountry = data.find((country) => country.label === value);
  return matchedCountry ? matchedCountry.demonym : value;
};

exports.getISOCode = (value, data) => {
  const found = data.find((country) => country.label === value);
  return found ? found.iso : value;
};

/** Display sentence of countries from array */
exports.countriesToString = (countries, data) => {
  if (!countries) return '';

  countries = countries
    .filter((e) => e)
    .map((country) => {
      return this.getDemonym(country, data);
    });

  return zString.toPunctuatedList(countries);
};
