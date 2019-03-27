import { faSave } from '@fortawesome/free-regular-svg-icons';
import { faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import { Component, OnChanges, Input, SimpleChanges, OnDestroy, OnInit } from '@angular/core';

import { Movie } from './../../../model/movie';
import { Tag, TagMovie } from './../../../model/tag';
import { MyMoviesService } from '../../service/my-movies.service';
import { Level } from './../../../model/model';
import { AuthService } from './../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { MyTagsService } from '../../service/my-tags.service';

@Component({
  selector: 'app-list-tags',
  templateUrl: './list-tags.component.html',
  styleUrls: ['./list-tags.component.scss']
})
export class ListTagsComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  tags: Tag[] = [];
  @Input()
  movie: Movie;
  allMovies: Movie[];
  tagsDisplayed: Tag[];
  tagsToSave: Tag[];
  editing = false;
  subs = [];

  faRemove = faTimes;
  faEdit = faPen;
  faSave = faSave;

  constructor(
    private auth: AuthService,
    private myMoviesService: MyMoviesService,
    private myTagsService: MyTagsService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.subs.push(this.myMoviesService.myMovies$.subscribe(movies => {
      this.allMovies = movies;
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.tags = changes.tags ? changes.tags.currentValue.map(tag => Tag.clone(<Tag>tag)) : this.tags;
    this.movie = changes.movie ? changes.movie.currentValue : this.movie;
    this.editing = false;
    this.tagsDisplayed = this.getTags();
    this.tagsToSave = this.getTags();
  }

  getTags(): Tag[] {
    return this.tags.map(tag => Tag.clone(<Tag>tag));
  }

  add(tag: Tag): void {
    if (this.tags.map(t => t.id).includes(tag.id)) {
      this.toast.open(Level.warning, 'toast.already_added');
    } else {
      tag.movies.push(TagMovie.fromMovie(this.allMovies.filter(m => m.id === this.movie.id)));
      this.tagsDisplayed.push(tag);
      this.tagsToSave.push(tag);
    }
  }

  remove(tag: Tag): void {
    this.tagsToSave.find(t => t.id === tag.id).movies = tag.movies.filter(m => m.id !== this.movie.id);
    this.tagsDisplayed = this.tagsDisplayed.filter(t => t.id !== tag.id);
  }

  save(): void {
    this.editing = false;
    this.movie.tags = this.tagsToSave.map(t => t.id);
    this.auth.getFileName()
      .then(file => this.myMoviesService.replaceMovies([this.movie], file))
      .then(() => this.myTagsService.replaceTags(this.tagsToSave));
  }

  cancel(): void {
    this.editing = false;
    this.tagsDisplayed = this.getTags();
    this.tagsToSave = this.getTags();
  }

  ngOnDestroy(): void {
    this.subs.forEach((subscription) => subscription.unsubscribe());
  }
}
