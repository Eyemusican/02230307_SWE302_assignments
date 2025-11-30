import React from 'react';
import { shallow } from 'enzyme';
import Editor from './Editor';

// Configure Enzyme adapter
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

// Get the unwrapped component for testing
const EditorComponent = Editor.WrappedComponent || Editor;

describe('Editor Component', () => {
  const defaultProps = {
    title: '',
    description: '',
    body: '',
    tagInput: '',
    tagList: [],
    articleSlug: null,
    inProgress: false,
    errors: null,
    match: { params: {} },
    onAddTag: jest.fn(),
    onLoad: jest.fn(),
    onRemoveTag: jest.fn(),
    onSubmit: jest.fn(),
    onUnload: jest.fn(),
    onUpdateField: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders editor form correctly', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('.editor-page')).toHaveLength(1);
  });

  test('renders title input field', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const titleInput = wrapper.find('input[placeholder="Article Title"]');
    expect(titleInput).toHaveLength(1);
    expect(titleInput.prop('type')).toBe('text');
  });

  test('renders description input field', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const descInput = wrapper.find('input[placeholder="What\'s this article about?"]');
    expect(descInput).toHaveLength(1);
    expect(descInput.prop('type')).toBe('text');
  });

  test('renders body textarea field', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const bodyTextarea = wrapper.find('textarea');
    expect(bodyTextarea).toHaveLength(1);
    expect(bodyTextarea.prop('placeholder')).toBe('Write your article (in markdown)');
    expect(bodyTextarea.prop('rows')).toBe('8');
  });

  test('renders tag input field', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const tagInput = wrapper.find('input[placeholder="Enter tags"]');
    expect(tagInput).toHaveLength(1);
  });

  test('renders publish button', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const publishButton = wrapper.find('button');
    expect(publishButton.text()).toBe('Publish Article');
    expect(publishButton.prop('type')).toBe('button');
  });

  test('displays title value in input field', () => {
    const props = { ...defaultProps, title: 'My Article Title' };
    const wrapper = shallow(<EditorComponent {...props} />);
    const titleInput = wrapper.find('input[placeholder="Article Title"]');
    expect(titleInput.prop('value')).toBe('My Article Title');
  });

  test('displays description value in input field', () => {
    const props = { ...defaultProps, description: 'Article description' };
    const wrapper = shallow(<EditorComponent {...props} />);
    const descInput = wrapper.find('input[placeholder="What\'s this article about?"]');
    expect(descInput.prop('value')).toBe('Article description');
  });

  test('displays body value in textarea', () => {
    const props = { ...defaultProps, body: 'Article content here' };
    const wrapper = shallow(<EditorComponent {...props} />);
    const bodyTextarea = wrapper.find('textarea');
    expect(bodyTextarea.prop('value')).toBe('Article content here');
  });

  test('displays tagInput value in tag input field', () => {
    const props = { ...defaultProps, tagInput: 'newtag' };
    const wrapper = shallow(<EditorComponent {...props} />);
    const tagInput = wrapper.find('input[placeholder="Enter tags"]');
    expect(tagInput.prop('value')).toBe('newtag');
  });

  test('calls onUpdateField when title changes', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const titleInput = wrapper.find('input[placeholder="Article Title"]');
    titleInput.simulate('change', { target: { value: 'New Title' } });
    expect(defaultProps.onUpdateField).toHaveBeenCalledWith('title', 'New Title');
  });

  test('calls onUpdateField when description changes', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const descInput = wrapper.find('input[placeholder="What\'s this article about?"]');
    descInput.simulate('change', { target: { value: 'New Description' } });
    expect(defaultProps.onUpdateField).toHaveBeenCalledWith('description', 'New Description');
  });

  test('calls onUpdateField when body changes', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const bodyTextarea = wrapper.find('textarea');
    bodyTextarea.simulate('change', { target: { value: 'New Body' } });
    expect(defaultProps.onUpdateField).toHaveBeenCalledWith('body', 'New Body');
  });

  test('calls onUpdateField when tag input changes', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const tagInput = wrapper.find('input[placeholder="Enter tags"]');
    tagInput.simulate('change', { target: { value: 'react' } });
    expect(defaultProps.onUpdateField).toHaveBeenCalledWith('tagInput', 'react');
  });

  test('calls onAddTag when Enter key is pressed in tag input', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const tagInput = wrapper.find('input[placeholder="Enter tags"]');
    tagInput.simulate('keyUp', { keyCode: 13, preventDefault: jest.fn() });
    expect(defaultProps.onAddTag).toHaveBeenCalled();
  });

  test('prevents default when Enter key is pressed in tag input', () => {
    const preventDefault = jest.fn();
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const tagInput = wrapper.find('input[placeholder="Enter tags"]');
    tagInput.simulate('keyUp', { keyCode: 13, preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  test('does not call onAddTag when other keys are pressed', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const tagInput = wrapper.find('input[placeholder="Enter tags"]');
    tagInput.simulate('keyUp', { keyCode: 65, preventDefault: jest.fn() }); // 'A' key
    expect(defaultProps.onAddTag).not.toHaveBeenCalled();
  });

  test('renders tag list correctly', () => {
    const props = { ...defaultProps, tagList: ['react', 'testing', 'javascript'] };
    const wrapper = shallow(<EditorComponent {...props} />);
    const tags = wrapper.find('.tag-list span.tag-default');
    expect(tags).toHaveLength(3);
    expect(tags.at(0).text()).toContain('react');
    expect(tags.at(1).text()).toContain('testing');
    expect(tags.at(2).text()).toContain('javascript');
  });

  test('renders remove icon for each tag', () => {
    const props = { ...defaultProps, tagList: ['react', 'testing'] };
    const wrapper = shallow(<EditorComponent {...props} />);
    const removeIcons = wrapper.find('i.ion-close-round');
    expect(removeIcons).toHaveLength(2);
  });

  test('calls onRemoveTag when tag remove icon is clicked', () => {
    const props = { ...defaultProps, tagList: ['react', 'testing'] };
    const wrapper = shallow(<EditorComponent {...props} />);
    const removeIcon = wrapper.find('i.ion-close-round').at(0);
    removeIcon.simulate('click');
    expect(defaultProps.onRemoveTag).toHaveBeenCalledWith('react');
  });

  test('handles empty tagList gracefully', () => {
    const props = { ...defaultProps, tagList: [] };
    const wrapper = shallow(<EditorComponent {...props} />);
    const tags = wrapper.find('.tag-list span.tag-default');
    expect(tags).toHaveLength(0);
  });

  test('handles null tagList gracefully', () => {
    const props = { ...defaultProps, tagList: null };
    const wrapper = shallow(<EditorComponent {...props} />);
    expect(() => wrapper.find('.tag-list')).not.toThrow();
  });

  test('calls onSubmit when publish button is clicked', () => {
    const props = {
      ...defaultProps,
      title: 'Test Title',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['test']
    };
    const wrapper = shallow(<EditorComponent {...props} />);
    const publishButton = wrapper.find('button');
    publishButton.simulate('click', { preventDefault: jest.fn() });
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  test('prevents default when form is submitted', () => {
    const preventDefault = jest.fn();
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const publishButton = wrapper.find('button');
    publishButton.simulate('click', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  test('disables publish button when inProgress is true', () => {
    const props = { ...defaultProps, inProgress: true };
    const wrapper = shallow(<EditorComponent {...props} />);
    const publishButton = wrapper.find('button');
    expect(publishButton.prop('disabled')).toBe(true);
  });

  test('enables publish button when inProgress is false', () => {
    const props = { ...defaultProps, inProgress: false };
    const wrapper = shallow(<EditorComponent {...props} />);
    const publishButton = wrapper.find('button');
    expect(publishButton.prop('disabled')).toBe(false);
  });

  test('renders ListErrors component', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    expect(wrapper.find('ListErrors')).toHaveLength(1);
  });

  test('passes errors prop to ListErrors component', () => {
    const mockErrors = { title: ["can't be blank"] };
    const props = { ...defaultProps, errors: mockErrors };
    const wrapper = shallow(<EditorComponent {...props} />);
    const listErrors = wrapper.find('ListErrors');
    expect(listErrors.prop('errors')).toEqual(mockErrors);
  });

  test('calls onUnload when component unmounts', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    wrapper.unmount();
    expect(defaultProps.onUnload).toHaveBeenCalled();
  });

  test('all form inputs have correct CSS classes', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const titleInput = wrapper.find('input[placeholder="Article Title"]');
    const descInput = wrapper.find('input[placeholder="What\'s this article about?"]');
    const bodyTextarea = wrapper.find('textarea');

    expect(titleInput.hasClass('form-control')).toBe(true);
    expect(descInput.hasClass('form-control')).toBe(true);
    expect(bodyTextarea.hasClass('form-control')).toBe(true);
  });

  test('publish button has correct CSS classes', () => {
    const wrapper = shallow(<EditorComponent {...defaultProps} />);
    const publishButton = wrapper.find('button');
    expect(publishButton.hasClass('btn')).toBe(true);
    expect(publishButton.hasClass('btn-lg')).toBe(true);
    expect(publishButton.hasClass('btn-primary')).toBe(true);
  });
});
