/** Topic categories */
export const categories = [
  {
    label: 'Christian',
    short: 'christian',
    color: 'rgb(95, 107, 58)',
    textColor: 'black',
    gradient: ['rgb(219, 213, 164)', 'rgb(204, 195, 127)', 'rgb(182, 170, 73)']
  },
  {
    label: 'Ethnicity',
    short: 'ethnicity',
    color: 'rgb(61, 38, 1)',
    textColor: 'white',
    gradient: ['rgb(92, 62, 2)', 'rgb(61, 38, 1)', 'rgb(33, 22, 0)']
  },
  { 
    label: 'Family & Relationships',
    short: 'family',
    color: 'rgb(79, 1, 14)',
    textColor: 'white',
    gradient: ['rgb(107, 3, 18)', 'rgb(79, 1, 14)', 'rgb(56, 0, 13)']
  },
  {
    label: 'Gender',
    short: 'gender',
    color: 'rgb(91, 1, 85)',
    textColor: 'white',
    gradient: ['rgb(132, 3, 128)', 'rgb(91, 1, 85)', 'rgb(61, 0, 61)']
  },
  { 
    label: 'Mental Health',
    short: 'mental',
    color: 'rgb(2, 75, 58)',
    textColor: 'white',
    gradient: ['rgb(2, 75, 58)', 'rgb(1, 61, 47)', 'rgb(0, 51, 39)'],
  },
  { 
    label: 'Philosophy & Ethics',
    short: 'philosophy',
    color: 'rgb(8, 1, 79)',
    textColor: 'white',
    gradient: ['rgb(3, 52, 102)', 'rgb(8, 1, 79)', 'rgb(3, 0, 53)'],
  },
  { 
    label: 'Politics',
    short: 'politics',
    color: 'rgb(59, 59, 59)',
    textColor: 'white',
    gradient: ['rgb(51, 51, 51)', 'rgb(59, 59, 59)', 'rgb(28, 28, 28)', 'rgb(18, 18, 18)', 'rgb(13, 13, 13)'],
  },
  { 
    label: 'Race',
    short: 'race',
    color: 'rgb(46, 1, 68)',
    textColor: 'white',
    gradient: ['rgb(62, 2, 91)', 'rgb(46, 1, 68)', 'rgb(34, 0, 51)'],
  },
  { 
    label: 'Society & Stereotypes',
    short: 'society',
    color: 'rgb(63, 66, 1)',
    textColor: 'white',
    gradient: ['rgb(99, 99, 2)', 'rgb(63, 66, 1)', 'rgb(42, 45, 1)']
  },
];

/** Topic types */
export const types = [
  { label: 'Debate', short: 'debate'},
  { label: 'Discussion', short: 'discussion'},
]

/** Topic polarity options */
export const polarity = [
  { label: 'Polar', short: 'polarity'},
  { label: 'Non-Polar', short: 'nonpolar'},
]

/** Retrieve array of colours for specific category */
export const getTextColor = (value) => {
  const found = categories.find(category => category.label === value);
  return found ? found.textColor : 'black';
}