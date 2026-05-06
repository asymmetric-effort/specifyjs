// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from 'specifyjs';
import { useState, useCallback, useHead } from 'specifyjs/hooks';

export function InteractiveForms() {
  useHead({
    title: 'Interactive Forms — SpecifyJS',
    description: 'Form components with live validation and state management.',
    keywords: 'specifyjs, forms, validation, state management',
    author: 'Asymmetric Effort, LLC',
  });

  return createElement('div', null,
    createElement('div', { className: 'section' },
      createElement('h2', null, 'Interactive Forms'),
      createElement('p', { style: { color: '#64748b', marginBottom: '24px' } },
        'Form components with live validation, controlled inputs, and state management — all powered by SpecifyJS hooks.',
      ),
    ),
    createElement('div', { className: 'preview-grid' },
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'Sign Up Form'),
        createElement('div', { className: 'preview-body' }, createElement(SignUpForm, null)),
      ),
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'Settings Panel'),
        createElement('div', { className: 'preview-body' }, createElement(SettingsPanel, null)),
      ),
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'Search with Suggestions'),
        createElement('div', { className: 'preview-body' }, createElement(SearchSuggestions, null)),
      ),
      createElement('div', { className: 'preview-card' },
        createElement('div', { className: 'preview-header' }, 'Multi-Step Wizard'),
        createElement('div', { className: 'preview-body' }, createElement(MultiStepWizard, null)),
      ),
    ),
  );
}

function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.includes('@')) e.email = 'Valid email required';
    return e;
  }, [name, email]);

  const handleSubmit = useCallback(() => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) setSubmitted(true);
  }, [validate]);

  if (submitted) {
    return createElement('div', { style: { textAlign: 'center', padding: '20px' } },
      createElement('div', { style: { fontSize: '24px', marginBottom: '8px' } }, '\u2705'),
      createElement('p', { style: { fontWeight: '600' } }, `Welcome, ${name}!`),
      createElement('button', {
        onClick: () => { setSubmitted(false); setName(''); setEmail(''); },
        style: btnStyle(),
      }, 'Reset'),
    );
  }

  return createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    field('Name', name, (v: string) => setName(v), errors.name, 'text', 'Your name'),
    field('Email', email, (v: string) => setEmail(v), errors.email, 'email', 'you@example.com'),
    createElement('button', { onClick: handleSubmit, style: { ...btnStyle(), backgroundColor: '#3b82f6', color: 'white', border: 'none' } }, 'Sign Up'),
  );
}

function SettingsPanel() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  return createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    toggleRow('Dark Mode', dark, () => setDark(!dark)),
    toggleRow('Notifications', notifications, () => setNotifications(!notifications)),
    createElement('div', null,
      createElement('label', { style: { fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' } }, `Font Size: ${fontSize}px`),
      createElement('input', {
        type: 'range', min: '10', max: '24', value: String(fontSize),
        onInput: (e: Event) => setFontSize(Number((e.target as HTMLInputElement).value)),
        style: { width: '100%' },
      }),
    ),
    createElement('div', {
      style: {
        padding: '12px',
        borderRadius: '6px',
        fontSize: `${fontSize}px`,
        background: dark ? '#1e293b' : '#f8fafc',
        color: dark ? '#e2e8f0' : '#0f172a',
        border: '1px solid #e2e8f0',
      },
    }, `Preview text at ${fontSize}px`),
  );
}

function SearchSuggestions() {
  const items = ['React', 'SpecifyJS', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact', 'Lit', 'Qwik', 'Astro'];
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');

  const matches = query.length > 0
    ? items.filter(i => i.toLowerCase().includes(query.toLowerCase()))
    : [];

  return createElement('div', null,
    createElement('input', {
      type: 'text', value: query, placeholder: 'Search frameworks...',
      onInput: (e: Event) => { setQuery((e.target as HTMLInputElement).value); setSelected(''); },
      style: inputStyle(),
    }),
    matches.length > 0 && !selected
      ? createElement('ul', { style: { listStyle: 'none', border: '1px solid #e2e8f0', borderRadius: '0 0 6px 6px', borderTop: 'none', maxHeight: '120px', overflowY: 'auto' } },
          ...matches.map(m =>
            createElement('li', {
              key: m,
              role: 'option',
              onClick: () => { setSelected(m); setQuery(m); },
              style: { padding: '6px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f1f5f9' },
            }, m),
          ),
        )
      : null,
    selected
      ? createElement('p', { style: { fontSize: '13px', color: '#16a34a', marginTop: '8px' } }, `Selected: ${selected}`)
      : null,
  );
}

function MultiStepWizard() {
  const [step, setStep] = useState(0);
  const steps = ['Account', 'Profile', 'Confirm'];

  const stepIndicator = createElement('div', { style: { display: 'flex', gap: '4px', marginBottom: '16px' } },
    ...steps.map((s, i) =>
      createElement('div', {
        key: s,
        style: {
          flex: '1', height: '4px', borderRadius: '2px',
          backgroundColor: i <= step ? '#3b82f6' : '#e2e8f0',
          transition: 'background-color 0.2s',
        },
      }),
    ),
  );

  const content = createElement('div', { style: { textAlign: 'center', padding: '16px 0', fontSize: '14px', color: '#64748b' } },
    `Step ${step + 1}: ${steps[step]}`,
  );

  return createElement('div', null,
    stepIndicator,
    content,
    createElement('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center' } },
      step > 0
        ? createElement('button', { onClick: () => setStep(step - 1), style: btnStyle() }, 'Back')
        : null,
      step < steps.length - 1
        ? createElement('button', { onClick: () => setStep(step + 1), style: { ...btnStyle(), backgroundColor: '#3b82f6', color: 'white', border: 'none' } }, 'Next')
        : createElement('button', { onClick: () => setStep(0), style: { ...btnStyle(), backgroundColor: '#16a34a', color: 'white', border: 'none' } }, 'Finish'),
    ),
  );
}

function field(label: string, value: string, onChange: (v: string) => void, error: string | undefined, type: string, placeholder: string) {
  return createElement('div', null,
    createElement('label', { style: { fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' } }, label),
    createElement('input', {
      type, value, placeholder,
      onInput: (e: Event) => onChange((e.target as HTMLInputElement).value),
      style: { ...inputStyle(), borderColor: error ? '#ef4444' : '#d1d5db' },
    }),
    error ? createElement('p', { style: { fontSize: '12px', color: '#ef4444', marginTop: '2px' } }, error) : null,
  );
}

function toggleRow(label: string, on: boolean, onClick: () => void) {
  return createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
    createElement('span', { style: { fontSize: '14px' } }, label),
    createElement('div', { className: 'demo-toggle', onClick, role: 'button', tabIndex: 0 },
      createElement('div', { className: `demo-toggle-track ${on ? 'on' : ''}` },
        createElement('div', { className: 'demo-toggle-thumb' }),
      ),
    ),
  );
}

function inputStyle() {
  return { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' as const };
}

function btnStyle() {
  return { padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', backgroundColor: '#f8fafc' };
}
