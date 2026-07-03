import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';

import {Utils} from './../../shared/utils';
import {SearchService} from '../../service/search.service';
import {Network} from './../../model/model';
import {MockService} from '../../service/mock.service';

@Injectable({providedIn: 'root'})
export class NetworkService implements SearchService<Network> {
  networks: Network[] = [];

  constructor(private mockService: MockService<Network>) {}

  getAll(): Observable<Network[]> {
    if (this.networks && this.networks.length > 0) {
      return of(this.networks);
    }
    return this.mockService.getAll('networks.json').pipe(
      map(networks => {
        this.networks = networks.sort((a, b) =>
          Utils.compare(a.name, b.name, true)
        );
        return this.networks;
      })
    );
  }

  search(term: string): Observable<Network[]> {
    return this.getAll().pipe(
      map(networks =>
        networks
          .filter(net => net.name.toLowerCase().startsWith(term.toLowerCase()))
          .slice(0, 10)
      )
    );
  }

  byId(id: number): Observable<Network> {
    return this.getAll().pipe(
      map(networks => networks.find(net => net.id === id))
    );
  }
}
