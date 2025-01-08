import {
  faDatabase,
  faFilm,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import {
  faGoogle,
  faImdb,
  faWikipediaW,
} from '@fortawesome/free-brands-svg-icons';

export type Search = {
  icon: IconDefinition;
  label: string;
};

export type Site = Search & {url: string};

export class Meta {
  static readonly SEARCH_BANG_METACRITIC: Search = {
    label: 'metacritic',
    icon: faDatabase,
  };

  static readonly SEARCH_BANG_SENSCRITIQUE: Search = {
    label: 'scq',
    icon: faFilm,
  };

  static readonly SEARCH_BANG_GOOGLE: Search = {
    label: 'google',
    icon: faGoogle,
  };

  static readonly SEARCH_BANG_IMDB: Search = {label: 'imdb', icon: faImdb};
  static readonly SEARCH_BANG_WIKI_EN: Search = {
    label: 'wen',
    icon: faWikipediaW,
  };

  static readonly SEARCH_BANG_WIKI_FR: Search = {
    label: 'wikifr',
    icon: faWikipediaW,
  };

  static readonly METACRITIC_SEARCH_URL = 'https://www.metacritic.com/search';

  static readonly GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=';
}
