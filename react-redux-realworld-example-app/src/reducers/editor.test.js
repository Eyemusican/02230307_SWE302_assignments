import editorReducer from './editor';
import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ARTICLE_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

describe('editor reducer', () => {
  test('returns initial state', () => {
    expect(editorReducer(undefined, {})).toEqual({});
  });

  test('handles EDITOR_PAGE_LOADED for editing existing article', () => {
    const action = {
      type: EDITOR_PAGE_LOADED,
      payload: {
        article: {
          slug: 'test-article',
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['react', 'testing']
        }
      }
    };
    const newState = editorReducer({}, action);
    expect(newState.articleSlug).toBe('test-article');
    expect(newState.title).toBe('Test Article');
    expect(newState.description).toBe('Test Description');
    expect(newState.body).toBe('Test Body');
    expect(newState.tagList).toEqual(['react', 'testing']);
    expect(newState.tagInput).toBe('');
  });

  test('handles EDITOR_PAGE_LOADED for new article (null payload)', () => {
    const action = {
      type: EDITOR_PAGE_LOADED,
      payload: null
    };
    const newState = editorReducer({}, action);
    expect(newState.articleSlug).toBe('');
    expect(newState.title).toBe('');
    expect(newState.description).toBe('');
    expect(newState.body).toBe('');
    expect(newState.tagList).toEqual([]);
    expect(newState.tagInput).toBe('');
  });

  test('handles EDITOR_PAGE_UNLOADED', () => {
    const initialState = {
      title: 'Test',
      description: 'Description',
      body: 'Body',
      tagList: ['tag']
    };
    const action = { type: EDITOR_PAGE_UNLOADED };
    const newState = editorReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('handles ARTICLE_SUBMITTED success', () => {
    const initialState = { inProgress: true, title: 'Test' };
    const action = {
      type: ARTICLE_SUBMITTED,
      error: false,
      payload: {
        article: { slug: 'new-article', title: 'Test' }
      }
    };
    const newState = editorReducer(initialState, action);
    expect(newState.inProgress).toBe(null);
    expect(newState.errors).toBe(null);
    expect(newState.title).toBe('Test');
  });

  test('handles ARTICLE_SUBMITTED error', () => {
    const initialState = { inProgress: true, title: 'Test' };
    const action = {
      type: ARTICLE_SUBMITTED,
      error: true,
      payload: {
        errors: {
          title: ["can't be blank"],
          body: ["can't be blank"]
        }
      }
    };
    const newState = editorReducer(initialState, action);
    expect(newState.inProgress).toBe(null);
    expect(newState.errors).toEqual({
      title: ["can't be blank"],
      body: ["can't be blank"]
    });
  });

  test('handles ASYNC_START for ARTICLE_SUBMITTED', () => {
    const initialState = { title: 'Test', inProgress: false };
    const action = {
      type: ASYNC_START,
      subtype: ARTICLE_SUBMITTED
    };
    const newState = editorReducer(initialState, action);
    expect(newState.inProgress).toBe(true);
    expect(newState.title).toBe('Test');
  });

  test('handles ADD_TAG', () => {
    const initialState = {
      tagList: ['react', 'javascript'],
      tagInput: 'testing'
    };
    const action = { type: ADD_TAG };
    const newState = editorReducer(initialState, action);
    expect(newState.tagList).toEqual(['react', 'javascript', 'testing']);
    expect(newState.tagInput).toBe('');
  });

  test('handles ADD_TAG with empty tagList', () => {
    const initialState = {
      tagList: [],
      tagInput: 'newtag'
    };
    const action = { type: ADD_TAG };
    const newState = editorReducer(initialState, action);
    expect(newState.tagList).toEqual(['newtag']);
    expect(newState.tagInput).toBe('');
  });

  test('handles REMOVE_TAG', () => {
    const initialState = {
      tagList: ['react', 'javascript', 'testing']
    };
    const action = {
      type: REMOVE_TAG,
      tag: 'javascript'
    };
    const newState = editorReducer(initialState, action);
    expect(newState.tagList).toEqual(['react', 'testing']);
  });

  test('handles REMOVE_TAG with non-existent tag', () => {
    const initialState = {
      tagList: ['react', 'testing']
    };
    const action = {
      type: REMOVE_TAG,
      tag: 'nonexistent'
    };
    const newState = editorReducer(initialState, action);
    expect(newState.tagList).toEqual(['react', 'testing']);
  });

  test('handles UPDATE_FIELD_EDITOR for title', () => {
    const initialState = { title: '', description: 'desc' };
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'title',
      value: 'New Title'
    };
    const newState = editorReducer(initialState, action);
    expect(newState.title).toBe('New Title');
    expect(newState.description).toBe('desc');
  });

  test('handles UPDATE_FIELD_EDITOR for description', () => {
    const initialState = { title: 'title', description: '' };
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'description',
      value: 'New Description'
    };
    const newState = editorReducer(initialState, action);
    expect(newState.description).toBe('New Description');
    expect(newState.title).toBe('title');
  });

  test('handles UPDATE_FIELD_EDITOR for body', () => {
    const initialState = { body: '' };
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'body',
      value: 'Article body content'
    };
    const newState = editorReducer(initialState, action);
    expect(newState.body).toBe('Article body content');
  });

  test('handles UPDATE_FIELD_EDITOR for tagInput', () => {
    const initialState = { tagInput: '' };
    const action = {
      type: UPDATE_FIELD_EDITOR,
      key: 'tagInput',
      value: 'newtag'
    };
    const newState = editorReducer(initialState, action);
    expect(newState.tagInput).toBe('newtag');
  });

  test('preserves state for unknown action type', () => {
    const initialState = { title: 'Test', description: 'Desc' };
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = editorReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });

  test('handles ASYNC_START for non-editor subtypes', () => {
    const initialState = { title: 'Test' };
    const action = {
      type: ASYNC_START,
      subtype: 'SOME_OTHER_ACTION'
    };
    const newState = editorReducer(initialState, action);
    expect(newState).toEqual(initialState);
    expect(newState.inProgress).toBeUndefined();
  });

  test('does not mutate original state on ADD_TAG', () => {
    const initialState = {
      tagList: ['react'],
      tagInput: 'testing'
    };
    editorReducer(initialState, { type: ADD_TAG });
    expect(initialState.tagList).toEqual(['react']);
    expect(initialState.tagInput).toBe('testing');
  });

  test('does not mutate original state on REMOVE_TAG', () => {
    const initialState = {
      tagList: ['react', 'javascript', 'testing']
    };
    editorReducer(initialState, { type: REMOVE_TAG, tag: 'javascript' });
    expect(initialState.tagList).toEqual(['react', 'javascript', 'testing']);
  });
});
