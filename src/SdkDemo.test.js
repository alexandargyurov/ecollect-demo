import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getSocket, initClient, initSocket, joinEventsChannel } from '@sippet-ai/sdk-js/client';
import SdkDemo from './SdkDemo';

jest.mock(
  '@sippet-ai/sdk-js/client',
  () => ({
    getSocket: jest.fn(),
    initClient: jest.fn(),
    initSocket: jest.fn(),
    joinEventsChannel: jest.fn(),
  }),
  { virtual: true },
);

const originalFetch = global.fetch;
let client;
let socket;
let channel;

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn();
  client = {
    listCalls: jest.fn().mockResolvedValue({ success: true, data: [] }),
    listCallQueueEntries: jest.fn().mockResolvedValue({ success: true, data: [] }),
    whoAmI: jest.fn().mockResolvedValue({ success: true, data: { fullName: 'Demo Operator' } }),
  };
  socket = {
    disconnect: jest.fn(),
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onError: jest.fn(),
  };
  channel = { on: jest.fn(), onError: jest.fn(), onClose: jest.fn() };
  initClient.mockReturnValue(client);
  getSocket.mockReturnValue(socket);
  initSocket.mockReturnValue(socket);
  joinEventsChannel.mockReturnValue(channel);
});

afterEach(() => {
  global.fetch = originalFetch;
});

test('uses WebSocket auth rather than query parameters for realtime tokens', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ token: 'demo-session-token', expires_at: '2026-10-09T20:00:00Z' }),
  });
  render(<SdkDemo />);
  fireEvent.change(screen.getByLabelText('Secret API key (demo only)'), {
    target: { value: ' demo-api-key ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Connect realtime' }));

  await waitFor(() => expect(initSocket).toHaveBeenCalledWith({
    baseUrl: 'https://api.sippet.ai',
    socketOptions: { authToken: 'demo-session-token' },
  }));
  expect(global.fetch).toHaveBeenCalledWith('https://api.sippet.ai/api/realtime/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': 'demo-api-key' },
  });
  expect(joinEventsChannel).toHaveBeenCalledWith(undefined, socket);
  expect(channel.on.mock.calls.map(([eventName]) => eventName)).toEqual([
    'incoming_call', 'call_answered', 'call_ended', 'operator_status_change',
  ]);
  expect(screen.getByRole('button', { name: 'Realtime connected' })).toBeDisabled();
  expect(screen.queryByText(/demo-session-token/)).not.toBeInTheDocument();
});

test('reports token errors without opening a socket', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 401 });
  render(<SdkDemo />);
  fireEvent.change(screen.getByLabelText('Secret API key (demo only)'), {
    target: { value: 'invalid-demo-key' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Connect realtime' }));

  expect(await screen.findByText(/Failed to mint realtime session token \(401\)/)).toBeInTheDocument();
  expect(initSocket).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Connect realtime' })).toBeEnabled();
});

test('preserves the RPC endpoint and existing dashboard actions', async () => {
  render(<SdkDemo />);
  fireEvent.change(screen.getByLabelText('Secret API key (demo only)'), {
    target: { value: ' demo-api-key ' },
  });
  expect(initClient).toHaveBeenLastCalledWith({
    baseUrl: 'https://api.sippet.ai/rpc/public/run',
    headers: { 'x-api-key': 'demo-api-key' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Fetch active calls' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fetch queue' }));
  fireEvent.click(screen.getByRole('button', { name: 'Load profile' }));

  expect(await screen.findByText(/Demo Operator/)).toBeInTheDocument();
  expect(client.listCalls).toHaveBeenCalledWith(expect.objectContaining({
    filter: { status: { in: ['initiated', 'ringing', 'answered'] } },
  }));
  expect(client.listCallQueueEntries).toHaveBeenCalledWith(expect.objectContaining({
    filter: { state: { in: ['waiting', 'offering'] } },
  }));
  expect(client.whoAmI).toHaveBeenCalledWith({
    fields: ['id', 'email', 'fullName', 'confirmedAt', 'sipUsername'],
  });
});
