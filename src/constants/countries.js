exports.loadCountries = () => {
  return fetch('https://restcountries.eu/rest/v2/all')
    .then((res) => res.json())
    .catch((error) => console.error(error));
};

/** Retrieve demonym from country */
exports.getDemonym = (value, data) => {
  const found = data.find((country) => country.label === value);
  return found ? found.demonym : value;
};

exports.getISOCode = (value, data) => {
  const found = data.find((country) => country.label === value);
  return found ? found.iso : value;
};

/** Display sentence of countries from array */
exports.countriesToString = (countries, data) => {
  if (!countries) return '';

  const array = [];
  countries.forEach((country) => {
    if (!country || country === '') return;
    array.push(this.getDemonym(country, data));
  });

  const str = [array.slice(0, -1).join(', '), array.slice(-1)[0]].join(
    array.length < 2 ? '' : ' & '
  );
  return str;
};
