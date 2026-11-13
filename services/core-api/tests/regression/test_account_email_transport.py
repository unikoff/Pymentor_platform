"""Email delivery uses a configured destination and keeps secrets out of URLs."""

import importlib.util
import socketserver
import threading
from email import policy
from email.parser import BytesParser

import pytest


def transport():
    assert importlib.util.find_spec("pymentor_core.adapters.account_email") is not None
    from pymentor_core.adapters import account_email
    return account_email


def test_link_contains_action_and_token_in_fragment():
    email = transport()
    link = email.account_link("https://example.test/app", "reset_password", "synthetic-token")
    assert link == "https://example.test/app?email_action=reset_password#token=synthetic-token"


@pytest.mark.parametrize("url", ["http://example.test/app", "https://example.test/app?x=1", "https://a:b@example.test/app"])
def test_link_rejects_untrusted_public_url_configuration(url):
    email = transport()
    with pytest.raises(ValueError):
        email.account_link(url, "verify_email", "synthetic-token")


def test_mail_transport_uses_configured_destination_and_tls():
    email = transport()
    events = []

    class FakeSMTP:
        def __init__(self, host, port, timeout):
            events.append(("connect", host, port, timeout))
        def __enter__(self): return self
        def __exit__(self, *_args): pass
        def starttls(self, **_kwargs): events.append(("tls",))
        def login(self, username, password): events.append(("login", username, password))
        def send_message(self, message): events.append(("send", message))

    config = email.EmailConfig("smtp.example.test", 587, "robot@example.test", "https://example.test/app", "user", "pass", True)
    email.send_account_email(config, "student@example.test", "verify_email", "synthetic-token", smtp_factory=FakeSMTP)
    assert events[0] == ("connect", "smtp.example.test", 587, 10)
    assert events[1] == ("tls",)
    message = events[-1][1]
    assert message["To"] == "student@example.test"
    assert "synthetic-token" in message.get_body(preferencelist=("plain",)).get_content()


def test_plain_smtp_is_only_allowed_for_loopback():
    email = transport()
    config = email.EmailConfig("smtp.example.test", 25, "robot@example.test", "https://example.test/app", starttls=False)

    class FakeSMTP:
        def __init__(self, *_args, **_kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *_args): pass
        def send_message(self, _message): pass

    with pytest.raises(ValueError):
        email.send_account_email(config, "student@example.test", "verify_email", "synthetic-token", smtp_factory=FakeSMTP)


def test_transient_connection_failure_is_retried_before_any_email_is_sent():
    email = transport()
    attempts = []
    sent = []

    class FakeSMTP:
        def __init__(self, *_args, **_kwargs):
            attempts.append(1)
            if len(attempts) == 1:
                raise OSError("temporary DNS failure")
        def __enter__(self): return self
        def __exit__(self, *_args): pass
        def send_message(self, message): sent.append(message)

    config = email.EmailConfig("localhost", 25, "robot@example.test", "http://localhost:5173/backend", starttls=False)
    email.send_account_email(config, "student@example.test", "verify_email", "synthetic-token", smtp_factory=FakeSMTP)
    assert len(attempts) == 2
    assert len(sent) == 1


def test_failed_send_is_not_retried_when_delivery_outcome_is_unknown():
    email = transport()
    attempts = []

    class FakeSMTP:
        def __init__(self, *_args, **_kwargs): attempts.append("connect")
        def __enter__(self): return self
        def __exit__(self, *_args): pass
        def send_message(self, _message): raise OSError("connection lost while sending")

    config = email.EmailConfig("localhost", 25, "robot@example.test", "http://localhost:5173/backend", starttls=False)
    with pytest.raises(OSError):
        email.send_account_email(config, "student@example.test", "verify_email", "synthetic-token", smtp_factory=FakeSMTP)
    assert attempts == ["connect"]


def test_real_local_smtp_receives_account_email():
    email = transport()
    received = []

    class Sink(socketserver.StreamRequestHandler):
        def handle(self):
            self.wfile.write(b"220 local test SMTP\r\n")
            data_mode = False
            content = []
            while line := self.rfile.readline():
                if data_mode:
                    if line == b".\r\n":
                        received.append(b"".join(content))
                        data_mode = False
                        self.wfile.write(b"250 accepted\r\n")
                    else:
                        content.append(line)
                elif line.upper().startswith((b"EHLO", b"HELO")):
                    self.wfile.write(b"250-localhost\r\n250 HELP\r\n")
                elif line.upper().startswith(b"DATA"):
                    data_mode = True
                    self.wfile.write(b"354 send data\r\n")
                elif line.upper().startswith(b"QUIT"):
                    self.wfile.write(b"221 bye\r\n")
                    break
                else:
                    self.wfile.write(b"250 ok\r\n")
                self.wfile.flush()

    with socketserver.TCPServer(("127.0.0.1", 0), Sink) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            config = email.EmailConfig("127.0.0.1", server.server_address[1], "robot@example.test", "http://localhost:5173/backend", starttls=False)
            email.send_account_email(config, "student@example.test", "verify_email", "synthetic-token")
        finally:
            server.shutdown()
            thread.join(timeout=5)
    assert len(received) == 1
    assert b"student@example.test" in received[0]
    message = BytesParser(policy=policy.default).parsebytes(received[0])
    assert "synthetic-token" in message.get_body(preferencelist=("plain",)).get_content()


@pytest.mark.parametrize("purpose,action,expiry", [
    ("verify_email", "Подтвердить почту", "24 часа"),
    ("change_password", "Установить новый пароль", "30 минут"),
    ("reset_password", "Установить новый пароль", "30 минут"),
])
def test_account_messages_have_plain_fallback_and_html_action(purpose, action, expiry):
    email = transport()
    sent = []

    class FakeSMTP:
        def __init__(self, *_args, **_kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *_args): pass
        def send_message(self, message): sent.append(message)

    config = email.EmailConfig("localhost", 25, "robot@example.test", "http://localhost:5173/backend", starttls=False)
    email.send_account_email(config, "student@example.test", purpose, 'token"<&', smtp_factory=FakeSMTP)
    message = sent[0]
    plain = message.get_body(preferencelist=("plain",)).get_content()
    html = message.get_body(preferencelist=("html",)).get_content()
    expected_link = email.account_link(config.public_url, purpose, 'token"<&')
    assert expected_link in plain
    assert f'href="{expected_link.replace("&", "&amp;")}"' in html
    assert action in html and expiry in html and expiry in plain
    assert "Это автоматическое письмо. Ответы на него не обрабатываются." in html
    assert "Это автоматическое письмо. Ответы на него не обрабатываются." in plain
    assert "С заботой о вашем обучении," in html and "С заботой о вашем обучении," in plain
    assert "команда knowi" in html and "команда knowi" in plain
    assert "сеанс сохранится" not in html and "сеанс сохранится" not in plain
    assert "pymentor" not in html.lower() and "pymentor" not in plain.lower()
    assert "pymentor" not in str(message["Subject"]).lower()
    assert "<script" not in html
def test_email_change_content_identifies_new_address_and_is_escaped():
    from pymentor_core.adapters.account_email import _email_content, account_link
    link = account_link("https://example.test/backend", "change_email", "synthetic-token")
    subject, plain, html = _email_content("change_email", link, "new&mail@example.test")
    assert "смен" in subject.lower()
    assert "new&mail@example.test" in plain
    assert "new&amp;mail@example.test" in html
    assert "email_action=change_email" in html
