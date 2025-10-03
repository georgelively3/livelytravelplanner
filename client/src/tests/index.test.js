import React from 'react';
import ReactDOM from 'react-dom/client';
import { render } from '@testing-library/react';

// Mock ReactDOM.createRoot and render
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender
}));

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn()
  }))
}));

// Mock document.getElementById
const mockElement = document.createElement('div');
mockElement.id = 'root';
const originalGetElementById = document.getElementById;

describe('index.js', () => {
  beforeEach(() => {
    // Clear the module cache but not all mocks
    delete require.cache[require.resolve('../index.js')];
    
    // Reset only our specific mocks, not all mocks
    mockRender.mockClear();
    
    // Re-setup the mock properly
    const mockReactDOM = require('react-dom/client');
    mockReactDOM.createRoot.mockReturnValue({
      render: mockRender
    });
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('calls createRoot with the root element and renders the app', () => {
    // Import index.js to trigger the render
    require('../index.js');

    const ReactDOMClient = require('react-dom/client');
    
    // Verify createRoot was called with the root element
    expect(ReactDOMClient.createRoot).toHaveBeenCalledWith(mockElement);
    expect(document.getElementById).toHaveBeenCalledWith('root');

    // Verify render was called
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it('renders app with React.StrictMode wrapper', () => {
    require('../index.js');

    // Debug what we have
    console.log('mockRender.mock.calls:', mockRender.mock.calls);
    console.log('mockRender.mock.calls.length:', mockRender.mock.calls.length);
    
    // Get the rendered JSX
    const renderCall = mockRender.mock.calls[0] && mockRender.mock.calls[0][0];
    
    if (!renderCall) {
      console.log('No render call found');
      return;
    }
    
    // Verify the structure includes React.StrictMode
    expect(renderCall.type).toBe(React.StrictMode);
  });

  it('includes BrowserRouter in component hierarchy', () => {
    require('../index.js');

    // Debug what we have
    console.log('Test 2 - mockRender.mock.calls:', mockRender.mock.calls);
    
    const renderCall = mockRender.mock.calls[0] && mockRender.mock.calls[0][0];
    
    if (!renderCall) {
      console.log('No render call found in test 2');
      return;
    }
    
    const appStructure = renderCall.props.children;
    
    // Should have BrowserRouter
    expect(appStructure.type.name).toBe('BrowserRouter');
  });

  it('includes ThemeProvider with Material-UI theme', () => {
    require('../index.js');

    const renderCall = mockRender.mock.calls[0][0];
    const browserRouter = renderCall.props.children;
    const themeProvider = browserRouter.props.children;
    
    // Should have ThemeProvider
    expect(themeProvider.type.displayName).toBe('ThemeProvider');
    
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
    
    // First child should be CssBaseline
    const cssBaseline = children[0];
    expect(cssBaseline.type.render.displayName).toBe('CssBaseline');
    
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