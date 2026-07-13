import {DiscoverCriteria} from './../model/discover-criteria';
import {Url} from './../constant/url';
import {DetailConfig} from '../model/model';

export class UrlBuilder {
  static personUrlBuilder(
    id: number,
    language: string,
    images: boolean,
    credits: boolean
  ): string {
    let url = `${Url.PERSON_URL}/${id}?${Url.API_KEY}`;
    if (images || credits) {
      url += `${Url.APPEND}`;
      const parametres: string[] = [];
      if (images) {
        parametres.push(`${Url.APPEND_IMAGES}`);
      }
      if (credits) {
        parametres.push(`${Url.APPEND_COMBINED_CREDITS}`);
      }
      url += parametres.join(',');
    }
    url = UrlBuilder.langUrlBuilder(url, language);
    return url;
  }

  static seasonUrlBuilder(
    id: number,
    season: number,
    language: string,
    images: boolean,
    credits: boolean,
    videos: boolean
  ): string {
    let url = `${Url.SERIE_URl}/${id}${Url.SEASON_URL}${season}?${Url.API_KEY}`;
    if (images || credits || videos) {
      url += `${Url.APPEND}`;
      const parametres: string[] = [];
      if (images) {
        parametres.push(`${Url.APPEND_IMAGES}`);
      }
      if (credits) {
        parametres.push(`${Url.APPEND_CREDITS}`);
      }
      if (videos) {
        parametres.push(`${Url.APPEND_VIDEOS}`);
      }
      url += parametres.join(',');
    }
    url = UrlBuilder.langUrlBuilder(url, language);
    return url;
  }

  static detailUrlBuilder(
    isMovie: boolean,
    id: number,
    config: DetailConfig
  ): string {
    let url = isMovie ? Url.MOVIE_URl : Url.SERIE_URl;
    url += `/${id}?${Url.API_KEY}`;
    if (config.video || config.credit || config.reco || config.img) {
      url += `${Url.APPEND}`;
      const parametres = [];
      if (config.video) {
        parametres.push(`${Url.APPEND_VIDEOS}`);
      }
      if (config.credit) {
        parametres.push(`${Url.APPEND_CREDITS}`);
      }
      if (config.reco) {
        parametres.push(`${Url.APPEND_RECOMMENDATIONS}`);
      }
      if (config.release) {
        parametres.push(`${Url.APPEND_RELEASE_DATE}`);
      }
      if (config.keywords) {
        parametres.push(`${Url.APPEND_KEYWORDS}`);
      }
      if (config.titles) {
        parametres.push(`${Url.APPEND_ALTERNATIVE_TITLES}`);
      }
      if (config.similar) {
        parametres.push(`${Url.APPEND_SIMILARS}`);
      }
      if (config.img) {
        parametres.push(`${Url.APPEND_IMAGES}`);
      }
      if (external) {
        parametres.push(`${Url.APPEND_EXTERNAL_IDS}`);
      }
      url += parametres.join(',');
    }
    url = UrlBuilder.langUrlBuilder(url, config.lang);
    return url;
  }

  static playingUrlBuilder(criteria: DiscoverCriteria): string {
    let url = `${Url.PLAYING_URL}`;
    const parametres = [];
    if (criteria.page) {
      parametres.push(`${Url.PAGE_URL}${criteria.page}`);
    }
    if (criteria.region) {
      parametres.push(`${Url.REGION}${criteria.region.toUpperCase()}`);
    }
    url += parametres.join('');
    url = UrlBuilder.langUrlBuilder(url, criteria.language);
    return url;
  }

  static discoverUrlBuilder(
    isMovie: boolean,
    criteria: DiscoverCriteria,
    people?: number[],
    genre?: number[],
    keyword?: number[],
    networks?: number[],
    isWithoutGenre = false,
    isWithoutKeyword = false
  ): string {
    let url = `${isMovie ? Url.DISCOVER_MOVIE_URL : Url.DISCOVER_SERIE_URL}`;
    const parametres = [];
    if (criteria.sortField && criteria.sortDir) {
      parametres.push(
        `${Url.SORT_BY_URL}${criteria.sortField}.${criteria.sortDir}`
      );
    }
    if (criteria.page) {
      parametres.push(`${Url.PAGE_URL}${criteria.page}`);
    }
    if (criteria.region) {
      parametres.push(`${Url.REGION}${criteria.region.toUpperCase()}`);
    }
    if (criteria.yearMin) {
      parametres.push(
        `${isMovie ? Url.RELEASE_DATE_GTE_URL : Url.FIRST_AIR_DATE_GTE_URL}${
          criteria.yearMin
        }`
      );
    }
    if (criteria.yearMax) {
      parametres.push(
        `${isMovie ? Url.RELEASE_DATE_LTE_URL : Url.FIRST_AIR_DATE_LTE_URL}${
          criteria.yearMax
        }`
      );
    }
    if (criteria.adult && isMovie) {
      parametres.push(`${Url.ADULT_URL}`);
    }
    UrlBuilder.voteUrlBuilder(parametres, criteria);
    UrlBuilder.certificationUrlBuilder(parametres, criteria, isMovie);
    UrlBuilder.runtimeUrlBuilder(parametres, criteria);
    if (criteria.releaseType && isMovie) {
      parametres.push(
        `${Url.WITH_RELEASE_TYPE_URL}${criteria.releaseType.join(Url.OR_URL)}`
      );
    }
    if (people && people.length > 0) {
      parametres.push(`${Url.WITH_PEOPLE_URL}${people.join(Url.AND_URL)}`);
    }
    if (criteria.originalLangs && criteria.originalLangs.length > 0) {
      parametres.push(
        `${Url.WITH_ORIGINAL_LANGUAGE}${criteria.originalLangs.join(
          Url.OR_URL
        )}`
      );
    }
    UrlBuilder.genresUrlBuilder(parametres, genre, isWithoutGenre);
    UrlBuilder.keywordsUrlBuilder(parametres, keyword, isWithoutKeyword);
    UrlBuilder.networksUrlBuilder(parametres, networks);
    url += parametres.join('');
    url = UrlBuilder.langUrlBuilder(url, criteria.language);
    return url;
  }

  private static runtimeUrlBuilder(
    parametres: string[],
    criteria: DiscoverCriteria
  ): void {
    if (criteria.runtimeMin) {
      parametres.push(`${Url.WITH_RUNTIME_GTE_URL}${criteria.runtimeMin}`);
    }
    if (criteria.runtimeMax) {
      parametres.push(`${Url.WITH_RUNTIME_LTE_URL}${criteria.runtimeMax}`);
    }
  }

  private static voteUrlBuilder(
    parametres: string[],
    criteria: DiscoverCriteria
  ): void {
    if (criteria.voteAvergeMin) {
      parametres.push(`${Url.VOTE_AVERAGE_GTE_URL}${criteria.voteAvergeMin}`);
    }
    if (criteria.voteAvergeMax) {
      parametres.push(`${Url.VOTE_AVERAGE_LTE_URL}${criteria.voteAvergeMax}`);
    }
    if (criteria.voteCountMin) {
      parametres.push(`${Url.VOTE_COUNT_GTE_URL}${criteria.voteCountMin}`);
    }
  }

  private static certificationUrlBuilder(
    parametres: string[],
    criteria: DiscoverCriteria,
    isMovie: boolean
  ): void {
    if (criteria.certification && isMovie) {
      parametres.push(`${Url.CERTIFICATION_COUNTRY_URL}`);
      parametres.push(`${Url.CERTIFICATION_URL}${criteria.certification}`);
    }
  }

  private static genresUrlBuilder(
    parametres: string[],
    genre?: number[],
    genresWithout?: boolean
  ): void {
    if (genre && genre.length > 0) {
      const genreUrl = genresWithout
        ? Url.WITHOUT_GENRES_URL
        : Url.WITH_GENRES_URL;
      parametres.push(`${genreUrl}${genre.join(Url.OR_URL)}`);
    }
  }

  private static keywordsUrlBuilder(
    parametres: string[],
    keyword?: number[],
    keywordsWithout?: boolean
  ): void {
    if (keyword && keyword.length > 0) {
      const keywordUrl = keywordsWithout
        ? Url.WITHOUT_KEYWORDS_URL
        : Url.WITH_KEYWORDS_URL;
      parametres.push(`${keywordUrl}${keyword.join(Url.OR_URL)}`);
    }
  }

  private static networksUrlBuilder(
    parametres: string[],
    networks?: number[]
  ): void {
    if (networks && networks.length > 0) {
      parametres.push(`${Url.WITH_NETWORKS_URL}${networks.join(Url.OR_URL)}`);
    }
  }

  private static langUrlBuilder(
    url: string,
    language: string | undefined
  ): string {
    let result = url;
    if (language) {
      result += `${Url.LANGUE}${language}`;
      result += `${Url.INCLUDE_IMAGE_LANGUAGE}${language},null`;
    }
    return result;
  }
}
