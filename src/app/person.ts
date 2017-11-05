export class Person {
    id: number;
	name: string;
	birthday: string;
	deathday: string;
	profile: string;
	thumbnail: string;
	biography: string;
    constructor(id: number, name: string, birthday: string, deathday: string, profile: string, thumbnail: string, biography: string) {
        this.id = id;
        this.name = name;
        this.birthday = birthday;
        this.deathday = deathday;
        this.profile = profile;
        this.thumbnail = thumbnail;
        this.biography = biography;
    }
}