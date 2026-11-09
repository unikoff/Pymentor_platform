import asyncio
import os
import unittest
from unittest.mock import patch
from pymentor_core.app.release import ReleaseRevisionMiddleware

class ReleaseTests(unittest.TestCase):
    def test_revision_is_emitted_without_changing_response(self):
        async def app(scope, receive, send):
            await send({'type':'http.response.start','status':200,'headers':[(b'content-type',b'application/json')]})
            await send({'type':'http.response.body','body':b'{}'})
        messages=[]
        async def send(m):messages.append(m)
        with patch.dict(os.environ,{'PYMENTOR_RELEASE_REVISION':'a'*40}):
            asyncio.run(ReleaseRevisionMiddleware(app)({'type':'http'},None,send))
        self.assertEqual(messages[0]['status'],200)
        self.assertIn((b'x-pymentor-revision',b'a'*40),messages[0]['headers'])
        self.assertEqual(messages[1]['body'],b'{}')

    def test_header_injection_is_rejected(self):
        with patch.dict(os.environ,{'PYMENTOR_RELEASE_REVISION':'bad\r\nx: y'}):
            with self.assertRaises(ValueError):ReleaseRevisionMiddleware(None)
