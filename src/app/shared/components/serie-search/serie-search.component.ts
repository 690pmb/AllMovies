import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

import {Serie} from '../../../model/serie';
import {ImageSize} from '../../../model/model';
import {SerieService} from '../../service/serie.service';

@Component({
  selector: 'app-serie-search',
  templateUrl: './serie-search.component.html',
  styleUrls: ['./serie-search.component.scss'],
})
export class SerieSearchComponent implements OnInit {
  series!: Observable<Serie[]>;
  imageSize = ImageSize;
  getSerie: (term: string, lang: string) => Observable<Serie[]>;

  constructor(private serieService: SerieService) {}

  ngOnInit(): void {
    this.getSerie = (term: string, lang: string): Observable<Serie[]> =>
      this.serieService.search(term, lang);
  }
}
