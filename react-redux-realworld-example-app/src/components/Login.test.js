import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import Login from './Login';

// Configure Enzyme adapter
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

// Get the unwrapped component for testing
const LoginComponent = Login.WrappedComponent || Login;

describe('Login Component', () => {
  const defaultProps = {
    email: '',
    password: '',
    inProgress: false,
    errors: null,
    onChangeEmail: jest.fn(),
    onChangePassword: jest.fn(),
    onSubmit: jest.fn(),
    onUnload: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('h1').text()).toBe('Sign In');
  });

  test('renders email input field', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput).toHaveLength(1);
    expect(emailInput.prop('placeholder')).toBe('Email');
  });

  test('renders password input field', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const passwordInput = wrapper.find('input[type="password"]');
    expect(passwordInput).toHaveLength(1);
    expect(passwordInput.prop('placeholder')).toBe('Password');
  });

  test('renders submit button', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton).toHaveLength(1);
    expect(submitButton.text()).toBe('Sign in');
  });

  test('renders link to registration page', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const registerLink = wrapper.find(Link);
    expect(registerLink.prop('to')).toBe('/register');
    expect(registerLink.prop('children')).toBe('Need an account?');
  });

  test('displays email value in input field', () => {
    const props = { ...defaultProps, email: 'test@example.com' };
    const wrapper = shallow(<LoginComponent {...props} />);
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.prop('value')).toBe('test@example.com');
  });

  test('displays password value in input field', () => {
    const props = { ...defaultProps, password: 'mypassword' };
    const wrapper = shallow(<LoginComponent {...props} />);
    const passwordInput = wrapper.find('input[type="password"]');
    expect(passwordInput.prop('value')).toBe('mypassword');
  });

  test('calls onChangeEmail when email input changes', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const emailInput = wrapper.find('input[type="email"]');
    emailInput.simulate('change', { target: { value: 'newemail@test.com' } });
    expect(defaultProps.onChangeEmail).toHaveBeenCalledWith('newemail@test.com');
  });

  test('calls onChangePassword when password input changes', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const passwordInput = wrapper.find('input[type="password"]');
    passwordInput.simulate('change', { target: { value: 'newpassword' } });
    expect(defaultProps.onChangePassword).toHaveBeenCalledWith('newpassword');
  });

  test('calls onSubmit with email and password when form is submitted', () => {
    const props = { ...defaultProps, email: 'test@example.com', password: 'password123' };
    const wrapper = shallow(<LoginComponent {...props} />);
    const form = wrapper.find('form');
    form.simulate('submit', { preventDefault: jest.fn() });
    expect(props.onSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('prevents default form submission', () => {
    const preventDefault = jest.fn();
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const form = wrapper.find('form');
    form.simulate('submit', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  test('disables submit button when inProgress is true', () => {
    const props = { ...defaultProps, inProgress: true };
    const wrapper = shallow(<LoginComponent {...props} />);
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.prop('disabled')).toBe(true);
  });

  test('enables submit button when inProgress is false', () => {
    const props = { ...defaultProps, inProgress: false };
    const wrapper = shallow(<LoginComponent {...props} />);
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.prop('disabled')).toBe(false);
  });

  test('renders ListErrors component', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    expect(wrapper.find('ListErrors')).toHaveLength(1);
  });

  test('passes errors prop to ListErrors component', () => {
    const mockErrors = { 'email or password': ['is invalid'] };
    const props = { ...defaultProps, errors: mockErrors };
    const wrapper = shallow(<LoginComponent {...props} />);
    const listErrors = wrapper.find('ListErrors');
    expect(listErrors.prop('errors')).toEqual(mockErrors);
  });

  test('calls onUnload when component unmounts', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    wrapper.unmount();
    expect(defaultProps.onUnload).toHaveBeenCalled();
  });

  test('renders with correct CSS classes', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    expect(wrapper.find('.auth-page')).toHaveLength(1);
    expect(wrapper.find('.container.page')).toHaveLength(1);
  });

  test('email input has correct CSS classes', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.hasClass('form-control')).toBe(true);
    expect(emailInput.hasClass('form-control-lg')).toBe(true);
  });

  test('password input has correct CSS classes', () => {
    const wrapper = shallow(<LoginComponent {...defaultProps} />);
    const passwordInput = wrapper.find('input[type="password"]');
    expect(passwordInput.hasClass('form-control')).toBe(true);
    expect(passwordInput.hasClass('form-control-lg')).toBe(true);
  });
});
