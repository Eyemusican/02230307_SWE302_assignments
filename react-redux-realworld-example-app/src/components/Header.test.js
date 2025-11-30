import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import Header from './Header';

// Configure Enzyme adapter
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

describe('Header Component', () => {
  const defaultProps = {
    appName: 'Conduit',
    currentUser: null
  };

  test('renders navbar correctly', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    expect(wrapper.find('nav.navbar')).toHaveLength(1);
  });

  test('renders app name as brand link', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    const brandLink = wrapper.find('Link.navbar-brand');
    expect(brandLink.prop('children')).toBe('conduit'); // lowercase
    expect(brandLink.prop('to')).toBe('/');
  });

  test('converts app name to lowercase', () => {
    const props = { ...defaultProps, appName: 'CONDUIT' };
    const wrapper = shallow(<Header {...props} />);
    const brandLink = wrapper.find('Link.navbar-brand');
    expect(brandLink.prop('children')).toBe('conduit');
  });

  test('renders LoggedOutView when user is not logged in', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    expect(wrapper.find('LoggedOutView')).toHaveLength(1);
    expect(wrapper.find('LoggedInView')).toHaveLength(1);
  });

  test('LoggedOutView shows Home, Sign in, and Sign up links', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    const loggedOutView = wrapper.find('LoggedOutView').dive();
    const links = loggedOutView.find(Link);
    
    expect(links).toHaveLength(3);
    expect(links.at(0).prop('to')).toBe('/');
    expect(links.at(0).prop('children')).toBe('Home');
    expect(links.at(1).prop('to')).toBe('/login');
    expect(links.at(1).prop('children')).toBe('Sign in');
    expect(links.at(2).prop('to')).toBe('/register');
    expect(links.at(2).prop('children')).toBe('Sign up');
  });

  test('LoggedOutView renders null when user is logged in', () => {
    const props = {
      ...defaultProps,
      currentUser: { username: 'testuser', email: 'test@test.com' }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedOutView = wrapper.find('LoggedOutView').dive();
    expect(loggedOutView.type()).toBe(null);
  });

  test('LoggedInView shows navigation links when user is logged in', () => {
    const props = {
      ...defaultProps,
      currentUser: { 
        username: 'testuser', 
        email: 'test@test.com',
        image: 'https://example.com/avatar.jpg'
      }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const links = loggedInView.find(Link);
    
    expect(links).toHaveLength(4);
    expect(links.at(0).prop('to')).toBe('/');
    expect(links.at(1).prop('to')).toBe('/editor');
    expect(links.at(2).prop('to')).toBe('/settings');
    expect(links.at(3).prop('to')).toBe('/@testuser');
  });

  test('LoggedInView renders null when user is not logged in', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    expect(loggedInView.type()).toBe(null);
  });

  test('LoggedInView shows Home link', () => {
    const props = {
      ...defaultProps,
      currentUser: { username: 'testuser', email: 'test@test.com' }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const homeLink = loggedInView.find(Link).at(0);
    expect(homeLink.prop('children')).toBe('Home');
  });

  test('LoggedInView shows New Post link with icon', () => {
    const props = {
      ...defaultProps,
      currentUser: { username: 'testuser', email: 'test@test.com' }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const newPostLink = loggedInView.find(Link).at(1);
    expect(newPostLink.prop('to')).toBe('/editor');
    const children = React.Children.toArray(newPostLink.prop('children'));
    const hasNewPost = children.some(c => typeof c === 'string' && c.includes('New Post'));
    expect(hasNewPost).toBe(true);
    expect(newPostLink.find('i.ion-compose')).toHaveLength(1);
  });

  test('LoggedInView shows Settings link with icon', () => {
    const props = {
      ...defaultProps,
      currentUser: { username: 'testuser', email: 'test@test.com' }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const settingsLink = loggedInView.find(Link).at(2);
    expect(settingsLink.prop('to')).toBe('/settings');
    const children = React.Children.toArray(settingsLink.prop('children'));
    const hasSettings = children.some(c => typeof c === 'string' && c.includes('Settings'));
    expect(hasSettings).toBe(true);
    expect(settingsLink.find('i.ion-gear-a')).toHaveLength(1);
  });

  test('LoggedInView shows user profile link with username', () => {
    const props = {
      ...defaultProps,
      currentUser: { 
        username: 'johndoe', 
        email: 'john@test.com',
        image: 'https://example.com/avatar.jpg'
      }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const profileLink = loggedInView.find(Link).at(3);
    expect(profileLink.prop('to')).toBe('/@johndoe');
    const children = React.Children.toArray(profileLink.prop('children'));
    const hasUsername = children.some(c => c === 'johndoe');
    expect(hasUsername).toBe(true);
  });

  test('LoggedInView shows user avatar image', () => {
    const props = {
      ...defaultProps,
      currentUser: { 
        username: 'testuser', 
        email: 'test@test.com',
        image: 'https://example.com/avatar.jpg'
      }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const profileLink = loggedInView.find(Link).at(3);
    const img = profileLink.find('img');
    
    expect(img).toHaveLength(1);
    expect(img.prop('src')).toBe('https://example.com/avatar.jpg');
    expect(img.prop('alt')).toBe('testuser');
    expect(img.hasClass('user-pic')).toBe(true);
  });

  test('LoggedInView shows default avatar when user image is not provided', () => {
    const props = {
      ...defaultProps,
      currentUser: { username: 'testuser', email: 'test@test.com' }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const profileLink = loggedInView.find(Link).at(3);
    const img = profileLink.find('img');
    
    expect(img.prop('src')).toBe('https://static.productionready.io/images/smiley-cyrus.jpg');
  });

  test('all navigation links have correct CSS classes', () => {
    const props = {
      ...defaultProps,
      currentUser: { username: 'testuser', email: 'test@test.com' }
    };
    const wrapper = shallow(<Header {...props} />);
    const loggedInView = wrapper.find('LoggedInView').dive();
    const links = loggedInView.find(Link);
    
    links.forEach(link => {
      expect(link.hasClass('nav-link')).toBe(true);
    });
  });

  test('navbar has correct CSS classes', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    const navbar = wrapper.find('nav');
    expect(navbar.hasClass('navbar')).toBe(true);
    expect(navbar.hasClass('navbar-light')).toBe(true);
  });

  test('renders container div', () => {
    const wrapper = shallow(<Header {...defaultProps} />);
    expect(wrapper.find('.container')).toHaveLength(1);
  });
});
