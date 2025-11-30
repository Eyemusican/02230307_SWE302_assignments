// Mock agent.js to prevent real API calls during tests

const mockPromise = () => Promise.resolve({});

const Auth = {
  current: jest.fn(() => mockPromise()),
  login: jest.fn(() => mockPromise()),
  register: jest.fn(() => mockPromise()),
  save: jest.fn(() => mockPromise())
};

const Tags = {
  getAll: jest.fn(() => mockPromise())
};

const limit = (count, p) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = article => Object.assign({}, article, { slug: undefined });

const Articles = {
  all: jest.fn((page) => mockPromise()),
  byAuthor: jest.fn((author, page) => mockPromise()),
  byTag: jest.fn((tag, page) => mockPromise()),
  del: jest.fn((slug) => mockPromise()),
  favorite: jest.fn((slug) => mockPromise()),
  favoritedBy: jest.fn((author, page) => mockPromise()),
  feed: jest.fn(() => mockPromise()),
  get: jest.fn((slug) => mockPromise()),
  unfavorite: jest.fn((slug) => mockPromise()),
  update: jest.fn((article) => mockPromise()),
  create: jest.fn((article) => mockPromise())
};

const Comments = {
  create: jest.fn((slug, comment) => mockPromise()),
  delete: jest.fn((slug, commentId) => mockPromise()),
  forArticle: jest.fn((slug) => mockPromise())
};

const Profile = {
  follow: jest.fn((username) => mockPromise()),
  get: jest.fn((username) => mockPromise()),
  unfollow: jest.fn((username) => mockPromise())
};

const agent = {
  Articles,
  Auth,
  Comments,
  Profile,
  Tags,
  setToken: jest.fn((_token) => {}),
};

export default agent;
