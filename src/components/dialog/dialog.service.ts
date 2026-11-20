import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  inputBinding,
  outputBinding,
  Type,
} from '@angular/core';
import { Dialog } from './dialog';
import { dict } from '../../dictionary';

export interface DialogOpenOptions {
  bindings?: Record<string, unknown>;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogRef: ComponentRef<Dialog> | null = null;
  private hostRef: HTMLElement | null = null;
  private scrollPosition = 0;
  private isScrollLocked = false;

  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  open<T> (
    component: Type<T>,
    options: DialogOpenOptions,
  ): ComponentRef<Dialog> {
    if (this.dialogRef) {
      this.close();
    }

    this.hostRef = document.createElement(dict['DIALOG_HOST']);
    this.dialogRef = createComponent(Dialog, {
      environmentInjector: this.injector,
      hostElement: this.hostRef,
      bindings: [
        inputBinding('dynamicContent', () => component),
        inputBinding('bindings', () => options.bindings),
        outputBinding('closed', () => {
          options.onCancel?.();
          this.close();
        }),
      ],
    });

    this.appRef.attachView(this.dialogRef.hostView);
    document.body.appendChild(this.hostRef);
    this.lockScroll();

    return this.dialogRef;
  }

  close (): void {
    this.unlockScroll();
    this.destroyDialog();
  }

  private destroyDialog (): void {
    if (this.dialogRef && this.hostRef) {
      this.hostRef.remove();
      this.appRef.detachView(this.dialogRef.hostView);
      this.dialogRef.destroy();
    }
    this.dialogRef = null;
    this.hostRef = null;
  }

  private lockScroll (): void {
    if (this.isScrollLocked) {
      return;
    }
    this.isScrollLocked = true;
    this.scrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${ this.scrollPosition }px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }

  private unlockScroll (): void {
    if (!this.isScrollLocked) {
      return;
    }
    this.isScrollLocked = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, this.scrollPosition);
  }
}
