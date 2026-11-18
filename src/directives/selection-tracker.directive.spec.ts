import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionTracker } from './selection-tracker.directive';

@Component({
  imports: [SelectionTracker],
  template: `
    <div id="outside">Внешний заголовок страницы</div>
    <article id="editor" appSelectionTracker (selectionDetected)="lastRange = $event">
      <p>Первый абзац для выделения текста в редакторе.</p>
    </article>
  `,
})
class TestHostComponent {
  lastRange: Range | null | undefined = undefined;
}

describe('SelectionTracker', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let editorEl: HTMLElement;
  let outsideEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();

    editorEl = fixture.nativeElement.querySelector('#editor')!;
    outsideEl = fixture.nativeElement.querySelector('#outside')!;
    window.getSelection()?.removeAllRanges();
  });

  afterEach(() => {
    window.getSelection()?.removeAllRanges();
  });

  function selectTextInNode(node: Node, startOffset = 0, endOffset = 6): Range {
    const textNode = node.firstChild!;
    const range = document.createRange();
    range.setStart(textNode, startOffset);
    range.setEnd(textNode, endOffset);

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  }

  it('should emit Range on mouseup when text is selected inside tracked element', () => {
    const paragraph = editorEl.querySelector('p')!;
    selectTextInNode(paragraph, 0, 6);

    editorEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(host.lastRange).toBeInstanceOf(Range);
    expect(host.lastRange?.toString()).toBe('Первый');
  });

  it('should emit Range on keyup to support keyboard text selection', () => {
    const paragraph = editorEl.querySelector('p')!;
    selectTextInNode(paragraph, 7, 12);

    editorEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));

    expect(host.lastRange).toBeInstanceOf(Range);
    expect(host.lastRange?.toString()).toBe('абзац');
  });

  it('should emit null when selection is empty or whitespace-only', () => {
    const paragraph = editorEl.querySelector('p')!;
    selectTextInNode(paragraph, 6, 7);

    editorEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(host.lastRange).toBeNull();
  });

  it('should emit null when selection occurs outside the tracked element', () => {
    selectTextInNode(outsideEl, 0, 7);

    editorEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(host.lastRange).toBeNull();
  });

  it('should reset selection to null on mousedown and re-emit on window scroll', async () => {
    const paragraph = editorEl.querySelector('p')!;
    selectTextInNode(paragraph, 0, 6);

    editorEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(host.lastRange).toBeNull();

    window.dispatchEvent(new Event('scroll'));
    await Promise.resolve();

    expect(host.lastRange).toBeInstanceOf(Range);
    expect(host.lastRange?.toString()).toBe('Первый');
  });

  it('should abort global listeners on destroy without throwing', async () => {
    const paragraph = editorEl.querySelector('p')!;
    selectTextInNode(paragraph, 0, 6);

    fixture.destroy();
    host.lastRange = undefined;

    window.dispatchEvent(new Event('scroll'));
    document.dispatchEvent(new Event('selectionchange'));
    await Promise.resolve();

    expect(host.lastRange).toBeUndefined();
  });
});
