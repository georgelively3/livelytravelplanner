import React from 'react';

// Mock react-dom/client before importing index
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender
}));

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}));

// Mock document.getElementById
const mockRootElement = document.createElement('div');
const originalGetElementById = document.getElementById;

describe('index.js', () => {
  beforeEach(() => {
    // Setup DOM mock
    document.getElementById = jest.fn(() => mockRootElement);
    
    // Clear mock calls
    mockCreateRoot.mockClear();
    mockRender.mockClear();
  });

  afterEach(() => {
    // Restore original
    document.getElementById = originalGetElementById;
  });

  it('imports and executes without errors', () => {
    // This test just ensures index.js can be imported and executed
    expect(() => {
      require('../index.js');
    }).not.toThrow();
  });

  it('calls ReactDOM.createRoot with root element', () => {
    require('../index.js');
    
    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
    expect(document.getElementById).toHaveBeenCalledWith('root');
  });

  it('calls render method on root', () => {
    require('../index.js');
    
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledWith(expect.any(Object));
  });

  it('renders React.StrictMode as root component', () => {
    require('../index.js');
    
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(React.StrictMode);
  });

  it('includes BrowserRouter in component structure', () => {
    require('../index.js');
    
    const renderCall = mockRender.mock.calls[0][0];
    const strictModeChildren = renderCall.props.children;
    
    expect(strictModeChildren.type.displayName).toBe('Router');
  });

  it('includes ThemeProvider with custom theme', () => {
    require('../index.js');
    
    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    
    expect(themeProvider.type.displayName).toBe('ThemeProvider');
    
    const theme = themeProvider.props.theme;
    expect(theme.palette.primary.main).toBe('#1976d2');
    expect(theme.palette.secondary.main).toBe('#dc004e');
  });

  it('includes CssBaseline component', () => {
    require('../index.js');
    
    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    const children = themeProvider.props.children;
    
    // Children should be an array with CssBaseline and AuthProvider
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBe(2);
    
    const cssBaseline = children[0];
    expect(cssBaseline.type.render.displayName).toBe('CssBaseline');
  });

  it('includes AuthProvider with App component', () => {
    require('../index.js');
    
    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    const children = themeProvider.props.children;
    
    const authProvider = children[1];
    expect(authProvider.type.displayName).toBe('AuthProvider');
    
    const app = authProvider.props.children;
    expect(app.type.name).toBe('App');
  });
});