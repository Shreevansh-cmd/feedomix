
import { BirdType, FeedFormula } from '@/pages/Index';

export const feedFormulas: { [key: string]: FeedFormula } = {
  'broiler-prestarter': {
    'Maize': 530,
    'Soya DOC': 380,
    'Rice Bran': 20,
    'Vegetable Oil': 35,
    'DCP': 20,
    'Limestone Powder': 8,
    'Salt': 3,
    'Broiler Premix': 2.5,
    'Toxin Binder': 1,
    'Coccidiostat': 0.5
  },
  'broiler-starter': {
    'Maize': 550,
    'Soya DOC': 350,
    'Rice Bran': 25,
    'Vegetable Oil': 40,
    'DCP': 18,
    'Limestone Powder': 8,
    'Salt': 3,
    'Broiler Premix': 2.5,
    'Toxin Binder': 1,
    'Coccidiostat': 0.5
  },
  'broiler-finisher': {
    'Maize': 580,
    'Soya DOC': 300,
    'Rice Bran': 30,
    'Vegetable Oil': 50,
    'DCP': 15,
    'Limestone Powder': 7,
    'Salt': 3,
    'Broiler Premix': 2.5,
    'Toxin Binder': 1,
    'Coccidiostat': 0.5
  },
  'layer-grower': {
    'Maize': 580,
    'Soya DOC': 250,
    'Rice Bran': 80,
    'Vegetable Oil': 25,
    'DCP': 20,
    'Limestone Powder': 25,
    'Salt': 3,
    'Layer Premix': 2.5,
    'Toxin Binder': 1
  },
  'layer-feed': {
    'Maize': 550,
    'Soya DOC': 200,
    'Rice Bran': 80,
    'Vegetable Oil': 30,
    'DCP': 18,
    'Limestone Powder': 100,
    'Salt': 3,
    'Layer Premix': 2.5,
    'Toxin Binder': 1
  }
};

export const birdTypes: BirdType[] = [
  {
    id: 'broiler',
    name: 'Broiler',
    phases: [
      {
        id: 'prestarter',
        name: 'Pre-starter',
        ageRange: '0–10 days',
        protein: '22–23%',
        energy: '2900–3000 kcal/kg',
        formula: feedFormulas['broiler-prestarter']
      },
      {
        id: 'starter',
        name: 'Starter',
        ageRange: '11–21 days',
        protein: '20–22%',
        energy: '3000–3100 kcal/kg',
        formula: feedFormulas['broiler-starter']
      },
      {
        id: 'finisher',
        name: 'Finisher',
        ageRange: '22–42 days',
        protein: '18–19%',
        energy: '3200–3300 kcal/kg',
        formula: feedFormulas['broiler-finisher']
      }
    ]
  },
  {
    id: 'layer',
    name: 'Layer',
    phases: [
      {
        id: 'chick',
        name: 'Chick',
        ageRange: '0–8 weeks',
        protein: '20–21%',
        energy: '2800 kcal/kg'
      },
      {
        id: 'grower',
        name: 'Grower',
        ageRange: '9–18 weeks',
        protein: '16–17%',
        energy: '2700 kcal/kg',
        formula: feedFormulas['layer-grower']
      },
      {
        id: 'prelay',
        name: 'Pre-lay',
        ageRange: '19–20 weeks',
        protein: '17–18%',
        energy: '2750 kcal/kg'
      },
      {
        id: 'layer1',
        name: 'Layer 1',
        ageRange: '21–40 weeks',
        protein: '18–19%',
        energy: '2750–2800 kcal/kg',
        formula: feedFormulas['layer-feed']
      },
      {
        id: 'layer2',
        name: 'Layer 2',
        ageRange: '41–72 weeks',
        protein: '16–17%',
        energy: '2700–2750 kcal/kg',
        formula: feedFormulas['layer-feed']
      }
    ]
  }
];

export const availableIngredients = [
  'Maize',
  'Soya DOC',
  'Rice Bran',
  'Vegetable Oil',
  'DCP',
  'Limestone Powder',
  'Salt',
  'Broiler Premix',
  'Layer Premix',
  'Toxin Binder',
  'Coccidiostat'
];
