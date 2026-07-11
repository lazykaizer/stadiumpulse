import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { AIRecommendationCard } from '../../components/AIRecommendationCard';
import type { ReasoningOutput } from '@/types';

describe('AIRecommendationCard', () => {
  it('renders multilingual alerts with correct lang and dir attributes', async () => {
    const recommendation: ReasoningOutput = {
      zoneId: 'zone-a',
      severity: 'moderate',
      recommendation: 'Test recommendation',
      reasoning: 'Test reasoning',
      confidence: 0.8,
      suggestedActions: [],
      multilingualAlerts: {
        'en': 'Hello',
        'ar': 'مرحبا',
        'es': 'Hola'
      }
    };
    
    render(<AIRecommendationCard recommendation={recommendation} />);
    
    // Expand multilingual section
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /Multilingual alert preview/i });
    await user.click(button);
    
    const enText = screen.getByText('Hello');
    expect(enText).toHaveAttribute('lang', 'en');
    expect(enText).toHaveAttribute('dir', 'ltr');
    
    const arText = screen.getByText('مرحبا');
    expect(arText).toHaveAttribute('lang', 'ar');
    expect(arText).toHaveAttribute('dir', 'rtl');
  });
});
