import { inject, Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnotationsSidebarService {
  private readonly router = inject(Router);
  readonly isOpen = signal(false);

  constructor () {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed()
      )
      .subscribe(() => this.close());
  }

  toggle (): void {
    this.isOpen.update((open) => !open);
  }

  open (): void {
    this.isOpen.set(true);
  }

  close (): void {
    this.isOpen.set(false);
  }
}
