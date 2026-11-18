import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ArticleService, IArticle } from '../services';
import { ArticleReadonlySync } from './article-readonly-sync';

@Component({
  selector: 'app-test-host',
  imports: [ArticleReadonlySync],
  template: `
    <div id="content" [appArticleReadonlySync]="article">
      <p>Исходный текст статьи</p>
    </div>
  `,
})
class TestHostComponent {
  article: IArticle = {
    id: 'art-1',
    title: 'Заголовок',
    text: '<p>Исходный текст статьи</p>',
    timestamp: 1000,
  };
}

describe('ArticleReadonlySync', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  const articleServiceMock = {
    createOrUpdate: vi.fn((updated: IArticle) => of(updated)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: ArticleService, useValue: articleServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
  });

  it('не должен сохранять статью при добавлении чернового <mark data-no-tooltip="true">', async () => {
    const contentEl = fixture.nativeElement.querySelector('#content') as HTMLElement;
    contentEl.innerHTML = '<p><mark data-annotation-id="a1" data-no-tooltip="true">Исходный</mark> текст статьи</p>';

    await Promise.resolve();
    expect(articleServiceMock.createOrUpdate).not.toHaveBeenCalled();
  });

  it('должен сохранять очищенный HTML после подтверждения аннотации и удалять служебные span', async () => {
    const contentEl = fixture.nativeElement.querySelector('#content') as HTMLElement;
    contentEl.innerHTML =
      '<p><mark data-annotation-id="a1" data-no-tooltip="true">Исходный<span data-has-tooltip="true"></span></mark> текст статьи</p>';
    await Promise.resolve();

    const mark = contentEl.querySelector('mark')!;
    mark.removeAttribute('data-no-tooltip');
    await Promise.resolve();

    expect(articleServiceMock.createOrUpdate).toHaveBeenCalledTimes(1);
    expect(articleServiceMock.createOrUpdate).toHaveBeenCalledWith({
      id: 'art-1',
      title: 'Заголовок',
      text: '<p><mark data-annotation-id="a1">Исходный</mark> текст статьи</p>',
      timestamp: 1000,
    });
  });

  it('не должен реагировать на добавление или удаление span[data-has-tooltip]', async () => {
    const contentEl = fixture.nativeElement.querySelector('#content') as HTMLElement;
    const tooltipIcon = document.createElement('span');
    tooltipIcon.setAttribute('data-has-tooltip', 'true');

    contentEl.querySelector('p')!.appendChild(tooltipIcon);
    await Promise.resolve();

    tooltipIcon.remove();
    await Promise.resolve();

    expect(articleServiceMock.createOrUpdate).not.toHaveBeenCalled();
  });
});
