import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../button/button';
import { IAnnotation } from '../../services';

const DEFAULT_COLOR = '#ffffe0';

@Component({
  selector: 'app-annotation-dialog',
  imports: [ReactiveFormsModule, Toolbar, Button],
  template: `
    <form [formGroup]="annotationForm" (ngSubmit)="createAnnotation()">
      <div class="annotation-dialog">
        <h3>Создание аннотации</h3>
        <textarea
          formControlName="text"
          id="annotation-text"
          placeholder="Введите текст аннотации..."
          rows="4"
          cols="30"
        ></textarea>
        <label for="annotation-color">Выберите цвет:&nbsp;</label>
        <input
          formControlName="color"
          id="annotation-color"
          type="color"
          list="annotation-color-presets"
        />
        <datalist id="annotation-color-presets">
          <option value="#ffffe0"></option>
          <option value="#fff59d"></option>
          <option value="#c8e6c9"></option>
          <option value="#b3e5fc"></option>
          <option value="#f8bbd0"></option>
          <option value="#e1bee7"></option>
          <option value="#ffe0b2"></option>
        </datalist>
        <app-toolbar>
          <div></div>
          <div class="actions">
            <app-button
              title="Отмена"
              theme="light"
              type="button"
              (clickAction)="closeDialog()"
            />
            <app-button title="Создать"/>
          </div>
        </app-toolbar>
      </div>
    </form>
  `,
  styleUrl: './annotation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationDialog {
  readonly annotation = input.required<IAnnotation>();
  readonly onSaveAnnotation = input.required<(a: IAnnotation) => void>();
  readonly onCloseDialog = input<() => void>(() => {
  });
  readonly okEvent = output<void>();
  readonly cancelEvent = output<void>();

  readonly annotationForm = new FormGroup({
    text: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    color: new FormControl(DEFAULT_COLOR, { nonNullable: true }),
  });

  constructor () {
    effect(() => {
      const current = this.annotation();
      this.annotationForm.patchValue({
        text: current.text || '',
        color: current.color || DEFAULT_COLOR,
      });
    });
  }

  async createAnnotation (): Promise<void> {
    if (this.annotationForm.invalid) {
      this.annotationForm.markAllAsTouched();
      return;
    }

    const updated: IAnnotation = {
      ...this.annotation(),
      text: this.annotationForm.get('text')?.value?.trim() ?? '',
      color: this.annotationForm.get('color')?.value ?? DEFAULT_COLOR,
    };

    await this.onSaveAnnotation()(updated);
    this.okEvent.emit();
  }

  closeDialog (): void {
    this.onCloseDialog()();
    this.cancelEvent.emit();
  }
}
