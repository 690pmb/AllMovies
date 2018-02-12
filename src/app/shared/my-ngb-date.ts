import { Component, Injectable, LOCALE_ID } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}

function isNumber(value: any): boolean {
  return !isNaN(toInteger(value));
}

function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

@Injectable()
export class MyNgbDate extends NgbDateParserFormatter {
  constructor(private datePipe: DatePipe) {
    super();
  }

  parse(value: string): NgbDateStruct {
    if (value) {
      const dateParts = value.trim().split('/');
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { year: toInteger(dateParts[0]), month: null, day: null };
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return { year: toInteger(dateParts[1]), month: toInteger(dateParts[0]), day: null };
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return { year: toInteger(dateParts[2]), month: toInteger(dateParts[1]), day: toInteger(dateParts[0]) };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    let stringDate = '';
    if (date) {
      stringDate += date.year + '-';
      stringDate += isNumber(date.month) ? padNumber(date.month) + '-' : '';
      stringDate += isNumber(date.day) ? padNumber(date.day) : '';
    }
    return stringDate;
  }

  dateToString(date: Date, format: string): string {
    return this.datePipe.transform(date, format);
  }

  ngbDateToDate(date: NgbDateStruct): Date {
    const dateS = this.format(date);
    return new Date(dateS + 'T00:00:00');
  }

  addDays(date: Date, nbDays: number): Date {
    date.setDate(date.getDate() + nbDays);
    return date;
  }

  getPreviousMonday(date: NgbDateStruct): Date {
    const dateD = this.ngbDateToDate(date);
    dateD.setDate(dateD.getDate() - (dateD.getDay() + 6) % 7);
    return dateD;
  }

  addNgbDays(date: NgbDateStruct, days: number): Date {
    const dateD = this.ngbDateToDate(date);
    dateD.setDate(dateD.getDate() + days);
    return dateD;
  }

  getFollowingSunday(date: NgbDateStruct): Date {
    const dateD = this.ngbDateToDate(date);
    dateD.setDate(dateD.getDate() - (dateD.getDay() + 6) % 7);
    return this.addDays(dateD, 6);
  }

  dateToNgbDateStruct(date: Date): NgbDateStruct {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }
}