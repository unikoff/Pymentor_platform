import { ArrowUpRight, CreditCard, ReceiptText, ShieldCheck } from "lucide-react";

export interface AccountPaymentsData {
  planName: string;
  priceLabel: string;
  periodLabel: string;
  nextPaymentLabel: string | null;
  paymentMethodLabel: string | null;
  invoices: { id: string; dateLabel: string; description: string; amountLabel: string; statusLabel: string }[];
}

export function AccountPayments({ data = null, onCheckout }: {
  data?: AccountPaymentsData | null;
  onCheckout?: () => void;
}) {
  return (
    <div className="account-section-stack">
      <header className="account-section-heading">
        <div><h2>Оплата и подписка</h2><p>Тариф, продление и история платежей.</p></div>
        {!data && <span className="account-coming-soon">Скоро</span>}
      </header>
      <div className="account-detail-grid account-detail-grid--payments">
        <section className="account-surface account-detail-card account-plan-card">
          <span className="account-plan-card__icon"><CreditCard size={23} aria-hidden="true" /></span>
          <div><span className="account-metric__label">Тариф</span><h3>{data?.planName ?? "—"}</h3></div>
          <div className="account-plan-card__price"><strong>{data?.priceLabel ?? "—"}</strong><span>{data?.periodLabel ?? "Стоимость появится позже"}</span></div>
          <button className="account-plan-card__action" type="button" disabled={!data || !onCheckout} onClick={onCheckout}>
            Выбрать тариф <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          {!onCheckout && <small>Онлайн-оплата пока недоступна</small>}
        </section>
        <section className="account-surface account-detail-card">
          <header><h3>Управление оплатой</h3><ShieldCheck size={18} aria-hidden="true" /></header>
          <dl className="account-payment-details">
            <div><dt>Следующий платёж</dt><dd>{data?.nextPaymentLabel ?? "—"}</dd></div>
            <div><dt>Способ оплаты</dt><dd>{data?.paymentMethodLabel ?? "—"}</dd></div>
          </dl>
          <p className="account-section-note">Здесь можно будет управлять продлением и способами оплаты подписки.</p>
        </section>
      </div>
      <section className="account-surface account-detail-card">
        <header><h3>История платежей</h3><span>Все операции в одном месте</span></header>
        {data?.invoices.length ? (
          <div className="account-invoices">
            {data.invoices.map((invoice) => (
              <div className="account-invoice" key={invoice.id}>
                <div><strong>{invoice.description}</strong><small>{invoice.dateLabel}</small></div>
                <span>{invoice.amountLabel}</span><span>{invoice.statusLabel}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="account-empty-state account-empty-state--compact">
            <span className="account-empty-state__icon"><ReceiptText size={26} aria-hidden="true" /></span>
            <strong>История платежей появится здесь</strong>
            <p>После подключения оплаты здесь будут отображаться операции по подписке.</p>
          </div>
        )}
      </section>
    </div>
  );
}
