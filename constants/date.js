/** Convert date to full string, options of having day of week */
export const formatDate = (value, withDate) => {
  let dt = new Date(value);

  let day_number = dt.getDay() + 1;
  let date = dt.getDate().toString();
  let month_number = dt.getMonth() + 1;
  let year = dt.getFullYear();
  
  let day, month;
  
  switch(day_number) {
    case 1: day = "Sunday"; break;
    case 2: day = "Monday"; break;
    case 3: day = "Tuesday"; break;
    case 4: day = "Wednesday"; break;
    case 5: day = "Thursday"; break;
    case 6: day = "Friday"; break;
    case 7: day = "Saturday"; break;
  }
  
  switch(month_number) {
    case 1: month = "January"; break;
    case 2: month = "February"; break;
    case 3: month = "March"; break;
    case 4: month = "April"; break;
    case 5: month = "May"; break;
    case 6: month = "June"; break;
    case 7: month = "July"; break;
    case 8: month = "August"; break;
    case 9: month = "September"; break;
    case 10: month = "October"; break;
    case 11: month = "November"; break;
    case 12: month = "December"; break;
  }

  let result = `${date}${getDateSuffix(date)} ${month} ${year}`;
  result = withDate ? `${day} ${result}` : result;
  
  return result;
}

/** Get date in YYYY-MM-DD format */
export const formatISODate = (value, joined) => {
  let dd = value.getDate();
  let mm = value.getMonth() + 1;
  let yyyy = value.getFullYear();

  dd = (dd < 10) ? '0' + dd : dd;
  mm = (mm < 10) ? '0' + mm : mm;

  return joined ? `${yyyy}-${mm}-${dd}` : `${yyyy}${mm}${dd}`;
}

/** Get suffix of date */
const getDateSuffix = (day) => {
  let suffix = "";
  
  switch(day) {
    case '1': case '21': case '31': suffix = 'st'; break;
    case '2': case '22': suffix = 'nd'; break;
    case '3': case '23': suffix = 'rd'; break;
    default: suffix = 'th';
  }
  
  return suffix;
}

/** Calculate the age from a birth date */
export const calculateAge = (bday) => {
  const birthday = new Date(bday);
  
  const dd = birthday.getDate();
  const mm = birthday.getMonth();
  const yy = birthday.getFullYear();
  
  const td = new Date().getDate();
  const tm = new Date().getMonth();
  const ty = new Date().getFullYear();
  
  let age = ty - yy;
  age += (tm - mm) / 12;
  age += (td - dd) / 310;
  
  return Math.floor(age);
}