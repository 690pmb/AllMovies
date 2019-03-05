import { Movie } from './movie';

export class Person {
  constructor(public id?: number, public name?: string, public gender?: number, public birthday?: string,
    public deathday?: string, public profile?: string, public thumbnail?: string, public biography?: string,
    public adult?: boolean, public birthPlace?: string, public images?: string[], public asActor?: Movie[],
    public asDirector?: Movie[], public asProducer?: Movie[], public asCompositors?: Movie[], public asScreenplay?: Movie[],
    public asNovel?: Movie[], public knownFor?: string, public images_thumb?: string[], public popularity?: number, public imdb_id?: string) {
  }
}
