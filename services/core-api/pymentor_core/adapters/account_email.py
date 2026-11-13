"""Small synchronous SMTP adapter for account links."""

from dataclasses import dataclass, field
from email.message import EmailMessage
from html import escape
import smtplib
import ssl
from urllib.parse import urlencode, urlsplit, urlunsplit


@dataclass(frozen=True)
class EmailConfig:
    host: str
    port: int
    sender: str
    public_url: str
    username: str = field(default="", repr=False)
    password: str = field(default="", repr=False)
    starttls: bool = True


def account_link(public_url: str, purpose: str, token: str) -> str:
    if purpose not in {"verify_email", "change_password", "reset_password", "change_email", "change_email_dual"}:
        raise ValueError("Unknown account-link purpose")
    parts = urlsplit(public_url)
    local = parts.hostname in {"localhost", "127.0.0.1", "::1"}
    if (not parts.hostname or parts.username or parts.password or parts.query or parts.fragment
            or (parts.scheme != "https" and not (parts.scheme == "http" and local))):
        raise ValueError("Invalid public URL for account links")
    return urlunsplit((parts.scheme, parts.netloc, parts.path,
                       urlencode({"email_action": "change_email" if purpose == "change_email_dual" else purpose}), urlencode({"token": token})))


def _email_content(purpose: str, link: str, new_email: str | None = None, side: str | None = None) -> tuple[str, str, str]:
    if purpose == "verify_email":
        subject = "Подтвердите почту в knowi"
        title = "Подтвердите почту"
        intro = "Подтвердите адрес, чтобы восстановить доступ, если забудете пароль."
        action = "Подтвердить почту"
        detail = "Ссылка действует 24 часа."
        ignore = "Не запрашивали письмо? Просто удалите его."
    elif purpose in {"change_email", "change_email_dual"}:
        subject = "Подтвердите смену почты в knowi"
        title = "Смена почты"
        intro = (f"Вы запросили смену адреса на {new_email}. Подтвердите текущую почту."
                 if side != "new" else
                 "Вы указали этот адрес как новую почту аккаунта. Подтвердите его.")
        action = "Подтвердить почту"
        detail = "Ссылка действует 30 минут."
        ignore = "Почта изменится только после подтверждения обоих адресов. Не запрашивали смену? Удалите письмо."
    elif purpose in {"change_password", "reset_password"}:
        subject = "Установите новый пароль в knowi"
        title = "Новый пароль"
        intro = ("Вы запросили смену пароля."
                 if purpose == "change_password" else
                 "Вы запросили восстановление доступа.")
        action = "Установить новый пароль"
        detail = "Ссылка действует 30 минут."
        ignore = "Не запрашивали письмо? Просто удалите его. Пароль не изменится."
    else:
        raise ValueError("Unknown account-link purpose")

    plain = (f"{title}\n\n{intro}\n\n{action}:\n{link}\n\n{detail}\n\n{ignore}"
             "\n\nС заботой о вашем обучении, команда knowi"
             "\nЭто автоматическое письмо. Ответы на него не обрабатываются.")
    safe_link = escape(link, quote=True)
    html = f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<style>
@media (prefers-color-scheme: dark) {{
  .email-body, .email-background {{ background-color:#1b1b1b !important; }}
  .email-card {{ background-color:#202020 !important; border-color:#343434 !important; }}
  .email-heading, .email-brand {{ color:#e0e0e0 !important; }}
  .email-copy {{ color:#c8c8c8 !important; }}
  .email-muted {{ color:#a0a0a0 !important; }}
  .email-dot {{ color:#b7ff5a !important; }}
  .email-footer {{ border-color:#343434 !important; }}
  .email-button {{ background-color:#b7ff5a !important; color:#202020 !important; }}
}}
</style></head>
<body class="email-body" style="margin:0;padding:0;background:#ededed;color:#414141;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;overflow:hidden;opacity:0;">{escape(intro)}</div>
  <table class="email-background" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#ededed;"><tr><td align="center" style="padding:24px 16px;">
    <table class="email-card" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;border-collapse:separate;border-spacing:0;background:#f4f4f4;border:1px solid #d5d5d5;border-radius:16px;">
      <tr><td style="padding:26px 28px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
        <td class="email-brand" style="font-size:23px;font-weight:800;letter-spacing:-1px;color:#414141;white-space:nowrap;">knowi<span class="email-dot" style="color:#416622;">.</span></td>
        <td align="right" style="padding-left:16px;"><h1 class="email-heading" style="margin:0;font-size:18px;line-height:1.25;letter-spacing:-0.3px;color:#414141;">{escape(title)}</h1></td>
      </tr></table></td></tr>
      <tr><td class="email-copy" style="padding:20px 28px 0;font-size:15px;line-height:1.4;color:#494949;">{escape(intro)}</td></tr>
      <tr><td style="padding:16px 28px 0;"><a class="email-button" href="{safe_link}" style="display:inline-block;padding:12px 14px;border-radius:9px;background:#b7ff5a;color:#202020;font-size:13px;line-height:20px;font-weight:700;text-decoration:none;white-space:nowrap;">{escape(action)} &rarr;</a></td></tr>
      <tr><td class="email-muted" style="padding:10px 28px 0;font-size:11px;line-height:1.4;color:#616161;">{escape(detail)}</td></tr>
      <tr><td class="email-muted" style="padding:10px 28px 18px;font-size:13px;line-height:1.4;color:#616161;">{escape(ignore)}</td></tr>
      <tr><td class="email-muted email-footer" style="padding:14px 28px 18px;border-top:1px solid #d5d5d5;font-size:12px;line-height:1.4;color:#616161;">С заботой о вашем обучении, команда knowi<br>Это автоматическое письмо. Ответы на него не обрабатываются.</td></tr>
    </table>
  </td></tr></table>
</body></html>'''
    return subject, plain, html


def send_account_email(config: EmailConfig, recipient: str, purpose: str, token: str,
                       *, smtp_factory=smtplib.SMTP, new_email: str | None = None, side: str | None = None) -> None:
    if not config.host or not config.sender or not recipient or bool(config.username) != bool(config.password):
        raise ValueError("Email transport is not configured")
    if not config.starttls and config.host not in {"127.0.0.1", "localhost", "::1"}:
        raise ValueError("Unencrypted SMTP is restricted to loopback")
    link = account_link(config.public_url, purpose, token)
    message = EmailMessage()
    message["From"] = config.sender
    message["To"] = recipient
    subject, plain, html = _email_content(purpose, link, new_email, side)
    message["Subject"] = subject
    message.set_content(plain)
    message.add_alternative(html, subtype="html")
    try:
        connection = smtp_factory(config.host, config.port, timeout=10)
    except (OSError, smtplib.SMTPServerDisconnected):
        # Only retry connection setup: after DATA the delivery outcome may be unknown.
        connection = smtp_factory(config.host, config.port, timeout=10)
    with connection as smtp:
        if config.starttls:
            smtp.starttls(context=ssl.create_default_context())
        if config.username:
            smtp.login(config.username, config.password)
        smtp.send_message(message)
