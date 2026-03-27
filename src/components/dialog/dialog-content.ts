import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  inject,
  Injector, input,
  inputBinding,
  OnDestroy, output,
  outputBinding,
  Type, viewChild,
  ViewContainerRef
} from '@angular/core';

@Component({
  selector: 'app-dialog-content',
  styleUrl: './dialog.scss',
  template: `
    <div #dialogContent></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContent implements AfterViewInit, OnDestroy {
  dynamicContent = input.required<Type<any>>();
  bindings = input<{ [key: string]: any }>();
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly dialogContent = viewChild<ElementRef<HTMLElement>>('dialogContent');
  compRef: ComponentRef<Type<any>> | null = null;
  okEvent = output<void>();
  cancelEvent = output<void>();

  ngAfterViewInit (): void {
    queueMicrotask(() => this.loadContent());
  }

  loadContent () {
    const data = this.bindings() || {};
    const bindings = Object.keys(data).map((key) => {
      return inputBinding(key, () => data[key]);
    });
    this.compRef = this.viewContainer.createComponent(this.dynamicContent(), {
      injector: this.injector,
      bindings: [
        ...bindings,
        outputBinding('okEvent', () => this.okEvent.emit()),
        outputBinding('cancelEvent', () => this.cancelEvent.emit())
      ]
    });
    this.compRef.changeDetectorRef.detectChanges();
  }

  ngOnDestroy () {
    if (this.compRef) {
      this.compRef.destroy();
    }
  }
}
