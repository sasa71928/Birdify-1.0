import type { TranslationSchema } from '../es';
import { core } from './core';
import { time } from './time';
import { nav } from './nav';
import { auth } from './auth';
import { feed } from './feed';
import { explore } from './explore';
import { dictionary } from './dictionary';
import { bird } from './bird';
import { sighting } from './sighting';
import { legal } from './legal';
import { errors } from './errors';
import { settings } from './settings';
import { profile } from './profile';

export const en: TranslationSchema = {
  ...core,
  time,
  nav,
  auth,
  feed,
  explore,
  dictionary,
  bird,
  sighting,
  legal,
  errors,
  settings,
  profile,
};

