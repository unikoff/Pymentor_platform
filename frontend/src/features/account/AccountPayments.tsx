import { ArrowUpRight, CheckCircle2, Clock3, CreditCard, ReceiptText, ShieldCheck } from "lucide-react";
import type { UserProfile } from "../../shared/api/contracts";
import { formatSubscriptionDate } from "../../shared/lib/dates";

export interface AccountPaymentsData {
  planName: string;
  priceLabel: string;
  periodLabel: string;
  nextPaymentLabel: string | null;
  paymentMethodLabel: string | null;
  invoices: { id: string; dateLabel: string; description: string; amountLabel: string; statusLabel: string }[];
}

function formatPlanName(value?: string | null) {
  if (!value) return "Тариф не назначен";
  return value.charAt(0).toLocaleUpperCase("ru-RU") + value.slice(1);
}

export function AccountPayments({ user, data = null, onCheckout }: {
  user: Pick<UserProfile, "subscription_plan" | "subscription_until" | "has_active_subscription">;
  data?: AccountPaymentsData | null;
  onCheckout?: () => void;
}) {
  const hasActiveSubscription = user.has_active_subscription ?? false;
  const subscriptionEndDate = user.subscription_until ? formatSubscriptionDate(user.subscription_until) : null;
  const planName = data?.planName ?? formatPlanName(user.subscription_plan);

  return (
    <div className="account-section-stack">
      <div className="account-detail-grid account-detail-grid--payments">
        <section className={`account-surface account-plan-card ${hasActiveSubscription ? "is-active" : "is-inactive"}`}>
          <header className="account-plan-card__header">
            <span className="account-plan-card__icon"><CreditCard size={21} aria-hidden="true" /></span>
            <span className={`account-subscription-state ${hasActiveSubscription ? "is-active" : ""}`}>
              {hasActiveSubscription ? <><CheckCircle2 size={14} aria-hidden="true" /> Активна</> : <><Clock3 size={14} aria-hidden="true" /> Не активна</>}
            </span>
          </header>
          <div className="account-plan-card__name">
            <span>ВАША ПОДПИСКА</span>
            <h3>{planName}</h3>
          </div>
          <div className="account-plan-card__expiry">
            <span>{hasActiveSubscription ? "Доступ действует до" : subscriptionEndDate ? "Подписка закончилась" : "Срок действия"}</span>
            <strong>{subscriptionEndDate ?? "Не указан"}</strong>
          </div>
          {data?.priceLabel && (
            <div className="account-plan-card__price"><strong>{data.priceLabel}</strong><span>{data.periodLabel}</span></div>
          )}
          {onCheckout ? (
            <button className="account-plan-card__action" type="button" onClick={onCheckout}>
              Продлить подписку <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <p className="account-plan-card__note">Продление появится здесь после подключения онлайн-оплаты.</p>
          )}
        </section>

        <section className="account-surface account-detail-card account-payment-management">
          <header><div><h3>Управление оплатой</h3><p>Платёжные данные аккаунта</p></div><ShieldCheck size={19} aria-hidden="true" /></header>
          <dl className="account-payment-details">
            <div><dt>Следующий платёж</dt><dd>{data?.nextPaymentLabel ?? "Не настроен"}</dd></div>
            <div><dt>Способ оплаты</dt><dd>{data?.paymentMethodLabel ?? "Не добавлен"}</dd></div>
          </dl>
          <div className="account-payment-info">
            <span><ShieldCheck size={16} aria-hidden="true" /></span>
            <p>Способ оплаты и автопродление станут доступны после подключения платёжного сервиса.</p>
          </div>
        </section>
      </div>

      <section className="account-surface account-detail-card account-payment-history">
        <header><div><h3>История платежей</h3><p>Список операций по подписке</p></div><ReceiptText size={19} aria-hidden="true" /></header>
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
            <span className="account-empty-state__icon"><ReceiptText size={24} aria-hidden="true" /></span>
            <strong>Платежей пока нет</strong>
            <p>Когда появится онлайн-оплата, здесь будут даты, суммы и статусы операций.</p>
          </div>
        )}
      </section>
    </div>
  );
}
