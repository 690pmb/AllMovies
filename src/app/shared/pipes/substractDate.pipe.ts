import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DateTime} from 'luxon';

@Pipe({name: 'substractDate'})
export class SubstractDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(birthday: string, deathday?: string): string {
    if (!birthday) {
      return '';
    }
    const birth = DateTime.fromISO(birthday);
    const end = deathday ? DateTime.fromISO(deathday) : DateTime.now();
    return end
      .diff(birth, ['years', 'months', 'days'])
      .set({days: Math.floor(end.diff(birth, 'days').days % 30)}) // to have full day, no decimal
      .reconfigure({locale: this.translate.currentLang})
      .toHuman();
  }
}
