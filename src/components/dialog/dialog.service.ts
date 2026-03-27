import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  Type,
  inject,
  EnvironmentInjector,
  createComponent,
  outputBinding,
  inputBinding
} from '@angular/core';
import { Dialog } from './dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRef: ComponentRef<Dialog> | null = null;
  private hostRef: HTMLElement | null = null;
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  open<T> (component: Type<any>, bindings?: any): ComponentRef<Dialog> {
    this.hostRef = document.createElement('app-dialog-host');
    this.dialogRef = createComponent(Dialog, {
      environmentInjector: this.injector,
      hostElement: this.hostRef,
      bindings: [
        inputBinding('dynamicContent', () => component),
        inputBinding('bindings', () => bindings),
        outputBinding('closed', () => {
          this.unlockScroll();
          this.destroyDialog();
        }),
      ],
    });


    this.appRef.attachView(this.dialogRef.hostView);
    document.body.appendChild(this.hostRef);
    this.lockScroll();

    return this.dialogRef;
  }

  private destroyDialog (): void {
    if (this.dialogRef && this.hostRef) {
      document.body.removeChild(this.hostRef);
      this.appRef.detachView(this.dialogRef.hostView);
      this.dialogRef.destroy();
    }
    this.dialogRef = null;
    this.hostRef = null;
  }

  private scrollPosition = 0;

  private lockScroll(): void {
    this.scrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }

  private unlockScroll(): void {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, this.scrollPosition);
  }
}
