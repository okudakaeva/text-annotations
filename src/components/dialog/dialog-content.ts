import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  inject,
  Injector,
  input,
  inputBinding,
  OnDestroy,
  output,
  outputBinding,
  Type,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'app-dialog-content',
  styleUrl: './dialog.scss',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContent implements AfterViewInit, OnDestroy {
  readonly dynamicContent = input.required<Type<unknown>>();
  readonly bindings = input<Record<string, unknown>>();

  private readonly viewContainer = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private compRef: ComponentRef<unknown> | null = null;

  readonly okEvent = output<void>();
  readonly cancelEvent = output<void>();

  ngAfterViewInit (): void {
    queueMicrotask(() => this.loadContent());
  }

  loadContent (): void {
    const data = this.bindings() ?? {};
    const dynamicBindings = Object.keys(data).map((key) =>
      inputBinding(key, () => data[key])
    );

    this.compRef = this.viewContainer.createComponent(this.dynamicContent(), {
      injector: this.injector,
      bindings: [
        ...dynamicBindings,
        outputBinding('okEvent', () => this.okEvent.emit()),
        outputBinding('cancelEvent', () => this.cancelEvent.emit()),
      ],
    });
    this.compRef.changeDetectorRef.detectChanges();
  }

  ngOnDestroy (): void {
    this.compRef?.destroy();
    this.compRef = null;
  }
}
