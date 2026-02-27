import { render, screen } from '@testing-library/react';
import App from './App';

test('renders synthesis button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/合成/i);
  expect(buttonElement).toBeInTheDocument();
});
