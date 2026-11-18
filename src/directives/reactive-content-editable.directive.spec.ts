import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ReactiveContentEditable } from './reactive-content-editable.directive';

@Component({
  imports: [ReactiveFormsModule, ReactiveContentEditable],
  template: `<div contenteditable="true" [formControl]="control"></div>`,
})
class TestHostComponent {
  readonly control = new FormControl('');
}

describe('ReactiveContentEditable', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let editorEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
    editorEl = fixture.nativeElement.querySelector('[contenteditable]')!;
  });

  it('should sanitize HTML on writeValue and not emit redundant valueChanges', async () => {
    const emissions: (string | null)[] = [];
    host.control.valueChanges.subscribe((v) => emissions.push(v));

    host.control.setValue(
      '<p>Привет, <mark data-annotation-id="a1" onclick="alert(1)">мир</mark>!</p><script>evil()</script>'
    );
    await Promise.resolve();

    expect(editorEl.innerHTML).toContain('<mark data-annotation-id="a1">мир</mark>');
    expect(editorEl.innerHTML).not.toContain('onclick');
    expect(editorEl.innerHTML).not.toContain('<script>');
    expect(emissions.length).toBe(1);
  });

  it('should update FormControl value on user input without duplicate emissions', () => {
    const emissions: (string | null)[] = [];
    host.control.valueChanges.subscribe((v) => emissions.push(v));

    editorEl.innerHTML = '<p>Новый текст</p>';
    editorEl.dispatchEvent(new Event('input'));
    editorEl.dispatchEvent(new Event('input'));

    expect(host.control.value).toBe('<p>Новый текст</p>');
    expect(emissions).toEqual(['<p>Новый текст</p>']);
  });

  it('should mark control as touched on blur', () => {
    expect(host.control.touched).toBe(false);

    editorEl.dispatchEvent(new Event('blur'));

    expect(host.control.touched).toBe(true);
  });

  it('should toggle contenteditable attribute when control is disabled/enabled', () => {
    host.control.disable();
    expect(editorEl.getAttribute('contenteditable')).toBe('false');

    host.control.enable();
    expect(editorEl.getAttribute('contenteditable')).toBe('true');
  });

  it('should ignore technical tooltip span mutations in MutationObserver', async () => {
    host.control.setValue('<p><mark data-annotation-id="a1">Фрагмент</mark></p>');
    await Promise.resolve();

    const emissions: (string | null)[] = [];
    host.control.valueChanges.subscribe((v) => emissions.push(v));

    const mark = editorEl.querySelector('mark')!;
    const tooltipIcon = document.createElement('span');
    tooltipIcon.setAttribute('data-has-tooltip', 'true');
    mark.appendChild(tooltipIcon);

    await Promise.resolve();
    await Promise.resolve();

    expect(emissions).toEqual([]);
  });

  it('should strip HTML on paste and preserve line breaks as <br>', () => {
    editorEl.textContent = '';
    const range = document.createRange();
    range.selectNodeContents(editorEl);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        getData: (type: string) =>
          type === 'text/plain' ? 'Первая строка\nВторая строка' : '<b>HTML</b>',
      },
    });

    editorEl.dispatchEvent(pasteEvent);

    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(editorEl.innerHTML).toBe('Первая строка<br>Вторая строка');
    expect(host.control.value).toBe('Первая строка<br>Вторая строка');
  });
});
