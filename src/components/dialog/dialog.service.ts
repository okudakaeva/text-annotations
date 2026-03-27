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
          this.destroyDialog();
        }),
      ],
    });


    this.appRef.attachView(this.dialogRef.hostView);
    document.body.appendChild(this.hostRef);

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
}
