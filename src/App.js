import { useCallback, useEffect, useMemo, useState } from 'react';
import '@sippet-ai/client';
import { getSocket, initSocket, sippet } from '@sippet-ai/client';
import { listInboundNumbers } from '@sippet-ai/client/dist/lib/ash_rpc.js';
import './App.css';

const EVENT_NAMES = [
  'incoming_call',
  'call_answered',
  'call_ended',
  'operator_status_change',
];

function App() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('idle');
  const [events, setEvents] = useState([]);
  const [samples, setSamples] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [didNumbers, setDidNumbers] = useState([]);
  const [didLoading, setDidLoading] = useState(false);
  const [didError, setDidError] = useState('');

  useEffect(() => {
    sippet.setApiKey(apiKey.trim());
  }, [apiKey]);

  const eventCountLabel = useMemo(
    () => `${events.length} event${events.length === 1 ? '' : 's'}`,
    [events.length],
  );

  const addEvent = useCallback((name, payload) => {
    setEvents(prev => {
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name,
          payload,
          receivedAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ];
      return next.slice(0, 50);
    });
  }, []);

  const addSample = useCallback((name, payload) => {
    setSamples(prev => {
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name,
          payload,
          receivedAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ];
      return next.slice(0, 10);
    });
  }, []);

  const connectRealtime = useCallback(() => {
    if (initialized) return;
    const key = apiKey.trim();
    if (!key) {
      addSample('config_error', { message: 'API key is required.' });
      return;
    }

    let socket;
    try {
      socket = getSocket();
    } catch (_error) {
      socket = initSocket({ publishableKey: key });
    }

    socket.onOpen(() => setStatus('connected'));
    socket.onClose(() => setStatus('closed'));
    socket.onError(() => setStatus('error'));

    const channel = socket.channel('events');
    channel
      .join()
      .receive('ok', () => setStatus('joined'))
      .receive('error', () => setStatus('join error'))
      .receive('timeout', () => setStatus('join timeout'));

    EVENT_NAMES.forEach(eventName => {
      channel.on(eventName, payload => addEvent(eventName, payload));
    });

    setInitialized(true);
  }, [addEvent, addSample, apiKey, initialized]);

  const handleClearEvents = useCallback(() => setEvents([]), []);
  const handleClearSamples = useCallback(() => setSamples([]), []);

  const handleGetQueue = useCallback(async () => {
    try {
      const result = await sippet.getQueue();
      addSample('queue', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addSample('queue_error', { message });
    }
  }, [addSample]);

  const handleLoadDidNumbers = useCallback(async () => {
    const key = apiKey.trim();
    if (!key) {
      setDidError('API key is required.');
      return;
    }
    setDidLoading(true);
    setDidError('');
    try {
      const result = await listInboundNumbers({
        fields: ['id', 'phoneE164', 'label'],
        headers: { 'x-api-key': key },
      });
      if (!result.success) {
        setDidError('Failed to load DID numbers.');
        setDidNumbers([]);
        return;
      }
      const data = Array.isArray(result.data?.results)
        ? result.data.results
        : Array.isArray(result.data)
        ? result.data
        : [];
      setDidNumbers(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setDidError(message);
      setDidNumbers([]);
    } finally {
      setDidLoading(false);
    }
  }, [apiKey]);

  const handleGetActiveCalls = useCallback(async () => {
    try {
      const result = await sippet.getActiveCalls();
      addSample('active_calls', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addSample('active_calls_error', { message });
    }
  }, [addSample]);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Sippet AI Demo</h1>
          <p>Realtime events + queue/active calls from the SDK.</p>
        </div>
        <div className="app__status">Status: {status}</div>
      </header>

      <section className="panel">
        <label className="field">
          <span>Publishable API key</span>
          <input
            type="password"
            placeholder="sippetai_..."
            value={apiKey}
            onChange={event => setApiKey(event.target.value)}
          />
        </label>
        <div className="actions">
          <button type="button" onClick={connectRealtime} disabled={initialized}>
            {initialized ? 'Realtime connected' : 'Connect realtime'}
          </button>
          <button type="button" onClick={handleGetActiveCalls}>
            Fetch active calls
          </button>
          <button type="button" onClick={handleGetQueue}>
            Fetch queue
          </button>
          <button type="button" className="ghost" onClick={handleClearSamples}>
            Clear responses
          </button>
          <button type="button" className="ghost" onClick={handleClearEvents}>
            Clear events
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="did__header">
          <h2>Your DID phone numbers</h2>
          <button type="button" onClick={handleLoadDidNumbers} disabled={didLoading}>
            {didLoading ? 'Loading…' : 'Load numbers'}
          </button>
        </div>
        {didError ? <div className="did__error">{didError}</div> : null}
        {didNumbers.length === 0 ? (
          <div className="did__empty">No DID numbers loaded.</div>
        ) : (
          <ul className="did__list">
            {didNumbers.map(number => (
              <li key={number.id}>
                <span>{number.phoneE164}</span>
                {number.label ? <span className="did__label">{number.label}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel panel--split">
        <div>
          <h2>Realtime events</h2>
          <div className="meta">{eventCountLabel}</div>
          <div className="log">
            {events.length === 0 ? (
              <div className="log__empty">No events yet.</div>
            ) : (
              events.map(event => (
                <div className="log__row" key={event.id}>
                  <div className="log__header">
                    <span>{event.name}</span>
                    <span>{event.receivedAt}</span>
                  </div>
                  <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <h2>SDK responses</h2>
          <div className="meta">{samples.length} samples</div>
          <div className="log">
            {samples.length === 0 ? (
              <div className="log__empty">No responses yet.</div>
            ) : (
              samples.map(event => (
                <div className="log__row" key={event.id}>
                  <div className="log__header">
                    <span>{event.name}</span>
                    <span>{event.receivedAt}</span>
                  </div>
                  <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <sippetai-voip-widget
        api-key={apiKey}
        sip-url="sip.sippet.ai"
        sip-user="test-sip"
        sip-password="supersecurepass"
        sip-web-socket-url="wss://sip.sippet.ai:7443"
        user-name="Agent"
        user-email="agent@example.com"
      ></sippetai-voip-widget>
    </div>
  );
}

export default App;
