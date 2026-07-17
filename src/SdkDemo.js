import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getSocket,
  initClient,
  initSocket,
  joinEventsChannel,
} from '@sippet-ai/sdk-js/client';
import './SdkDemo.css';

const EVENT_NAMES = [
  'incoming_call',
  'call_answered',
  'call_ended',
  'operator_status_change',
];
const SIPPET_BASE_URL = 'https://api.sippet.ai';
const SIPPET_RPC_URL = `${SIPPET_BASE_URL}/rpc/public/run`;

function SdkDemo() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('idle');
  const [events, setEvents] = useState([]);
  const [samples, setSamples] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profile, setProfile] = useState(null);

  const sippet = useMemo(() => {
    const key = apiKey.trim();
    return initClient({
      baseUrl: SIPPET_RPC_URL,
      headers: key ? { 'x-api-key': key } : undefined,
    });
  }, [apiKey]);

  useEffect(() => {
    setInitialized(false);
    setStatus('idle');
  }, [apiKey]);

  const addEvent = useCallback((name, payload) => {
    setEvents(previous => [{
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      payload,
      receivedAt: new Date().toLocaleTimeString(),
    }, ...previous].slice(0, 50));
  }, []);

  const addSample = useCallback((name, payload) => {
    setSamples(previous => [{
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      payload,
      receivedAt: new Date().toLocaleTimeString(),
    }, ...previous].slice(0, 10));
  }, []);

  const connectRealtime = useCallback(async () => {
    if (initialized) return;
    const key = apiKey.trim();
    if (!key) {
      addSample('config_error', { message: 'Secret API key is required.' });
      return;
    }

    setStatus('minting token');
    let session;
    try {
      session = await mintRealtimeSession(key);
      addSample('realtime_session', session);
    } catch (error) {
      addSample('realtime_token_error', { message: getErrorMessage(error) });
      setStatus('token error');
      return;
    }

    try { getSocket().disconnect(); } catch (_error) {}

    let socket;
    try {
      socket = initSocket({
        baseUrl: SIPPET_BASE_URL,
        socketOptions: { params: { session_token: session.token } },
      });
    } catch (error) {
      addSample('realtime_error', { message: getErrorMessage(error) });
      setStatus('error');
      return;
    }

    socket.onOpen(() => setStatus('connected'));
    socket.onClose(() => setStatus('closed'));
    socket.onError(() => setStatus('error'));

    const channel = joinEventsChannel(undefined, socket);
    channel.onError(() => setStatus('channel error'));
    channel.onClose(() => setStatus('channel closed'));
    EVENT_NAMES.forEach(eventName => channel.on(eventName, payload => addEvent(eventName, payload)));
    setStatus('joined');
    setInitialized(true);
  }, [addEvent, addSample, apiKey, initialized]);

  const handleGetQueue = useCallback(async () => {
    try {
      const result = await sippet.listCallQueueEntries({
        fields: ['id', 'callUuid', 'queueName', 'callerIdNumber', 'callerIdName', 'state', 'agentName', 'waitStartedAt'],
        filter: { state: { in: ['waiting', 'offering'] } },
      });
      addSample('queue', result);
    } catch (error) {
      addSample('queue_error', { message: getErrorMessage(error) });
    }
  }, [addSample, sippet]);

  const handleGetActiveCalls = useCallback(async () => {
    try {
      const result = await sippet.listCalls({
        fields: ['id', 'callUuid', 'direction', 'fromNumber', 'toNumber', 'status', 'startedAt', 'endedAt', 'durationSeconds'],
        filter: { status: { in: ['initiated', 'ringing', 'answered'] } },
      });
      addSample('active_calls', result);
    } catch (error) {
      addSample('active_calls_error', { message: getErrorMessage(error) });
    }
  }, [addSample, sippet]);

  const handleLoadProfile = useCallback(async () => {
    if (!apiKey.trim()) {
      setProfileError('Secret API key is required.');
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    try {
      const result = await sippet.whoAmI({
        fields: ['id', 'email', 'fullName', 'confirmedAt', 'sipUsername'],
      });
      if (!result.success) {
        setProfileError(formatSdkErrors(result.errors));
        setProfile(null);
      } else {
        setProfile(result.data);
      }
    } catch (error) {
      setProfileError(getErrorMessage(error));
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [apiKey, sippet]);

  return (
    <main className="sdk-demo">
      <header className="sdk-demo__header">
        <div>
          <a href="/" className="sdk-demo__back">← Back to invoice</a>
          <h1>Sippet AI Demo</h1>
          <p>Session-token realtime and RPC actions from the browser SDK.</p>
        </div>
        <div className="sdk-demo__status">Status: {status}</div>
      </header>

      <section className="sdk-panel">
        <label className="sdk-field">
          <span>Secret API key (demo only)</span>
          <input type="password" placeholder="sippetai_..." value={apiKey} onChange={event => setApiKey(event.target.value)} />
        </label>
        <div className="sdk-actions">
          <button type="button" onClick={connectRealtime} disabled={initialized}>{initialized ? 'Realtime connected' : 'Connect realtime'}</button>
          <button type="button" onClick={handleGetActiveCalls}>Fetch active calls</button>
          <button type="button" onClick={handleGetQueue}>Fetch queue</button>
          <button type="button" className="sdk-ghost" onClick={() => setSamples([])}>Clear responses</button>
          <button type="button" className="sdk-ghost" onClick={() => setEvents([])}>Clear events</button>
        </div>
      </section>

      <section className="sdk-panel">
        <div className="sdk-profile__header">
          <h2>Current operator</h2>
          <button type="button" onClick={handleLoadProfile} disabled={profileLoading}>{profileLoading ? 'Loading…' : 'Load profile'}</button>
        </div>
        {profileError && <div className="sdk-error">{profileError}</div>}
        {!profile ? <div className="sdk-empty">No profile loaded.</div> : <pre className="sdk-profile__data">{JSON.stringify(profile, null, 2)}</pre>}
      </section>

      <section className="sdk-panel sdk-panel--split">
        <EventLog title="Realtime events" meta={`${events.length} event${events.length === 1 ? '' : 's'}`} events={events} empty="No events yet." />
        <EventLog title="SDK responses" meta={`${samples.length} samples`} events={samples} empty="No responses yet." />
      </section>
    </main>
  );
}

function EventLog({ title, meta, events, empty }) {
  return (
    <div>
      <h2>{title}</h2>
      <div className="sdk-meta">{meta}</div>
      <div className="sdk-log">
        {events.length === 0 ? <div className="sdk-empty sdk-empty--center">{empty}</div> : events.map(event => (
          <div className="sdk-log__row" key={event.id}>
            <div className="sdk-log__header"><span>{event.name}</span><span>{event.receivedAt}</span></div>
            <pre>{JSON.stringify(event.payload, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

async function mintRealtimeSession(apiKey) {
  const response = await fetch(`${SIPPET_BASE_URL}/api/realtime/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
  });
  if (!response.ok) throw new Error(`Failed to mint realtime session token (${response.status})`);
  const data = await response.json();
  return { token: data.token, expiresAt: data.expiresAt ?? data.expires_at };
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Unknown error';
}

function formatSdkErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return 'Request failed.';
  return errors.map(error => error.message || String(error)).join(', ');
}

export default SdkDemo;
