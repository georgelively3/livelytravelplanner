import React from 'react';

// Mock ReactDOM.createRoot and render
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender
}));

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}));

// Mock document.getElementById
const mockElement = document.createElement('div');
mockElement.id = 'root';

describe('index.js', () => {
  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
    
    // Setup DOM mock
    Object.defineProperty(document, 'getElementById', {
      value: jest.fn(() => mockElement),
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

  it('calls createRoot with the root element and renders the app', () => {
    // Import index.js to trigger the render
    require('../index.js');
    
    // Verify createRoot was called with the root element
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
    expect(document.getElementById).toHaveBeenCalledWith('root');

    // Verify render was called
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it('renders app with React.StrictMode wrapper', () => {
    require('../index.js');
    
    // Get the rendered JSX
    expect(mockRender).toHaveBeenCalledTimes(1);
    const renderCall = mockRender.mock.calls[0][0];
    
    // Verify the structure includes React.StrictMode
    expect(renderCall.type).toBe(React.StrictMode);
  });

  it('includes BrowserRouter in component hierarchy', () => {
    require('../index.js');
    
    expect(mockRender).toHaveBeenCalledTimes(1);
    const renderCall = mockRender.mock.calls[0][0];
    
    const appStructure = renderCall.props.children;
    
    // Should have BrowserRouter
    expect(appStructure.type.name).toBe('BrowserRouter');
  });

  it('includes ThemeProvider with Material-UI theme', () => {
    require('../index.js');

    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    
    // Should have ThemeProvider - just check it exists
    expect(themeProvider.type).toBeDefined();
    
    // Verify theme has expected properties
    const theme = themeProvider.props.theme;
    expect(theme.palette.primary.main).toBe('#1976d2');
    expect(theme.palette.secondary.main).toBe('#dc004e');
    expect(theme.palette.background.default).toBe('#f5f5f5');
  });

  it('includes typography configuration in theme', () => {
    require('../index.js');

    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    const theme = themeProvider.props.theme;

    // Verify theme typography
    expect(theme.typography.fontFamily).toBe('"Roboto", "Helvetica", "Arial", sans-serif');
    expect(theme.typography.h1.fontSize).toBe('2.5rem');
    expect(theme.typography.h1.fontWeight).toBe(700);
    expect(theme.typography.h2.fontSize).toBe('2rem');
    expect(theme.typography.h2.fontWeight).toBe(600);
  });

  it('includes CssBaseline and AuthProvider in component structure', () => {
    require('../index.js');

    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    const children = themeProvider.props.children;
    
    expect(Array.isArray(children)).toBe(true);
    expect(children).toHaveLength(2);
    
    // First child should be CssBaseline - just check it exists
    const cssBaseline = children[0];
    expect(cssBaseline.type).toBeDefined();
    
    // Second child should be AuthProvider
    const authProvider = children[1];
    expect(authProvider.type.name).toBe('AuthProvider');
  });

  it('includes App component inside AuthProvider', () => {
    require('../index.js');

    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    const authProvider = themeProvider.props.children[1];
    const app = authProvider.props.children;
    
    expect(app.type.name).toBe('App');
  });

  it('creates theme with createTheme function', () => {
    require('../index.js');

    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    const theme = themeProvider.props.theme;
    
    // Theme should be an object with expected structure
    expect(typeof theme).toBe('object');
    expect(theme.palette).toBeDefined();
    expect(theme.typography).toBeDefined();
  });
});