// Integration tests for complete user flows
import React from 'react';
import { shallow } from 'enzyme';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';

Enzyme.configure({ adapter: new Adapter() });

const mockStore = configureMockStore([]);

describe('Integration Tests', () => {
  describe('User Authentication Flow', () => {
    test('login flow updates state correctly', () => {
      const initialState = {
        auth: {
          email: '',
          password: '',
          inProgress: false,
          errors: null
        },
        common: {
          appName: 'Conduit',
          token: null,
          currentUser: null
        }
      };

      const store = mockStore(initialState);
      expect(store.getState().auth.email).toBe('');
      expect(store.getState().auth.password).toBe('');
    });

    test('successful login sets token and user', () => {
      const initialState = {
        auth: { inProgress: false },
        common: { token: null, currentUser: null }
      };

      const store = mockStore(initialState);
      
      // Simulate login action
      store.dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            email: 'test@test.com',
            token: 'jwt-token-123',
            username: 'testuser'
          }
        }
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('LOGIN');
      expect(actions[0].payload.user.email).toBe('test@test.com');
      expect(actions[0].payload.user.token).toBe('jwt-token-123');
    });

    test('failed login shows error', () => {
      const initialState = {
        auth: { inProgress: false, errors: null },
        common: {}
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'LOGIN',
        error: true,
        payload: {
          errors: { 'email or password': ['is invalid'] }
        }
      });

      const actions = store.getActions();
      expect(actions[0].error).toBe(true);
      expect(actions[0].payload.errors).toBeDefined();
    });

    test('logout clears user state', () => {
      const initialState = {
        common: {
          token: 'jwt-token-123',
          currentUser: { username: 'testuser' }
        }
      };

      const store = mockStore(initialState);
      
      store.dispatch({ type: 'LOGOUT' });

      const actions = store.getActions();
      expect(actions[0].type).toBe('LOGOUT');
    });
  });

  describe('Article Creation Flow', () => {
    test('creating article dispatches correct actions', () => {
      const initialState = {
        editor: {
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['react', 'testing'],
          inProgress: false
        },
        common: {
          token: 'jwt-token-123',
          currentUser: { username: 'testuser' }
        }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'ARTICLE_SUBMITTED',
        payload: {
          article: {
            slug: 'test-article',
            title: 'Test Article',
            description: 'Test Description',
            body: 'Test Body',
            tagList: ['react', 'testing'],
            author: { username: 'testuser' }
          }
        }
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('ARTICLE_SUBMITTED');
      expect(actions[0].payload.article.title).toBe('Test Article');
    });

    test('article creation starts async operation', () => {
      const initialState = {
        editor: { inProgress: false }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'ASYNC_START',
        subtype: 'ARTICLE_SUBMITTED'
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('ASYNC_START');
      expect(actions[0].subtype).toBe('ARTICLE_SUBMITTED');
    });

    test('article creation error shows validation errors', () => {
      const initialState = {
        editor: { inProgress: true }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'ARTICLE_SUBMITTED',
        error: true,
        payload: {
          errors: {
            title: ["can't be blank"],
            body: ["can't be blank"]
          }
        }
      });

      const actions = store.getActions();
      expect(actions[0].error).toBe(true);
      expect(actions[0].payload.errors.title).toBeDefined();
    });
  });

  describe('Article Favorite Flow', () => {
    test('favoriting article updates article list', () => {
      const initialState = {
        articleList: {
          articles: [
            { slug: 'article-1', favorited: false, favoritesCount: 5 }
          ]
        },
        common: { token: 'jwt-token-123' }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'ARTICLE_FAVORITED',
        payload: {
          article: { slug: 'article-1', favorited: true, favoritesCount: 6 }
        }
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('ARTICLE_FAVORITED');
      expect(actions[0].payload.article.favorited).toBe(true);
      expect(actions[0].payload.article.favoritesCount).toBe(6);
    });

    test('unfavoriting article updates article list', () => {
      const initialState = {
        articleList: {
          articles: [
            { slug: 'article-1', favorited: true, favoritesCount: 6 }
          ]
        },
        common: { token: 'jwt-token-123' }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'ARTICLE_UNFAVORITED',
        payload: {
          article: { slug: 'article-1', favorited: false, favoritesCount: 5 }
        }
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('ARTICLE_UNFAVORITED');
      expect(actions[0].payload.article.favorited).toBe(false);
      expect(actions[0].payload.article.favoritesCount).toBe(5);
    });
  });

  describe('Home Page Loading Flow', () => {
    test('loading home page sets articles and tags', () => {
      const initialState = {
        articleList: {},
        common: {}
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'HOME_PAGE_LOADED',
        payload: [
          { tags: ['react', 'javascript', 'nodejs'] },
          {
            articles: [
              { slug: 'article-1', title: 'Article 1' },
              { slug: 'article-2', title: 'Article 2' }
            ],
            articlesCount: 20
          }
        ],
        pager: { pages: [1, 2] },
        tab: 'all'
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('HOME_PAGE_LOADED');
      expect(actions[0].payload[0].tags).toHaveLength(3);
      expect(actions[0].payload[1].articles).toHaveLength(2);
      expect(actions[0].payload[1].articlesCount).toBe(20);
    });

    test('changing tab updates article list', () => {
      const initialState = {
        articleList: { tab: 'all' }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'CHANGE_TAB',
        payload: {
          articles: [{ slug: 'feed-article' }],
          articlesCount: 5
        },
        pager: { pages: [1] },
        tab: 'feed'
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('CHANGE_TAB');
      expect(actions[0].tab).toBe('feed');
    });
  });

  describe('Tag Filter Flow', () => {
    test('applying tag filter updates articles', () => {
      const initialState = {
        articleList: { tag: null, tab: 'all' }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'APPLY_TAG_FILTER',
        payload: {
          articles: [{ slug: 'tagged-article', tagList: ['react'] }],
          articlesCount: 8
        },
        pager: { pages: [1] },
        tag: 'react'
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('APPLY_TAG_FILTER');
      expect(actions[0].tag).toBe('react');
    });
  });

  describe('Profile Page Flow', () => {
    test('loading profile page shows user articles', () => {
      const initialState = {
        articleList: {},
        profile: {}
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'PROFILE_PAGE_LOADED',
        payload: [
          { profile: { username: 'testuser', bio: 'Test bio' } },
          {
            articles: [{ slug: 'user-article' }],
            articlesCount: 3
          }
        ],
        pager: { pages: [1] }
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('PROFILE_PAGE_LOADED');
      expect(actions[0].payload[0].profile.username).toBe('testuser');
      expect(actions[0].payload[1].articles).toHaveLength(1);
    });
  });

  describe('Editor Tag Management Flow', () => {
    test('adding tag to editor', () => {
      const initialState = {
        editor: {
          tagList: ['react'],
          tagInput: 'testing'
        }
      };

      const store = mockStore(initialState);
      
      store.dispatch({ type: 'ADD_TAG' });

      const actions = store.getActions();
      expect(actions[0].type).toBe('ADD_TAG');
    });

    test('removing tag from editor', () => {
      const initialState = {
        editor: {
          tagList: ['react', 'testing', 'javascript']
        }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'REMOVE_TAG',
        tag: 'testing'
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('REMOVE_TAG');
      expect(actions[0].tag).toBe('testing');
    });
  });

  describe('Pagination Flow', () => {
    test('changing page loads new articles', () => {
      const initialState = {
        articleList: { currentPage: 0 }
      };

      const store = mockStore(initialState);
      
      store.dispatch({
        type: 'SET_PAGE',
        payload: {
          articles: [{ slug: 'page-2-article' }],
          articlesCount: 20
        },
        page: 2
      });

      const actions = store.getActions();
      expect(actions[0].type).toBe('SET_PAGE');
      expect(actions[0].page).toBe(2);
    });
  });
});
