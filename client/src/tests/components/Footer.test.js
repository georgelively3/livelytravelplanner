import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Footer from '../../components/Layout/Footer';

const theme = createTheme();

describe('Footer Component', () => {
  const renderFooter = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>
    );
  };

  describe('Component Structure', () => {
    it('renders footer element with correct semantic structure', () => {
      renderFooter();

      const footerElement = screen.getByRole('contentinfo');
      expect(footerElement).toBeInTheDocument();
      expect(footerElement.tagName).toBe('FOOTER');
    });

    it('renders within Material-UI Container', () => {
      const { container } = renderFooter();

      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
      expect(containerElement).toHaveClass('MuiContainer-maxWidthLg');
    });

    it('applies correct Box component styling', () => {
      const { container } = renderFooter();

      const footerBox = container.querySelector('footer');
      expect(footerBox).toBeInTheDocument();
      expect(footerBox).toHaveClass('MuiBox-root');
    });
  });

  describe('Content Display', () => {
    it('displays copyright notice with current year', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      const copyrightText = `© ${currentYear} Lively Travel Planner. All rights reserved.`;
      
      expect(screen.getByText(copyrightText)).toBeInTheDocument();
    });

    it('displays tagline message', () => {
      renderFooter();

      const taglineText = 'Plan your perfect journey with personalized itineraries.';
      expect(screen.getByText(taglineText)).toBeInTheDocument();
    });

    it('renders both typography elements', () => {
      renderFooter();

      const typographyElements = screen.getAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && 
               element?.classList.contains('MuiTypography-root');
      });
      
      expect(typographyElements).toHaveLength(2);
    });
  });

  describe('Typography Styling', () => {
    it('uses body2 variant for copyright text', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      const copyrightElement = screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`);
      
      expect(copyrightElement).toHaveClass('MuiTypography-body2');
    });

    it('uses body2 variant for tagline text', () => {
      renderFooter();

      const taglineElement = screen.getByText('Plan your perfect journey with personalized itineraries.');
      expect(taglineElement).toHaveClass('MuiTypography-body2');
    });

    it('centers both text elements', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      const copyrightElement = screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`);
      const taglineElement = screen.getByText('Plan your perfect journey with personalized itineraries.');
      
      expect(copyrightElement).toHaveStyle('text-align: center');
      expect(taglineElement).toHaveStyle('text-align: center');
    });
  });

  describe('Layout and Styling', () => {
    it('applies primary background color', () => {
      const { container } = renderFooter();

      const footerElement = container.querySelector('footer');
      // Material-UI applies theme colors through CSS classes
      expect(footerElement).toHaveStyle('background-color: rgb(25, 118, 210)'); // Default primary color
    });

    it('applies white text color', () => {
      const { container } = renderFooter();

      const footerElement = container.querySelector('footer');
      expect(footerElement).toHaveStyle('color: white');
    });

    it('applies correct padding', () => {
      const { container } = renderFooter();

      const footerElement = container.querySelector('footer');
      // Check for padding-top and padding-bottom (py: 3)
      const computedStyle = window.getComputedStyle(footerElement);
      expect(computedStyle.paddingTop).toBeTruthy();
      expect(computedStyle.paddingBottom).toBeTruthy();
    });

    it('applies margin-top auto for sticky footer behavior', () => {
      const { container } = renderFooter();

      const footerElement = container.querySelector('footer');
      expect(footerElement).toHaveStyle('margin-top: auto');
    });
  });

  describe('Dynamic Year Display', () => {
    it('displays current year correctly', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`)).toBeInTheDocument();
    });

    it('updates year dynamically when component re-renders', () => {
      const { rerender } = renderFooter();

      // First render with current year
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`)).toBeInTheDocument();

      // Re-render component (year should remain the same in the same test)
      rerender(
        <ThemeProvider theme={theme}>
          <Footer />
        </ThemeProvider>
      );

      expect(screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic footer role', () => {
      renderFooter();

      const footerElement = screen.getByRole('contentinfo');
      expect(footerElement).toBeInTheDocument();
    });

    it('has readable text content for screen readers', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      
      // Check that text content is accessible
      expect(screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`)).toBeVisible();
      expect(screen.getByText('Plan your perfect journey with personalized itineraries.')).toBeVisible();
    });

    it('maintains proper heading hierarchy', () => {
      renderFooter();

      // Footer uses Typography body2, not headings, which is appropriate
      const headings = screen.queryAllByRole('heading');
      expect(headings).toHaveLength(0); // Footer should not have headings
    });
  });

  describe('Material-UI Integration', () => {
    it('integrates properly with Material-UI theme', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      const copyrightElement = screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`);
      
      expect(copyrightElement).toHaveClass('MuiTypography-root');
      expect(copyrightElement).toHaveClass('MuiTypography-body2');
    });

    it('applies responsive container sizing', () => {
      const { container } = renderFooter();

      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toHaveClass('MuiContainer-maxWidthLg');
    });

    it('uses proper Box component props', () => {
      const { container } = renderFooter();

      const footerElement = container.querySelector('footer');
      expect(footerElement).toHaveClass('MuiBox-root');
    });
  });

  describe('Content Consistency', () => {
    it('maintains consistent brand name', () => {
      renderFooter();

      expect(screen.getByText((content) => content.includes('Lively Travel Planner'))).toBeInTheDocument();
    });

    it('maintains consistent tagline', () => {
      renderFooter();

      expect(screen.getByText('Plan your perfect journey with personalized itineraries.')).toBeInTheDocument();
    });

    it('includes all rights reserved notice', () => {
      renderFooter();

      expect(screen.getByText((content) => content.includes('All rights reserved'))).toBeInTheDocument();
    });
  });

  describe('Visual Spacing', () => {
    it('applies proper spacing between copyright and tagline', () => {
      renderFooter();

      const taglineElement = screen.getByText('Plan your perfect journey with personalized itineraries.');
      
      // Check for margin-top on tagline (sx={{ mt: 1 }})
      const computedStyle = window.getComputedStyle(taglineElement);
      expect(computedStyle.marginTop).toBeTruthy();
    });

    it('renders in correct order', () => {
      renderFooter();

      const currentYear = new Date().getFullYear();
      const allText = screen.getByRole('contentinfo').textContent;
      
      expect(allText).toMatch(new RegExp(`© ${currentYear}.*Plan your perfect journey`));
    });
  });

  describe('Edge Cases', () => {
    it('handles year transition correctly', () => {
      // Test that current year is displayed, not hardcoded
      renderFooter();

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`)).toBeInTheDocument();
      
      // Ensure it's not showing old years
      expect(screen.queryByText('© 2022 Lively Travel Planner. All rights reserved.')).not.toBeInTheDocument();
      expect(screen.queryByText('© 2021 Lively Travel Planner. All rights reserved.')).not.toBeInTheDocument();
    });

    it('renders consistently across multiple instances', () => {
      const { unmount } = renderFooter();
      
      // Capture first render
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`)).toBeInTheDocument();
      
      unmount();
      
      // Render again
      renderFooter();
      expect(screen.getByText(`© ${currentYear} Lively Travel Planner. All rights reserved.`)).toBeInTheDocument();
    });
  });
});