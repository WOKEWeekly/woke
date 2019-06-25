import fetch from 'isomorphic-fetch';

export const COUNTRIES = [];

fetch('https://restcountries.eu/rest/v2/all')
.then(res => res.json())
.then(json => {
  json.forEach(country => {
    COUNTRIES.push({ label: country.name, demonym: country.demonym });
  });
})
.catch(error => console.error(error));

/** Retrieve demonym from country */
export const getDemonym = (value) => {
  const found = COUNTRIES.find(country => country.label === value);
  return found ? found.demonym : value;
}

/** Display sentence of countries from array */
export const countriesToString = (countries) => {
  if (!countries) return '';

  const array = [];
  countries.forEach(country => {
    if (!country || country === '') return;
    array.push(getDemonym(country));
  });

  const str = [array.slice(0, -1).join(', '), array.slice(-1)[0]].join(array.length < 2 ? '' : ' & ');
  return str;
}