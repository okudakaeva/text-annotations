import { TestBed } from '@angular/core/testing';
import { AnnotationsRenderer } from './annotations-renderer';
import { IAnnotationList } from './annotations.service';
import { dict } from '../dictionary';

describe('AnnotationsRenderer', () => {
  let renderer: AnnotationsRenderer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    renderer = TestBed.inject(AnnotationsRenderer);
    document.body.innerHTML = '';
  });

  afterEach(() => {
    renderer.ngOnDestroy();
    document.body.innerHTML = '';
  });

  it('should apply background color to matching mark elements', () => {
    document.body.innerHTML = `
      <p>Текст с <${ dict['MARK_TAG'] } ${ dict['ATTR_ANNOTATION_ID'] }="ann-1">первой</${ dict['MARK_TAG'] }> и <${ dict['MARK_TAG'] } ${ dict['ATTR_ANNOTATION_ID'] }="ann-2">второй</${ dict['MARK_TAG'] }> меткой</p>
    `;

    const annotations: IAnnotationList = new Map([
      ['ann-1', { id: 'ann-1', text: 'Заметка 1', color: 'rgb(255, 255, 0)' }],
      ['ann-2', { id: 'ann-2', text: 'Заметка 2', color: 'rgb(144, 238, 144)' }],
    ]);

    renderer.initData(annotations);

    const mark1 = document.querySelector<HTMLElement>(`[${ dict['ATTR_ANNOTATION_ID'] }="ann-1"]`)!;
    const mark2 = document.querySelector<HTMLElement>(`[${ dict['ATTR_ANNOTATION_ID'] }="ann-2"]`)!;

    expect(mark1.style.backgroundColor).toBe('rgb(255, 255, 0)');
    expect(mark2.style.backgroundColor).toBe('rgb(144, 238, 144)');
  });

  it('should keep observer active after empty annotations map and style dynamically added marks', async () => {
    renderer.initData(new Map());

    const annotations: IAnnotationList = new Map([
      ['ann-dynamic', { id: 'ann-dynamic', text: 'Динамическая', color: 'rgb(255, 192, 203)' }],
    ]);
    renderer.initData(annotations);

    const mark = document.createElement(dict['MARK_TAG']);
    mark.setAttribute(dict['ATTR_ANNOTATION_ID'], 'ann-dynamic');
    mark.textContent = 'Новый фрагмент';
    document.body.appendChild(mark);

    await Promise.resolve();
    await Promise.resolve();

    expect(mark.style.backgroundColor).toBe('rgb(255, 192, 203)');
  });
});
