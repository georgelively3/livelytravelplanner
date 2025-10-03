import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Loading from '../../components/Common/Loading';

const theme = createTheme();

describe('Loading Component', () => {
  const renderLoading = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <Loading {...props} />
      </ThemeProvider>
    );
  };

  describe('Default Behavior', () => {
    it('renders loading component with default message', () => {
      renderLoading();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays circular progress indicator', () => {
      renderLoading();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass('MuiCircularProgress-root');
    });

    it('renders with correct default styling', () => {
      const { container } = renderLoading();

      const boxElement = container.querySelector('.MuiBox-root');
      expect(boxElement).toBeInTheDocument();
    });
  });

  describe('Custom Message', () => {
    it('renders with custom message when provided', () => {
      const customMessage = 'Please wait while we load your data...';
      renderLoading({ message: customMessage });

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('renders with empty message when empty string provided', () => {
      renderLoading({ message: '' });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Check that there's no "Loading..." text
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      
      // Check that the typography element exists but is empty
      const typographyElement = screen.getByRole('heading', { level: 6 });
      expect(typographyElement).toBeInTheDocument();
      expect(typographyElement.textContent).toBe('');
    });

    it('renders with special characters in message', () => {
      const specialMessage = 'Loading... 🚀 Please wait! @#$%';
      renderLoading({ message: specialMessage });

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('renders with very long message', () => {
      const longMessage = 'This is a very long loading message that might wrap to multiple lines depending on the screen size and container width';
      renderLoading({ message: longMessage });

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('renders with numeric message', () => {
      renderLoading({ message: 123 });

      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  describe('Typography', () => {
    it('uses correct typography variant for message', () => {
      renderLoading();

      const messageElement = screen.getByText('Loading...');
      expect(messageElement).toHaveClass('MuiTypography-h6');
    });

    it('applies correct typography styling', () => {
      renderLoading();

      const messageElement = screen.getByText('Loading...');
      expect(messageElement.tagName).toBe('H6');
    });
  });

  describe('Layout and Styling', () => {
    it('renders with flexbox layout', () => {
      const { container } = renderLoading();

      const boxElement = container.querySelector('.MuiBox-root');
      const computedStyle = window.getComputedStyle(boxElement);
      expect(computedStyle.display).toBe('flex');
    });

    it('centers content vertically and horizontally', () => {
      const { container } = renderLoading();

      const boxElement = container.querySelector('.MuiBox-root');
      const computedStyle = window.getComputedStyle(boxElement);
      expect(computedStyle.alignItems).toBe('center');
      expect(computedStyle.justifyContent).toBe('center');
    });

    it('has minimum height for proper centering', () => {
      const { container } = renderLoading();

      const boxElement = container.querySelector('.MuiBox-root');
      const computedStyle = window.getComputedStyle(boxElement);
      expect(computedStyle.minHeight).toBe('50vh');
    });

    it('uses column flex direction', () => {
      const { container } = renderLoading();

      const boxElement = container.querySelector('.MuiBox-root');
      const computedStyle = window.getComputedStyle(boxElement);
      expect(computedStyle.flexDirection).toBe('column');
    });
  });

  describe('CircularProgress Properties', () => {
    it('renders circular progress with correct size', () => {
      renderLoading();

      const progressBar = screen.getByRole('progressbar');
      
      // Check that the size is applied via inline style
      expect(progressBar).toHaveStyle('width: 60px');
      expect(progressBar).toHaveStyle('height: 60px');
    });

    it('circular progress has correct ARIA attributes', () => {
      renderLoading();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });
  });

  describe('Accessibility', () => {
    it('has accessible progress indicator', () => {
      renderLoading();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('message is readable by screen readers', () => {
      const message = 'Loading your dashboard';
      renderLoading({ message });

      const messageElement = screen.getByText(message);
      expect(messageElement).toBeInTheDocument();
      expect(messageElement.tagName).toBe('H6');
    });

    it('maintains semantic structure', () => {
      renderLoading();

      const progressBar = screen.getByRole('progressbar');
      const heading = screen.getByRole('heading', { level: 6 });
      
      expect(progressBar).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Loading...');
    });
  });

  describe('Component Integration', () => {
    it('works with Material-UI theme', () => {
      renderLoading();

      const progressBar = screen.getByRole('progressbar');
      const messageElement = screen.getByText('Loading...');
      
      expect(progressBar).toHaveClass('MuiCircularProgress-root');
      expect(messageElement).toHaveClass('MuiTypography-root');
    });

    it('maintains proper spacing between elements', () => {
      renderLoading();

      const messageElement = screen.getByText('Loading...');
      expect(messageElement).toHaveClass('MuiTypography-root');
      
      // Check that margin top is applied
      const computedStyle = window.getComputedStyle(messageElement);
      expect(computedStyle.marginTop).toBeTruthy();
    });
  });

  describe('Props Handling', () => {
    it('handles undefined message prop gracefully', () => {
      renderLoading({ message: undefined });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('handles null message prop gracefully', () => {
      renderLoading({ message: null });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Check that the typography element exists and shows null as empty
      const typographyElement = screen.getByRole('heading', { level: 6 });
      expect(typographyElement).toBeInTheDocument();
      expect(typographyElement.textContent).toBe('');
    });

    it('ignores additional props not used by component', () => {
      const extraProps = {
        message: 'Test message',
        extraProp: 'should be ignored',
        anotherProp: 123
      };

      renderLoading(extraProps);

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});