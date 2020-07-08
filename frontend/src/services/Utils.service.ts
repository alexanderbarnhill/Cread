import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class Utils {

  public uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxx'
      .replace(/[xy]/g, (c: string) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      })
  }
}
