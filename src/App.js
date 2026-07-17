import { useState } from 'react';
import SdkDemo from './SdkDemo';
import './App.css';

const WIDGET_AGENT_ID = '72fc884d-b7da-4697-8757-d9222bb14f17';
const WIDGET_PUBLISHABLE_KEY = 'sippetai_hpWdiPjZr4ZFt5cdBMSsxRVxjs2qtuTehGRitZAFeMZ9Mgm2bloCOpe6Pe1LXBOWQ_cyhOr0'

const invoiceItems = [
  { description: 'Business platform plan', detail: '12 months · Jul 2026–Jun 2027', amount: '1,200.00 EUR' },
  { description: 'Onboarding workshop', detail: 'One remote session', amount: '240.00 EUR' },
  { description: 'Document processing', detail: '30 documents × 4.00 EUR', amount: '120.00 EUR' },
];

const timeline = [
  { label: 'Payment became overdue', date: '16 July 2026' },
  { label: 'Payment reminder sent', date: '14 July 2026' },
  { label: 'Invoice delivered', date: '1 July 2026' },
];

function InvoicePage() {
  const [copied, setCopied] = useState('');

  const copyValue = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch (_error) {
      setCopied('Copy unavailable');
    }
  };

  const downloadInvoice = () => {
    const content = [
      'eCollect — INVOICE INV-2026-0712',
      'Status: Unpaid',
      'Customer: Alpine Studio GmbH',
      'Supplier: eCollect Demo Europe B.V.',
      'Invoice date: 1 July 2026',
      'Due date: 15 July 2026',
      '',
      ...invoiceItems.map(item => `${item.description}: ${item.amount}`),
      'VAT 20%: 312.00 EUR',
      'Total: 1,872.00 EUR',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice-INV-2026-0712.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="site-shell">
      <header className="hero">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#invoice" aria-label="eCollect invoice home">
            <BrandMark />
            <span>eCollect</span>
          </a>
          <button className="language-button" type="button" aria-label="Change language">
            <GlobeIcon />
            <span>EN</span>
          </button>
        </nav>
        <div className="hero__copy">
          <span className="eyebrow">Customer portal</span>
          <h1>Your invoice is due</h1>
          <p>Please use the payment details below.</p>
        </div>
        <div className="hero__ribbon hero__ribbon--one" aria-hidden="true" />
        <div className="hero__ribbon hero__ribbon--two" aria-hidden="true" />
      </header>

      <main className="invoice-page" id="invoice">
        <section className="invoice-card invoice-card--summary" aria-labelledby="invoice-heading">
          <div className="summary__topline">
            <div>
              <span className="section-kicker">Invoice</span>
              <h2 id="invoice-heading">INV-2026-0712</h2>
            </div>
            <span className="status"><ClockIcon /> Unpaid</span>
          </div>
          <div className="summary__grid">
            <div className="summary__amount">
              <span>Amount due</span>
              <strong>1,872.00 <small>EUR</small></strong>
            </div>
            <dl className="details-list">
              <div><dt>Customer</dt><dd>Alpine Studio GmbH</dd></div>
              <div><dt>Invoice date</dt><dd>1 July 2026</dd></div>
              <div><dt>Due date</dt><dd>15 July 2026</dd></div>
              <div><dt>Invoice stage</dt><dd>Reminder sent</dd></div>
            </dl>
          </div>
        </section>

        <section className="invoice-card payment-card" aria-labelledby="payment-heading">
          <div className="card-heading">
            <div>
              <span className="section-kicker">Payment details</span>
              <h2 id="payment-heading">Bank transfer</h2>
            </div>
            {copied && <span className="copy-notice" role="status">{copied === 'Copy unavailable' ? copied : `${copied} copied`}</span>}
          </div>
          <dl className="payment-list">
            <div><dt>Bank</dt><dd>Continental Demo Bank</dd></div>
            <div>
              <dt>Payment reference</dt>
              <dd><span>RF18 5390 0754 7034</span><CopyButton label="Reference" onClick={() => copyValue('Reference', 'RF18539007547034')} /></dd>
            </div>
            <div>
              <dt>IBAN</dt>
              <dd><span>DE89 3704 0044 0532 0130 00</span><CopyButton label="IBAN" onClick={() => copyValue('IBAN', 'DE89370400440532013000')} /></dd>
            </div>
          </dl>
        </section>

        <section className="invoice-card line-items" aria-labelledby="specifications-heading">
          <div className="card-heading">
            <div>
              <span className="section-kicker">Specifications</span>
              <h2 id="specifications-heading">Invoice items</h2>
            </div>
          </div>
          <div className="item-list">
            {invoiceItems.map(item => (
              <div className="item" key={item.description}>
                <div><strong>{item.description}</strong><span>{item.detail}</span></div>
                <span>{item.amount}</span>
              </div>
            ))}
          </div>
          <div className="totals">
            <div><span>Subtotal</span><span>1,560.00 EUR</span></div>
            <div><span>VAT 20%</span><span>312.00 EUR</span></div>
            <div className="totals__grand"><strong>Total</strong><strong>1,872.00 EUR</strong></div>
          </div>
        </section>

        <section className="invoice-card history" aria-labelledby="history-heading">
          <div className="card-heading">
            <div>
              <span className="section-kicker">Activity</span>
              <h2 id="history-heading">July 2026</h2>
            </div>
          </div>
          <ol className="timeline">
            {timeline.map((event, index) => (
              <li key={event.label} className={index === 0 ? 'timeline__item timeline__item--attention' : 'timeline__item'}>
                <span className="timeline__dot" aria-hidden="true" />
                <div><strong>{event.label}</strong><span>{event.date}</span></div>
                {event.amount && <span className="timeline__amount">{event.amount}</span>}
              </li>
            ))}
          </ol>
        </section>

        <div className="invoice-actions">
          <button type="button" onClick={downloadInvoice}><DownloadIcon />Download invoice</button>
          <a href="mailto:accounts@example.com?subject=Invoice%20INV-2026-0712"><MailIcon />Email invoice</a>
        </div>
        <p className="demo-note">Demo invoice — no real payment or customer data.</p>
      </main>

      <footer className="footer">
        <div className="footer__brand"><BrandMark /><span>eCollect</span></div>
        <p>Clear payments. Calm business.</p>
        <nav aria-label="Footer navigation">
          <a href="#invoice">Invoice</a>
          <a href="/sdk-demo">SDK demo</a>
          <a href="mailto:support@example.com">Support</a>
          <a href="#invoice">Privacy</a>
        </nav>
        <small>Demo experience powered by Sippet AI</small>
      </footer>

    </div>
  );
}

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  return (
    <>
      {pathname === '/sdk-demo' ? <SdkDemo /> : <InvoicePage />}
      <sippet-widget
        agent-id={WIDGET_AGENT_ID}
        {...(WIDGET_PUBLISHABLE_KEY ? { 'publishable-key': WIDGET_PUBLISHABLE_KEY } : {})}
      ></sippet-widget>
    </>
  );
}

function CopyButton({ label, onClick }) {
  return <button className="copy-button" type="button" onClick={onClick} aria-label={`Copy ${label}`}><CopyIcon /></button>;
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /></span>;
}

function Icon({ children }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

function GlobeIcon() { return <Icon><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18" /></Icon>; }
function ClockIcon() { return <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>; }
function CopyIcon() { return <Icon><rect x="9" y="9" width="10" height="10" rx="2" /><path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></Icon>; }
function DownloadIcon() { return <Icon><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" /></Icon>; }
function MailIcon() { return <Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>; }

export default App;
