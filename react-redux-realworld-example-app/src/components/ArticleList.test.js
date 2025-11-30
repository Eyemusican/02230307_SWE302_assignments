import React from 'react';
import { shallow } from 'enzyme';
import ArticleList from './ArticleList';

// Configure Enzyme adapter
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

describe('ArticleList Component', () => {
  test('renders loading state when articles is null', () => {
    const wrapper = shallow(<ArticleList articles={null} />);
    expect(wrapper.find('.article-preview').text()).toBe('Loading...');
  });

  test('renders loading state when articles is undefined', () => {
    const wrapper = shallow(<ArticleList />);
    expect(wrapper.find('.article-preview').text()).toBe('Loading...');
  });

  test('renders empty state when articles array is empty', () => {
    const wrapper = shallow(<ArticleList articles={[]} />);
    expect(wrapper.find('.article-preview').text()).toBe('No articles are here... yet.');
  });

  test('renders multiple articles correctly', () => {
    const mockArticles = [
      {
        slug: 'test-article-1',
        title: 'Test Article 1',
        description: 'Description 1',
        author: { username: 'john' }
      },
      {
        slug: 'test-article-2',
        title: 'Test Article 2',
        description: 'Description 2',
        author: { username: 'jane' }
      },
      {
        slug: 'test-article-3',
        title: 'Test Article 3',
        description: 'Description 3',
        author: { username: 'bob' }
      }
    ];

    const wrapper = shallow(<ArticleList articles={mockArticles} />);
    expect(wrapper.find('Connect(ArticlePreview)')).toHaveLength(3);
  });

  test('renders single article correctly', () => {
    const mockArticles = [
      {
        slug: 'test-article',
        title: 'Test Article',
        description: 'Test Description',
        author: { username: 'testuser' }
      }
    ];

    const wrapper = shallow(<ArticleList articles={mockArticles} />);
    expect(wrapper.find('Connect(ArticlePreview)')).toHaveLength(1);
  });

  test('passes correct article prop to ArticlePreview', () => {
    const mockArticle = {
      slug: 'test-article',
      title: 'Test Article',
      description: 'Test Description',
      author: { username: 'testuser' }
    };

    const wrapper = shallow(<ArticleList articles={[mockArticle]} />);
    const articlePreview = wrapper.find('Connect(ArticlePreview)').first();
    expect(articlePreview.prop('article')).toEqual(mockArticle);
  });

  test('uses article slug as key for each ArticlePreview', () => {
    const mockArticles = [
      { slug: 'article-1', title: 'Article 1', author: { username: 'user1' } },
      { slug: 'article-2', title: 'Article 2', author: { username: 'user2' } }
    ];

    const wrapper = shallow(<ArticleList articles={mockArticles} />);
    const articlePreviews = wrapper.find('Connect(ArticlePreview)');
    
    expect(articlePreviews.at(0).key()).toBe('article-1');
    expect(articlePreviews.at(1).key()).toBe('article-2');
  });

  test('renders ListPagination component when articles exist', () => {
    const mockArticles = [{ slug: 'test', title: 'Test', author: { username: 'user' } }];
    const mockPager = { pages: [1, 2, 3] };
    
    const wrapper = shallow(
      <ArticleList 
        articles={mockArticles} 
        pager={mockPager}
        articlesCount={30}
        currentPage={1}
      />
    );
    
    expect(wrapper.find('Connect(ListPagination)')).toHaveLength(1);
  });

  test('passes correct props to ListPagination', () => {
    const mockArticles = [{ slug: 'test', title: 'Test', author: { username: 'user' } }];
    const mockPager = { pages: [1, 2, 3] };
    const articlesCount = 25;
    const currentPage = 2;
    
    const wrapper = shallow(
      <ArticleList 
        articles={mockArticles} 
        pager={mockPager}
        articlesCount={articlesCount}
        currentPage={currentPage}
      />
    );
    
    const pagination = wrapper.find('Connect(ListPagination)');
    expect(pagination.prop('pager')).toEqual(mockPager);
    expect(pagination.prop('articlesCount')).toBe(articlesCount);
    expect(pagination.prop('currentPage')).toBe(currentPage);
  });
});
