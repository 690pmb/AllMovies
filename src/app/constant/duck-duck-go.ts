import {faDatabase, faFilm} from '@fortawesome/free-solid-svg-icons';
import {
  faGoogle,
  faImdb,
  faWikipediaW,
} from '@fortawesome/free-brands-svg-icons';

export class Search {
  site!: string;
  icon: any;
  key?: string;
}

export class DuckDuckGo {
  static readonly SEARCH_BANG_METACRITIC: Search = {
    site: 'metacritic',
    icon: faDatabase,
  };

  static readonly SEARCH_BANG_SENSCRITIQUE: Search = {
    site: 'scq',
    icon: faFilm,
  };

  static readonly SEARCH_BANG_GOOGLE: Search = {
    site: 'google',
    icon: faGoogle,
  };

  static readonly SEARCH_BANG_IMDB: Search = {site: 'imdb', icon: faImdb};
  static readonly SEARCH_BANG_WIKI_EN: Search = {
    site: 'wen',
    icon: faWikipediaW,
  };

  static readonly SEARCH_BANG_WIKI_FR: Search = {
    site: 'wikifr',
    icon: faWikipediaW,
  };

  static readonly DUCKDUCKGO_URL = 'https://api.duckduckgo.com/?q=!';

  static readonly GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=';
}
