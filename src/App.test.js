import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  '@sippet-ai/sdk-js/client',
  () => ({
    getSocket: () => ({ disconnect: jest.fn() }),
    initClient: () => ({
      listCallQueueEntries: jest.fn(),
      listCalls: jest.fn(),
      whoAmI: jest.fn(),
    }),
    initSocket: jest.fn(),
    joinEventsChannel: jest.fn(),
  }),
  { virtual: true },
);

beforeEach(() => window.history.replaceState({}, '', '/'));

test('renders the unpaid demo invoice and Sippet widget', () => {
  const { container } = render(<App />);

  expect(screen.getByRole('heading', { name: /Your invoice is due/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'INV-2026-0712' })).toBeInTheDocument();
  expect(screen.getByText('Alpine Studio GmbH')).toBeInTheDocument();
  expect(screen.getAllByText('eCollect')).toHaveLength(2);
  expect(screen.getAllByText('1,872.00', { exact: false })).toHaveLength(2);
  expect(screen.getByText('Unpaid')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Download invoice/i })).toBeInTheDocument();
  expect(container.querySelector('sippet-widget')).toHaveAttribute(
    'agent-id',
    '72fc884d-b7da-4697-8757-d9222bb14f17',
  );
});

test('keeps the earlier SDK dashboard available', () => {
  window.history.replaceState({}, '', '/sdk-demo');
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Sippet AI Demo' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Back to invoice/i })).toHaveAttribute('href', '/');
  expect(screen.getByRole('button', { name: /Connect realtime/i })).toBeInTheDocument();
});
