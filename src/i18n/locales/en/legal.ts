import type { legal as esLegal } from '../es/legal';

export const legal: typeof esLegal = {
  termsTitle: 'Terms of Service',
  privacyTitle: 'Privacy Policy',
  licensesTitle: 'Open Source Licenses',
  lastUpdated: 'Last updated: January 1, 2026',
  close: 'Close',

  // Terms sections
  termsWelcome: 'Welcome to Birdify. By accessing or using our application, you agree to be bound by these Terms of Service.',
  termsUsageTitle: '1. Use of the Platform',
  termsUsageText: 'Birdify is created for observing, logging, and sharing bird sightings for recreational and scientific discovery. You agree not to post false content or promote harm to wildlife.',
  termsContentTitle: '2. User Content',
  termsContentText: 'You retain full ownership of photos and observations you submit. By sharing on Birdify, you grant a non-exclusive license to display them to the community.',
  termsConductTitle: '3. Ethics and Bird Welfare',
  termsConductText: 'Bird welfare comes first. Avoid excessive playback calls that disrupt nesting, and protect sensitive coordinates of endangered species.',

  // Privacy sections
  privacyWelcome: 'At Birdify, we take your privacy and personal data protection very seriously.',
  privacyCollectionTitle: '1. Information We Collect',
  privacyCollectionText: 'We collect your name, email address, username, and the bird sightings (including photos and GPS coordinates) you choose to document.',
  privacyLocationTitle: '2. Use of Geographic Location',
  privacyLocationText: 'Location is used to place sightings on the map and enable local filters. You can enable "Private Location" on any sighting at any time.',
  privacySharingTitle: '3. Sharing with Third Parties',
  privacySharingText: 'We never sell your personal data. Anonymized sighting datasets may be shared with scientific ornithology conservation projects.',

  // Licenses sections
  licensesIntro: 'Birdify utilizes various open-source libraries under permissive licenses (MIT, Apache 2.0, and BSD):',
};
