/** Topic categories */
export const categories = [
  {
    label: 'Academia',
    short: 'academia'
  },
  {
    label: 'Christian',
    short: 'christian',
  },
  {
    label: 'Ethnicity',
    short: 'ethnicity',
  },
  { 
    label: 'Family & Relationships',
    short: 'family',
  },
  {
    label: 'Gender',
    short: 'gender',
  },
  { 
    label: 'Mental Health',
    short: 'mental',
  },
  { 
    label: 'Philosophy & Ethics',
    short: 'philosophy',
  },
  { 
    label: 'Politics',
    short: 'politics',
  },
  { 
    label: 'Race',
    short: 'race',
  },
  { 
    label: 'Society & Stereotypes',
    short: 'society',
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