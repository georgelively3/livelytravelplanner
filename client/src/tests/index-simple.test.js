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
mockRootElement.id = 'root';

describe('index.js', () => {
  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
    
    // Setup DOM mock
    Object.defineProperty(document, 'getElementById', {
      value: jest.fn(() => mockRootElement),
      writable: true,
      configurable: true
    });
    
    // Clear mock calls but ensure mock returns the right object
    mockCreateRoot.mockClear();
    mockRender.mockClear();
    
    // Ensure createRoot returns an object with render method
    mockCreateRoot.mockReturnValue({
      render: mockRender
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    
    // BrowserRouter doesn't have displayName, check for type name
    expect(strictModeChildren.type.name).toBe('BrowserRouter');
  });

  it('includes ThemeProvider with custom theme', () => {
    require('../index.js');
    
    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    
    // ThemeProvider doesn't have reliable displayName, check for component structure
    expect(themeProvider.type).toBeDefined();
    
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
    
    // First child should be CssBaseline - just check it exists
    const cssBaseline = children[0];
    expect(cssBaseline.type).toBeDefined();
  });

  it('includes AuthProvider with App component', () => {
    require('../index.js');
    
    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    const children = themeProvider.props.children;
    
    const authProvider = children[1];
    expect(authProvider.type.name).toBe('AuthProvider');
    
    const app = authProvider.props.children;
    expect(app.type.name).toBe('App');
  });
});