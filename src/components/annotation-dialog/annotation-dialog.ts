import { ChangeDetectionStrategy, Component, computed, effect, input, output, } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAnnotation } from '../../services';
import { Button } from '../button/button';
import { Toolbar } from '../toolbar/toolbar';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-annotation-dialog',
  imports: [ReactiveFormsModule, Toolbar, Button],
  template: `
    <form [formGroup]="annotationForm" (ngSubmit)="createAnnotation()">
      <div class="annotation-dialog">
        <h3><strong>{{ dialogTitle() }}</strong></h3>
        <fieldset>
          <label for="annotation-color" class="color-field">
            <span>{{ dict['DIALOG_ANNOTATION_COLOR_LABEL'] }}</span>
            <input
              formControlName="color"
              id="annotation-color"
              type="color"
              list="annotation-color-presets"
            />
            <datalist id="annotation-color-presets">
              <option value="#fff59d"></option>
              <option value="#c8e6c9"></option>
              <option value="#b3e5fc"></option>
              <option value="#f8bbd0"></option>
              <option value="#e1bee7"></option>
              <option value="#ffe0b2"></option>
            </datalist>
          </label>
          <textarea
            formControlName="text"
            id="annotation-text"
            placeholder="{{ dict['DIALOG_ANNOTATION_PLACEHOLDER'] }}"
            rows="4"
            cols="50"
          ></textarea>
        </fieldset>
        <app-toolbar>
          <div>
            @if (isEditMode() && onDeleteAnnotation()) {
            <app-button
              title="{{ dict['BTN_DELETE'] }}"
              theme="dark"
              type="button"
              (clickAction)="deleteAnnotation()"
            />
            }
          </div>
          <div class="actions">
            <app-button
              title="{{ dict['BTN_CANCEL'] }}"
              theme="light"
              type="button"
              (clickAction)="closeDialog()"
            />
            <app-button [title]="submitTitle()"/>
          </div>
        </app-toolbar>
      </div>
    </form>
  `,
  styleUrl: './annotation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationDialog {
  readonly dict = dict;
  readonly annotation = input.required<IAnnotation>();
  readonly onSaveAnnotation = input.required<(a: IAnnotation) => Promise<void> | void>();
  readonly onDeleteAnnotation = input<(() => Promise<void> | void) | undefined>(undefined);
  readonly onCloseDialog = input<() => void>(() => {
  });
  readonly okEvent = output<void>();
  readonly cancelEvent = output<void>();

  readonly isEditMode = computed(() => Boolean(this.annotation().text?.trim()));
  readonly dialogTitle = computed(() =>
    this.isEditMode() ? dict['DIALOG_ANNOTATION_EDIT'] : dict['DIALOG_ANNOTATION_CREATE']
  );
  readonly submitTitle = computed(() =>
    this.isEditMode() ? dict['BTN_SAVE'] : dict['BTN_CREATE']
  );

  readonly annotationForm = new FormGroup({
    text: new FormControl('', [Validators.required, Validators.maxLength(dict['ANNOTATION_MAX_LENGTH'])]),
    color: new FormControl(dict['ANNOTATION_COLOR'], { nonNullable: true }),
  });

  constructor () {
    effect(() => {
      const current = this.annotation();
      this.annotationForm.patchValue({
        text: current.text || '',
        color: current.color || dict['ANNOTATION_COLOR'],
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
      color: this.annotationForm.get('color')?.value ?? dict['ANNOTATION_COLOR'],
    };

    await this.onSaveAnnotation()(updated);
    this.okEvent.emit();
  }

  async deleteAnnotation (): Promise<void> {
    const deleteFn = this.onDeleteAnnotation();
    if (!deleteFn) {
      return;
    }

    await deleteFn();
    this.okEvent.emit();
  }

  closeDialog (): void {
    this.onCloseDialog()();
    this.cancelEvent.emit();
  }
}
