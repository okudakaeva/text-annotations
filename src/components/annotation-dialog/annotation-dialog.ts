import { ChangeDetectionStrategy, Component, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../button/button';
import { IAnnotation } from '../../services';

// © Кудакаеава Оксана Александровна, Россия, Ульяновск. Все права защищены. 2026
// Код создан для тестового задания UNADESK, позиция [Frontend Senior Developer (Angular) ](https://hh.ru/vacancy/131351215).
// Не предназначен для коммерческого использования без письменного согласия автора. Использование, копирование и модификация без письменного согласия автора запрещены.
// **Уникальные решения:**
// * Система аннотаций к тексту — собственная разработка.
// * Кастомные UI‑компоненты (реализованы вместо PrimeNg по требованию задания).

const defaultColor = '#ffffe0';
@Component({
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
        <input formControlName="color" id="annotation-color" type="color" value="${defaultColor}">
        <app-toolbar>
          <div></div>
          <div class="actions">
            <app-button
              title="Отмена"
              theme="light"
              type="button"
              (clickAction)="closeDialog()"/>
            <app-button title="Создать"/>
          </div>
        </app-toolbar>
      </div>
  </form>
  `,
  styleUrl: './annotation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationDialog implements OnChanges {
  annotation = input.required<IAnnotation>();
  onSaveAnnotation = input.required<(a: IAnnotation) => void>();
  onCloseDialog = input<() => void>(() => {});
  okEvent = output<void>();
  cancelEvent = output<void>();
  annotationForm = new FormGroup({
    text: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    color: new FormControl(defaultColor),
  });

  ngOnChanges (changes: SimpleChanges): void {
    if (changes['annotation'] && this.annotation()) {
      queueMicrotask(() => {
        this.annotationForm.patchValue({
          text: this.annotation()!.text || '',
          color: this.annotation()!.color || '#ffffe0',
        });
      });
    }
  }

  createAnnotation () {
    if (this.annotationForm.valid) {
      const annotation = {
        ...this.annotation() || {},
        text: this.annotationForm.get('text')?.value || '',
        color: this.annotationForm.get('color')?.value || defaultColor,
      };
      this.onSaveAnnotation()(annotation);
      this.okEvent.emit();
    }
  }

  closeDialog () {
    this.onCloseDialog()();
    this.cancelEvent.emit();
  }
}
