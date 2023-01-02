import {Score} from './score';
import {Genre, Keyword, AlternativeTitle} from './model';
import {Movie} from './movie';
import {Serie} from './serie';

export class DataI18N {
  constructor(
    public name: string,
    public poster: string,
    public category: Genre[]
  ) {}
}

export class Data {
  id!: number;
  title!: string;
  original_title!: string;
  affiche!: string;
  overview!: string;
  genres: Genre[] = [];
  translation!: Map<string, DataI18N>; // key: lang
  score!: Score;
  imdb_id!: string;
  popularity!: number;
  vote!: number;
  vote_count!: number;
  videos: string[] = [];
  actors: string[] = [];
  crew: string[] = [];
  images: string[] = [];
  keywords: Keyword[] = [];
  alternativeTitles: AlternativeTitle[] = [];
  character!: string;
  updated: Date = new Date();
  added: Date = new Date();
  lang_version = 'fr';
  isMovie!: boolean;
  checked!: boolean;
  isBookmarked!: boolean;

  constructor() {}

  removeFields(key: string, value: string): string | undefined {
    console.log('removeFields');
    return value;
  }

  movie(): this is Movie {
    return this.isMovie;
  }

  serie(): this is Serie {
    return !this.isMovie;
  }
}
