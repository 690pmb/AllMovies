import { ServiceUtils } from './serviceUtils';
import { Url } from './../constant/url';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Movie } from '../model/movie';
import { Person } from '../model/person';

@Injectable()
export class PersonService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private utils: ServiceUtils) { }

  getPerson(id: number, language: string): Promise<Person> {
    //        const url = `${Url.PERSON_URL}/${id}?${Url.API_KEY}${Url.LANGUE_FR},${Url.APPEND_IMAGES}`;
    const url = `${Url.PERSON_URL}/${id}?${Url.API_KEY}${Url.LANGUE}${language}${Url.APPEND}${Url.APPEND_IMAGES}`;
    const urlMovies = `${Url.PERSON_URL}/${id}/${Url.MOVIE_CREDITS_URL}?${Url.API_KEY}${Url.LANGUE}${language}`;
    return Observable.forkJoin(
      this.utils.http.get(url),
      this.utils.http.get(urlMovies)
    ).map(responses => {
      return [].concat(...responses);
    }).map(response => this.mapPerson(response))
      .toPromise()
      .catch(this.utils.handleError);
  }

  mapPerson(response: any[]): Person {
    console.log(response);
    const resp = response[0];
    const crew = response[1].crew;

    const asActor = response[1].cast.map((r: any) =>
      this.toMovie(r, Url.IMAGE_URL_154, Url.IMAGE_URL_EMPTY, Url.IMAGE_URL_ORIGINAL));
    const asDirector = crew.filter((r: any) => this.jobEquals(r.job, 'Director'))
      .map((r: any) => this.toMovie(r, Url.IMAGE_URL_154, Url.IMAGE_URL_EMPTY, Url.IMAGE_URL_ORIGINAL));
    const asProducer = crew.filter((r: any) => this.jobEquals(r.job, 'Producer'))
      .map((r: any) => this.toMovie(r, Url.IMAGE_URL_154, Url.IMAGE_URL_EMPTY, Url.IMAGE_URL_ORIGINAL));
    const asCompositors = crew
      .filter((r: any) => (this.jobEquals(r.job, 'Compositors') || this.jobEquals(r.job, 'Original Music Composer')))
      .map((r: any) => this.toMovie(r, Url.IMAGE_URL_154, Url.IMAGE_URL_EMPTY, Url.IMAGE_URL_ORIGINAL));
    const asScreenplay = crew.filter((r: any) => (this.jobEquals(r.job, 'Screenplay') || this.jobEquals(r.job, 'Writer')))
      .map((r: any) => this.toMovie(r, Url.IMAGE_URL_154, Url.IMAGE_URL_EMPTY, Url.IMAGE_URL_ORIGINAL));
    const asNovel = crew.filter((r: any) => this.jobEquals(r.job, 'Novel'))
      .map((r: any) => this.toMovie(r, Url.IMAGE_URL_154, Url.IMAGE_URL_EMPTY, Url.IMAGE_URL_ORIGINAL));

    return new Person(resp.id, resp.name, resp.gender, resp.birthday, resp.deathday,
      resp.profile_path === null ? Url.IMAGE_URL_EMPTY : Url.IMAGE_URL_ORIGINAL + resp.profile_path,
      resp.profile_path === null ? Url.IMAGE_URL_EMPTY : Url.IMAGE_URL_154 + resp.profile_path, resp.biography,
      resp.adult, resp.place_of_birth, resp.images.profiles.map((i: any) => i.file_path).filter((i: any) => i !== resp.profile_path),
      asActor, asDirector, asProducer, asCompositors, asScreenplay, asNovel);
  }

  jobEquals(job: string, filter: string): boolean {
    return job.toLowerCase() === filter.toLowerCase();
  }

  toMovie(r: any, thumb: string, empty: string, original: string): any {
    return <Movie>({
      id: r.id, title: r.title, original_title: (r.original_title === r.title ? '' : r.original_title), date: r.release_date,
      synopsis: r.overview, affiche: (r.poster_path === null ? empty : original + r.poster_path),
      thumbnail: (r.poster_path === null ? empty : thumb + r.poster_path), adult: false, note: r.vote_average
    });
  }
}
