import authReducer from './auth';
import {
  LOGIN,
  REGISTER,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH
} from '../constants/actionTypes';

describe('auth reducer', () => {
  test('returns initial state', () => {
    expect(authReducer(undefined, {})).toEqual({});
  });

  test('handles LOGIN success', () => {
    const action = {
      type: LOGIN,
      error: false,
      payload: {
        user: {
          email: 'test@test.com',
          token: 'jwt-token-here',
          username: 'testuser'
        }
      }
    };
    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(false);
    expect(newState.errors).toBe(null);
  });

  test('handles LOGIN error', () => {
    const action = {
      type: LOGIN,
      error: true,
      payload: {
        errors: {
          'email or password': ['is invalid']
        }
      }
    };
    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(false);
    expect(newState.errors).toEqual({ 'email or password': ['is invalid'] });
  });

  test('handles REGISTER success', () => {
    const action = {
      type: REGISTER,
      error: false,
      payload: {
        user: {
          email: 'newuser@test.com',
          token: 'new-jwt-token',
          username: 'newuser'
        }
      }
    };
    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(false);
    expect(newState.errors).toBe(null);
  });

  test('handles REGISTER error', () => {
    const action = {
      type: REGISTER,
      error: true,
      payload: {
        errors: {
          email: ['has already been taken'],
          username: ['has already been taken']
        }
      }
    };
    const newState = authReducer({}, action);
    expect(newState.inProgress).toBe(false);
    expect(newState.errors).toEqual({
      email: ['has already been taken'],
      username: ['has already been taken']
    });
  });

  test('handles LOGIN_PAGE_UNLOADED', () => {
    const initialState = {
      email: 'test@test.com',
      password: 'password',
      inProgress: false
    };
    const action = { type: LOGIN_PAGE_UNLOADED };
    const newState = authReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('handles REGISTER_PAGE_UNLOADED', () => {
    const initialState = {
      email: 'test@test.com',
      password: 'password',
      username: 'testuser',
      inProgress: false
    };
    const action = { type: REGISTER_PAGE_UNLOADED };
    const newState = authReducer(initialState, action);
    expect(newState).toEqual({});
  });

  test('handles ASYNC_START for LOGIN', () => {
    const initialState = { email: 'test@test.com', password: 'password' };
    const action = {
      type: ASYNC_START,
      subtype: LOGIN
    };
    const newState = authReducer(initialState, action);
    expect(newState.inProgress).toBe(true);
    expect(newState.email).toBe('test@test.com');
    expect(newState.password).toBe('password');
  });

  test('handles ASYNC_START for REGISTER', () => {
    const initialState = {
      email: 'test@test.com',
      password: 'password',
      username: 'testuser'
    };
    const action = {
      type: ASYNC_START,
      subtype: REGISTER
    };
    const newState = authReducer(initialState, action);
    expect(newState.inProgress).toBe(true);
    expect(newState.email).toBe('test@test.com');
    expect(newState.password).toBe('password');
    expect(newState.username).toBe('testuser');
  });

  test('handles UPDATE_FIELD_AUTH for email', () => {
    const initialState = { email: '', password: '' };
    const action = {
      type: UPDATE_FIELD_AUTH,
      key: 'email',
      value: 'newemail@test.com'
    };
    const newState = authReducer(initialState, action);
    expect(newState.email).toBe('newemail@test.com');
    expect(newState.password).toBe('');
  });

  test('handles UPDATE_FIELD_AUTH for password', () => {
    const initialState = { email: 'test@test.com', password: '' };
    const action = {
      type: UPDATE_FIELD_AUTH,
      key: 'password',
      value: 'newpassword'
    };
    const newState = authReducer(initialState, action);
    expect(newState.email).toBe('test@test.com');
    expect(newState.password).toBe('newpassword');
  });

  test('handles UPDATE_FIELD_AUTH for username', () => {
    const initialState = {};
    const action = {
      type: UPDATE_FIELD_AUTH,
      key: 'username',
      value: 'newusername'
    };
    const newState = authReducer(initialState, action);
    expect(newState.username).toBe('newusername');
  });

  test('preserves state for unknown action type', () => {
    const initialState = { email: 'test@test.com', password: 'password' };
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = authReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });

  test('handles ASYNC_START for non-auth subtypes', () => {
    const initialState = { email: 'test@test.com' };
    const action = {
      type: ASYNC_START,
      subtype: 'SOME_OTHER_ACTION'
    };
    const newState = authReducer(initialState, action);
    expect(newState).toEqual(initialState);
    expect(newState.inProgress).toBeUndefined();
  });

  test('handles LOGIN error with no payload errors', () => {
    const action = {
      type: LOGIN,
      error: true,
      payload: null
    };
    const newState = authReducer({}, action);
    expect(newState.errors).toBe(null);
  });
});
