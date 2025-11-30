import articleListReducer from './articleList';
import {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_LOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED
} from '../constants/actionTypes';

describe('articleList reducer', () => {
  test('returns initial state', () => {
    expect(articleListReducer(undefined, {})).toEqual({});
  });

  test('handles ARTICLE_FAVORITED', () => {
    const initialState = {
      articles: [
        { slug: 'article-1', favorited: false, favoritesCount: 5 },
        { slug: 'article-2', favorited: false, favoritesCount: 3 }
      ]
    };
    const action = {
      type: ARTICLE_FAVORITED,
      payload: {
        article: { slug: 'article-1', favorited: true, favoritesCount: 6 }
      }
    };
    const newState = articleListReducer(initialState, action);
    expect(newState.articles[0].favorited).toBe(true);
    expect(newState.articles[0].favoritesCount).toBe(6);
    expect(newState.articles[1].favorited).toBe(false);
  });

  test('handles ARTICLE_UNFAVORITED', () => {
    const initialState = {
      articles: [
        { slug: 'article-1', favorited: true, favoritesCount: 6 },
        { slug: 'article-2', favorited: false, favoritesCount: 3 }
      ]
    };
    const action = {
      type: ARTICLE_UNFAVORITED,
      payload: {
        article: { slug: 'article-1', favorited: false, favoritesCount: 5 }
      }
    };
    const newState = articleListReducer(initialState, action);
    expect(newState.articles[0].favorited).toBe(false);
    expect(newState.articles[0].favoritesCount).toBe(5);
  });

  test('handles SET_PAGE', () => {
    const initialState = { currentPage: 0 };
    const action = {
      type: SET_PAGE,
      payload: {
        articles: [{ slug: 'article-1' }, { slug: 'article-2' }],
        articlesCount: 20
      },
      page: 2
    };
    const newState = articleListReducer(initialState, action);
    expect(newState.articles).toHaveLength(2);
    expect(newState.articlesCount).toBe(20);
    expect(newState.currentPage).toBe(2);
  });

  test('handles APPLY_TAG_FILTER', () => {
    const initialState = { tab: 'feed', tag: null };
    const action = {
      type: APPLY_TAG_FILTER,
      payload: {
        articles: [{ slug: 'tagged-article' }],
        articlesCount: 5
      },
      pager: { pages: [1, 2] },
      tag: 'react'
    };
    const newState = articleListReducer(initialState, action);
    expect(newState.tag).toBe('react');
    expect(newState.tab).toBe(null);
    expect(newState.currentPage).toBe(0);
    expect(newState.articles).toHaveLength(1);
    expect(newState.articlesCount).toBe(5);
    expect(newState.pager).toEqual({ pages: [1, 2] });
  });

  test('handles HOME_PAGE_LOADED with valid payload', () => {
    const action = {
      type: HOME_PAGE_LOADED,
      payload: [
        { tags: ['react', 'javascript', 'testing'] },
        {
          articles: [{ slug: 'article-1' }, { slug: 'article-2' }],
          articlesCount: 25
        }
      ],
      pager: { pages: [1, 2, 3] },
      tab: 'all'
    };
    const newState = articleListReducer({}, action);
    expect(newState.tags).toEqual(['react', 'javascript', 'testing']);
    expect(newState.articles).toHaveLength(2);
    expect(newState.articlesCount).toBe(25);
    expect(newState.currentPage).toBe(0);
    expect(newState.tab).toBe('all');
    expect(newState.pager).toEqual({ pages: [1, 2, 3] });
  });

  test('handles HOME_PAGE_LOADED with null payload', () => {
    const action = {
      type: HOME_PAGE_LOADED,
      payload: null,
      pager: null,
      tab: 'all'
    };
    const newState = articleListReducer({}, action);
    expect(newState.tags).toEqual([]);
    expect(newState.articles).toEqual([]);
    expect(newState.articlesCount).toBe(0);
  });

  test('handles HOME_PAGE_UNLOADED', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      tags: ['react'],
      currentPage: 2
    };
    const action = { type: HOME_PAGE_UNLOADED };
    const newState = articleListReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('handles CHANGE_TAB', () => {
    const initialState = { tag: 'react', currentPage: 2 };
    const action = {
      type: CHANGE_TAB,
      payload: {
        articles: [{ slug: 'new-article' }],
        articlesCount: 10
      },
      pager: { pages: [1] },
      tab: 'feed'
    };
    const newState = articleListReducer(initialState, action);
    expect(newState.tab).toBe('feed');
    expect(newState.tag).toBe(null);
    expect(newState.currentPage).toBe(0);
    expect(newState.articles).toHaveLength(1);
    expect(newState.articlesCount).toBe(10);
  });

  test('handles PROFILE_PAGE_LOADED', () => {
    const action = {
      type: PROFILE_PAGE_LOADED,
      payload: [
        { profile: { username: 'testuser' } },
        {
          articles: [{ slug: 'user-article' }],
          articlesCount: 5
        }
      ],
      pager: { pages: [1] }
    };
    const newState = articleListReducer({}, action);
    expect(newState.articles).toHaveLength(1);
    expect(newState.articlesCount).toBe(5);
    expect(newState.currentPage).toBe(0);
    expect(newState.pager).toEqual({ pages: [1] });
  });

  test('handles PROFILE_FAVORITES_PAGE_LOADED', () => {
    const action = {
      type: PROFILE_FAVORITES_PAGE_LOADED,
      payload: [
        { profile: { username: 'testuser' } },
        {
          articles: [{ slug: 'favorited-article' }],
          articlesCount: 3
        }
      ],
      pager: { pages: [1] }
    };
    const newState = articleListReducer({}, action);
    expect(newState.articles).toHaveLength(1);
    expect(newState.articlesCount).toBe(3);
    expect(newState.currentPage).toBe(0);
  });

  test('handles PROFILE_PAGE_UNLOADED', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      currentPage: 1
    };
    const action = { type: PROFILE_PAGE_UNLOADED };
    const newState = articleListReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('handles PROFILE_FAVORITES_PAGE_UNLOADED', () => {
    const initialState = {
      articles: [{ slug: 'article-1' }],
      currentPage: 1
    };
    const action = { type: PROFILE_FAVORITES_PAGE_UNLOADED };
    const newState = articleListReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('preserves state for unknown action type', () => {
    const initialState = { articles: [], currentPage: 0 };
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = articleListReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });

  test('does not mutate original state on ARTICLE_FAVORITED', () => {
    const initialState = {
      articles: [{ slug: 'article-1', favorited: false, favoritesCount: 5 }]
    };
    const action = {
      type: ARTICLE_FAVORITED,
      payload: {
        article: { slug: 'article-1', favorited: true, favoritesCount: 6 }
      }
    };
    articleListReducer(initialState, action);
    expect(initialState.articles[0].favorited).toBe(false);
    expect(initialState.articles[0].favoritesCount).toBe(5);
  });
});
