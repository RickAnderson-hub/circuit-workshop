import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Circuit Workshop heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Circuit Workshop' })).toBeInTheDocument();
  });
});
