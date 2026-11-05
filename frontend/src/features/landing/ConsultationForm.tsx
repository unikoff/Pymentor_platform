import { useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Mail, MessageCircle, Phone, X } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import './consultation-form.css';

type ContactMethod = 'phone' | 'email' | 'telegram';

export function ConsultationForm() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestRef = useRef<{ payload: string; key: string } | null>(null);
  const [method, setMethod] = useState<ContactMethod>('phone');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const open = () => {
    if (success) {
      setName(''); setContact(''); setMethod('phone');
      setSuccess(false); requestRef.current = null;
    }
    setError('');
    dialogRef.current?.showModal();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const cleanedName = name.trim().replace(/\s+/g, ' ');
    let cleanedContact = contact.trim();
    if (cleanedName.length < 2) {
      setError('Пожалуйста, укажите имя: не менее двух символов.');
      return;
    }
    if (method === 'phone' && (!/^[+\d\s()\-]+$/.test(cleanedContact) || cleanedContact.replace(/\D/g, '').length < 7)) {
      setError('Пожалуйста, укажите корректный номер телефона.');
      return;
    }
    if (method === 'telegram') {
      if (!/^@?[a-zA-Z0-9_]{3,32}$/.test(cleanedContact)) {
        setError('Укажите юзернейм Telegram, например @username.');
        return;
      }
      cleanedContact = `@${cleanedContact.replace(/^@/, '')}`;
    }
    const body = { name: cleanedName, contact: cleanedContact, goal: '', consent: true, consent_version: 'consultation-v3' };
    const payload = JSON.stringify(body);
    if (!requestRef.current || requestRef.current.payload !== payload) {
      requestRef.current = { payload, key: crypto.randomUUID() };
    }
    setPending(true);
    setError('');
    try {
      const result = await apiRequest<{ accepted: boolean }>('/landings/backend/consultations', body, 'POST', {
        'Idempotency-Key': requestRef.current.key,
      });
      if (!result.accepted) throw new Error('Заявка не принята');
      setSuccess(true);
    } catch {
      setError('Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.');
    } finally {
      setPending(false);
    }
  };

  return <>
    <div className="consultation-actions">
      <button className="primary-action landing-action consultation-actions__primary" type="button" onClick={open}>Оставить заявку <ArrowRight size={17} aria-hidden="true" /></button>
      <a className="landing-action consultation-actions__telegram" href="https://t.me/unikoff" target="_blank" rel="noopener noreferrer">Написать в Telegram <span aria-hidden="true">↗</span></a>
    </div>
    <dialog ref={dialogRef} className="consultation-dialog" aria-labelledby="consultation-title" onCancel={(event) => { if (pending) event.preventDefault(); }}>
      <div className="consultation-dialog__body">
        <button className="consultation-dialog__close" type="button" aria-label="Закрыть форму" disabled={pending} onClick={() => dialogRef.current?.close()}><X size={19} aria-hidden="true" /></button>
        {success ? <div className="consultation-success" role="status">
          <span className="consultation-success__icon"><Check size={29} aria-hidden="true" /></span>
          <p className="consultation-dialog__eyebrow">Первый шаг сделан</p>
          <h2 id="consultation-title">Заявка отправлена</h2>
          <p>Спасибо! Я свяжусь с вами по указанным контактам, чтобы обсудить менторство.</p>
          <button className="primary-action landing-action consultation-form__submit" type="button" onClick={() => dialogRef.current?.close()}>Понятно <Check size={17} aria-hidden="true" /></button>
        </div> : <>
          <h2 id="consultation-title">Оставить заявку</h2>
          <form className="consultation-form" onSubmit={submit}>
            <label className="consultation-form__field">Как к вам обращаться
              <input autoFocus required minLength={2} maxLength={80} autoComplete="name" placeholder="Ваше имя" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <fieldset className="consultation-form__methods"><legend>Как с вами связаться?</legend>
              <div>{(['phone', 'email', 'telegram'] as const).map((option) => <button key={option} type="button" className={method === option ? 'is-selected' : ''} aria-pressed={method === option} onClick={() => { setMethod(option); setContact(''); setError(''); }}>
                {option === 'phone' ? <Phone size={16} aria-hidden="true" /> : option === 'email' ? <Mail size={16} aria-hidden="true" /> : <MessageCircle size={16} aria-hidden="true" />}{option === 'phone' ? 'Телефон' : option === 'email' ? 'Email' : 'Telegram'}
              </button>)}</div>
            </fieldset>
            <label className="consultation-form__field">{method === 'phone' ? 'Номер телефона' : method === 'email' ? 'Электронная почта' : 'Юзернейм в Telegram'}
              <input required type={method === 'phone' ? 'tel' : method === 'email' ? 'email' : 'text'} maxLength={method === 'telegram' ? 33 : 120} autoComplete={method === 'phone' ? 'tel' : method === 'email' ? 'email' : 'off'} placeholder={method === 'phone' ? '+7 (999) 000-00-00' : method === 'email' ? 'you@example.com' : '@username'} value={contact} onChange={(event) => setContact(event.target.value)} />
            </label>
            {error && <p className="consultation-form__error" role="alert">{error}</p>}
            <button className="primary-action landing-action consultation-form__submit" type="submit" disabled={pending}>{pending ? 'Отправляем…' : 'Оставить заявку'} <ArrowRight size={17} aria-hidden="true" /></button>
            <p className="consultation-form__consent">Нажимая на кнопку «Оставить заявку», вы соглашаетесь на <a href={`${import.meta.env.BASE_URL}backend/personal-data`} target="_blank" rel="noopener noreferrer">обработку персональных данных</a>.</p>
          </form>
        </>}
      </div>
    </dialog>
  </>;
}
