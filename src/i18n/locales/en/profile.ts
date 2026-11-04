import type { profile as esProfile } from '../es/profile';

export const profile: typeof esProfile = {
  followers: 'Followers',
  following: 'Following',
  species: 'Species',
  sightings: 'Sightings',
  editProfile: 'Edit Profile',
  shareProfile: 'Share Profile',
  shareMessage: 'Check out my birdwatcher profile on Birdify! @{username}',
  follow: 'Follow',
  followingUser: 'Following',
  unfollow: 'Unfollow',
  sendMessage: 'Send Message',
  reportUser: 'Report User',
  verified: 'Verified',
  certifiedBadge: 'Certified Birdwatcher',
  adminRole: 'Administrator',
  birdWatcherRole: 'Birdwatcher',
  noBio: 'No bio yet.',
  privateAccountTitle: 'This Account is Private',
  privateAccountSubtitle: 'You must mutually follow each other to view sightings, logbook, and likes.',

  // Tabs
  tabSightings: 'Sightings',
  tabLogbook: 'Logbook',
  tabLikes: 'Likes',

  // Sightings tab
  noSightings: 'No sightings posted yet.',
  noSightingsOther: 'This user has not posted any sightings yet.',

  // Logbook tab
  noSpecies: 'No species cataloged yet.',
  totalSpecies: 'Species',
  totalSightings: 'Sightings',
  birdStamps: 'Bird Stamps',
  timesObserved: '×{count}',
  noImagesAvailable: 'No images available',

  // Likes tab
  noLikes: 'No reacted sightings yet.',
  noLikesOther: 'This user has no reactions yet.',

  // Modal followers
  noUsersInList: 'No users to display.',
  reportSentSuccess: 'Report submitted successfully.',
  createChatFailed: 'Could not start conversation.',
};
