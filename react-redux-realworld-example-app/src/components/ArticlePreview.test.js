import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import ArticlePreview from './ArticlePreview';

// Configure Enzyme adapter
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

// Get the unwrapped component for testing
const ArticlePreviewComponent = ArticlePreview.WrappedComponent || ArticlePreview;

describe('ArticlePreview Component', () => {
  const mockArticle = {
    slug: 'test-article',
    title: 'Test Article Title',
    description: 'Test article description',
    createdAt: '2025-01-15',
    favorited: false,
    favoritesCount: 5,
    tagList: ['react', 'testing', 'javascript'],
    author: {
      username: 'testuser',
      image: 'https://example.com/avatar.jpg'
    }
  };

  const mockFavorite = jest.fn();
  const mockUnfavorite = jest.fn();

  beforeEach(() => {
    mockFavorite.mockClear();
    mockUnfavorite.mockClear();
  });

  test('renders article title correctly', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    expect(wrapper.find('h1').text()).toBe('Test Article Title');
  });

  test('renders article description correctly', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    expect(wrapper.find('p').text()).toBe('Test article description');
  });

  test('renders author username correctly', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const authorLink = wrapper.find('.author');
    expect(authorLink.prop('children')).toBe('testuser');
  });

  test('renders author image correctly', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const img = wrapper.find('img');
    expect(img.prop('src')).toBe('https://example.com/avatar.jpg');
    expect(img.prop('alt')).toBe('testuser');
  });

  test('renders default avatar when author image is not provided', () => {
    const articleWithoutImage = { ...mockArticle, author: { username: 'testuser' } };
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={articleWithoutImage}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const img = wrapper.find('img');
    expect(img.prop('src')).toBe('https://static.productionready.io/images/smiley-cyrus.jpg');
  });

  test('renders favorites count correctly', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const favoriteButton = wrapper.find('button');
    expect(favoriteButton.text()).toContain('5');
  });

  test('renders all tags from tagList', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const tags = wrapper.find('.tag-list li');
    expect(tags).toHaveLength(3);
    expect(tags.at(0).text()).toBe('react');
    expect(tags.at(1).text()).toBe('testing');
    expect(tags.at(2).text()).toBe('javascript');
  });

  test('applies correct class when article is not favorited', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const favoriteButton = wrapper.find('button');
    expect(favoriteButton.hasClass('btn-outline-primary')).toBe(true);
  });

  test('applies correct class when article is favorited', () => {
    const favoritedArticle = { ...mockArticle, favorited: true };
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={favoritedArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const favoriteButton = wrapper.find('button');
    expect(favoriteButton.hasClass('btn-primary')).toBe(true);
  });

  test('calls favorite function when unfavorited article button is clicked', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const favoriteButton = wrapper.find('button');
    favoriteButton.simulate('click', { preventDefault: jest.fn() });
    expect(mockFavorite).toHaveBeenCalledWith('test-article');
    expect(mockUnfavorite).not.toHaveBeenCalled();
  });

  test('calls unfavorite function when favorited article button is clicked', () => {
    const favoritedArticle = { ...mockArticle, favorited: true };
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={favoritedArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const favoriteButton = wrapper.find('button');
    favoriteButton.simulate('click', { preventDefault: jest.fn() });
    expect(mockUnfavorite).toHaveBeenCalledWith('test-article');
    expect(mockFavorite).not.toHaveBeenCalled();
  });

  test('prevents default event when favorite button is clicked', () => {
    const preventDefault = jest.fn();
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const favoriteButton = wrapper.find('button');
    favoriteButton.simulate('click', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  test('renders link to article detail page', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const articleLink = wrapper.find('Link.preview-link');
    expect(articleLink.prop('to')).toBe('/article/test-article');
  });

  test('renders link to author profile', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const authorLinks = wrapper.find(Link).filter({ to: '/@testuser' });
    expect(authorLinks).toHaveLength(2); // Avatar and name links
  });

  test('formats createdAt date correctly', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const dateSpan = wrapper.find('.date');
    const expectedDate = new Date('2025-01-15').toDateString();
    expect(dateSpan.text()).toBe(expectedDate);
  });

  test('renders Read more text', () => {
    const wrapper = shallow(
      <ArticlePreviewComponent 
        article={mockArticle}
        favorite={mockFavorite}
        unfavorite={mockUnfavorite}
      />
    );
    const readMoreLink = wrapper.find('Link.preview-link');
    const children = React.Children.toArray(readMoreLink.prop('children'));
    const hasReadMore = children.some(c => typeof c === 'object' && c.type === 'span' && React.Children.toArray(c.props.children).includes('Read more...'));
    expect(hasReadMore).toBe(true);
  });
});
