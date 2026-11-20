import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ArticleService, IArticle } from '../../services';
import { List } from './list';
import { dict } from '../../dictionary';

describe('List', () => {
  let component: List;
  let fixture: ComponentFixture<List>;

  const mockArticles: IArticle[] = [
    { id: '1', title: 'Первая статья', text: '<p>Текст 1</p>', timestamp: 200 },
    { id: '2', title: 'Вторая статья', text: '<p>Текст 2</p>', timestamp: 100 },
  ];

  const articleServiceMock = {
    getList: vi.fn(() => of(mockArticles)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [
        provideRouter([]),
        {
          provide: ArticleService,
          useValue: articleServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('должен загружать и отображать список статей', () => {
    const headings = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('h2')
    ).map((el) => el.textContent?.trim());

    expect(articleServiceMock.getList).toHaveBeenCalledTimes(1);
    expect(component.initialized()).toBe(true);
    expect(headings).toEqual(['Первая статья', 'Вторая статья']);
  });

  it('должен отображать заглушку, если статей ещё нет', async () => {
    articleServiceMock.getList.mockReturnValueOnce(of([]));

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    await fixture.whenStable();

    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement | null;
    expect(heading?.textContent?.trim()).toBe(dict['LIST_EMPTY_TITLE']);
  });
});
