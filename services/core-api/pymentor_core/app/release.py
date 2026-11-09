"""Expose the non-secret source revision for release verification."""
import os
import re


class ReleaseRevisionMiddleware:
    def __init__(self, app):
        self.app = app
        revision = os.getenv('PYMENTOR_RELEASE_REVISION', '')
        if revision and not re.fullmatch(r'[A-Za-z0-9._-]{1,64}', revision):
            raise ValueError('Invalid release revision')
        self.revision = revision.encode('ascii')

    async def __call__(self, scope, receive, send):
        async def send_revision(message):
            if message['type'] == 'http.response.start' and self.revision:
                message = dict(message)
                message['headers'] = list(message.get('headers', [])) + [(b'x-pymentor-revision', self.revision)]
            await send(message)
        await self.app(scope, receive, send_revision)
