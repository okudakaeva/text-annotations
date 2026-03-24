import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreloaderService {
  isShown = signal(false);

  show () {
    this.isShown.set(true);
  }

  hide () {
    this.isShown.set(false);
  }
}
