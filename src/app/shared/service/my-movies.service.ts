import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Dropbox } from './../../constant/dropbox';
import { DropboxService } from './dropbox.service';
import { AuthService } from './auth.service';
import { Level } from './../../model/model';
import { Movie, MovieI18N } from './../../model/movie';
import { UtilsService } from './utils.service';
import { ToastService } from './toast.service';
import { Utils } from '../utils';

@Injectable()
export class MyMoviesService {
  myMovies$: BehaviorSubject<Movie[]> = new BehaviorSubject([]);

  constructor(
    private dropboxService: DropboxService,
    private auth: AuthService,
    private serviceUtils: UtilsService,
    private toast: ToastService,
  ) { }

  private static formatMovies(movies: Movie[]): Movie[] {
    const byId = Utils.groupBy(movies, 'id');
    return byId.map(by => {
      let result: Movie;
      movies.filter(m => m.id === +by.key).forEach(movie => {
        if (!result) {
          result = movie;
          result.translation = new Map();
        }
        result.translation.set(movie.lang_version, new MovieI18N(movie.title, movie.affiche, movie.genres));
      });
      return result;
    });
  }

  getFileName(): Promise<string> {
    return new Promise(resolve => resolve(`${Dropbox.DROPBOX_MOVIE_FILE}${this.auth.user$.getValue().id}${Dropbox.DROPBOX_FILE_SUFFIX}`));
  }

  getAll(): void {
    console.log('getAll');
    this.getFileName()
      .then((fileName: string) => this.dropboxService.downloadFile(fileName))
      .then((moviesFromFile: string) => Movie.fromJson(moviesFromFile))
      .then((movies: Movie[]) => {
        console.log('getAll', movies);
        this.myMovies$.next(movies);
      }).catch(err => this.serviceUtils.handlePromiseError(err, this.toast));
  }

  add(moviesToAdd: Movie[]): Promise<boolean> {
    let tempMovieList = [];
    let tempMoviesAdded = [];
    let fileName;
    const mapped = MyMoviesService.formatMovies(moviesToAdd);
    return this.getFileName().then((file: string) => {
      fileName = file;
      return this.dropboxService.downloadFile(fileName);
    }).then((moviesFromFile: string) => {
      // parse movies
      let movieList = [];
      if (moviesFromFile && moviesFromFile.trim().length > 0) {
        movieList = Movie.fromJson(moviesFromFile);
      }
      // filter if not already in collection
      const found = mapped.filter((add: Movie) => !movieList.map((movie: Movie) => movie.id).includes(add.id));
      if (found.length > 0) {
        tempMoviesAdded = found;
        found.forEach((movie: Movie) => {
          movie.added = new Date();
          movieList.push(movie);
        });
        movieList.sort(Utils.compareObject);
        return movieList;
      } else {
        this.toast.open(Level.info, 'toast.already_added');
        return [];
      }
    }).then((list: Movie[]) => {
      if (list && list.length !== 0) {
        tempMovieList = list;
        // replace with new array movies
        return this.dropboxService.uploadFile(Movie.moviesToBlob(list), fileName);
      } else {
        return undefined;
      }
    }).then((res: any) => {
      console.log(res);
      if (res) {
        // all good, modifies inner data
        console.log('myMovies', tempMovieList);
        this.myMovies$.next(tempMovieList);
        this.toast.open(Level.success, 'toast.movies_added', { size: tempMoviesAdded.length });
      }
      return true;
    }).catch((err) => {
      this.serviceUtils.handleError(err, this.toast);
      return false;
    });
  }

  remove(idToRemove: number[]): Promise<boolean> {
    let tempMovieList = [];
    let fileName;
    return this.getFileName().then((file: string) => {
      fileName = file;
      return this.dropboxService.downloadFile(fileName);
    }).then(moviesFromFile => {
      // parse them
      let movieList = Movie.fromJson(moviesFromFile);
      if (idToRemove.length > 0) {
        // remove given movies
        idToRemove.forEach((id: number) => movieList = movieList.filter((film: Movie) => film.id !== id));
        tempMovieList = movieList;
        // repplace file with new movie array
        return this.dropboxService.uploadFile(Movie.moviesToBlob(movieList), fileName);
      } else {
        return undefined;
      }
    }).then((res: any) => {
      console.log(res);
      if (res) {
        // if ok, emit new array and toast
        this.myMovies$.next(tempMovieList);
        this.toast.open(Level.success, 'toast.movies_removed', { size: idToRemove.length });
      }
      return true;
    }).catch((err) => {
      this.serviceUtils.handlePromiseError(err, this.toast);
      return false;
    });
  }

  /**
   * Replace the movies contains in the given file by the given movies.
   * @param  {Movie[]} moviesToReplace the movies replacing
   * @returns void
   */
  replaceMovies(moviesToReplace: Movie[]): Promise<boolean> {
    let tempMovieList = [];
    let fileName;
    let mapped = moviesToReplace;
    if (moviesToReplace.every(m => m.translation === undefined)) {
      mapped = MyMoviesService.formatMovies(moviesToReplace);
    }
    return this.getFileName().then((file: string) => {
      fileName = file;
      return this.dropboxService.downloadFile(fileName);
    }).then(file => {
      let movieList = Movie.fromJson(file);
      // Keeps added and tags fields from being replaced
      const idList = movieList.map(m => m.id);
      mapped.forEach(movie => {
        if (idList.includes(movie.id)) {
          movie.added = movieList.find(m => m.id === movie.id).added;
        }
      });
      // Removes from saved list movies to replaced
      movieList = movieList.filter((m: Movie) => !mapped.map((movie: Movie) => movie.id).includes(m.id)
        || !mapped.map((movie: Movie) => movie.lang_version).includes(m.lang_version));
      // Push in saved list new movies
      mapped.forEach((movie: Movie) => movieList.push(movie));
      movieList.sort(Utils.compareObject);
      tempMovieList = movieList;
      return this.dropboxService.uploadFile(Movie.moviesToBlob(movieList), fileName);
    }).then((res: any) => {
      console.log(res);
      this.myMovies$.next(tempMovieList);
      this.toast.open(Level.success, 'toast.movies_updated', { size: mapped.length });
      return true;
    }).catch((err) => {
      this.serviceUtils.handleError(err, this.toast);
      return false;
    });
  }
}
