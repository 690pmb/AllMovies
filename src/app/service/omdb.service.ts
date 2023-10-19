import {Injectable} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

import {Score} from '../model/score';
import {UtilsService} from './utils.service';
import {Constants} from '../constant/constants';
import {ToastService} from './toast.service';
import {Data} from '../model/data';

@Injectable({
  providedIn: 'root',
})
export class OmdbService {
  constructor(
    private serviceUtils: UtilsService,
    private toast: ToastService
  ) {}

  getScore(id: string): Promise<Score> {
    return this.getScore$(id).toPromise();
  }

  getScore$(id: string): Observable<Score> {
    const url = `${Constants.OMDB_URL}${Constants.OMDB_ID}${id}${Constants.OMDB_API_KEY}`;
    return this.serviceUtils.getObservable(url).pipe(
      map((response: any) => {
        if (!response.Error) {
          const score = new Score();
          score.ratings = response.Ratings.map(r => {
            if (r.Source === 'Internet Movie Database') {
              r.Source = 'IMDb';
            }
            return r;
          });
          score.ratings.push({Source: 'Awards', Value: response.Awards});
          score.imdb_votes = parseInt(response.imdbVotes.replace(/,/g, ''), 10);
          console.log('score', score);
          return score;
        } else {
          return undefined;
        }
      }),
      catchError(err => {
        this.serviceUtils.handleObsError(err, this.toast);
        return undefined;
      })
    );
  }

  getImdbScore<T extends Data>(data: T): Observable<T> {
    if (data.imdb_id) {
      return this.getScore$(data.imdb_id).pipe(
        map(score => {
          if (score) {
            score.ratings.splice(
              -1,
              0,
              ...[
                {Source: 'MovieDB', Value: data.vote + '/10'},
                {Source: 'Popularity', Value: data.popularity},
              ]
            );
            score.moviedb_votes = data.vote_count;
            data.score = score;
          }
          return data;
        })
      );
    } else {
      return of(data);
    }
  }
}
