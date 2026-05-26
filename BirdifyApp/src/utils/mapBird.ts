import { BirdSpeciesData } from '../navigation/AppNavigator';

const VALID_BIRD_IMAGES = [
  'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1535220527862-fd8d43f8e8fd?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1443890923872-c1fb25b45885?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=80&w=600&h=600',
  'https://images.unsplash.com/photo-1441206365207-0cae1e8b2857?auto=format&fit=crop&q=80&w=600&h=600',
];

export function mapBird(bird: any, index: number = 0): BirdSpeciesData {
  return {
    id: bird.id,
    name: bird.common_name || 'Unknown Bird',
    scientificName: bird.scientific_name || 'Unknown',

    image: VALID_BIRD_IMAGES[index % VALID_BIRD_IMAGES.length],

    status: bird.season?.toUpperCase() === 'MIGRATORIA'
      ? 'MIGRATORIA'
      : 'RESIDENTE',

    overview: bird.description || '',
    habitat: bird.habitat_info || '',
    conservationStatus: bird.ideal_zones || '',

    classification: {
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Aves',
      order: 'Passeriformes',
      family: bird.family || 'Unknown',
      genus: bird.scientific_name?.split(' ')[0] || 'Unknown',
    },
  };
}