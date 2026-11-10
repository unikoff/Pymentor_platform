"""Current file-backed course provider, behind the same future HTTP port."""

from pymentor_core.adapters.course_local import catalog


class LocalCourseProvider:
    default_track_id = staticmethod(catalog.default_track_id)
    find_lesson = staticmethod(catalog.find_lesson)
    find_lesson_by_task = staticmethod(catalog.find_lesson_by_task)
    find_task = staticmethod(catalog.find_task)
    get_content_revision = staticmethod(catalog.get_content_revision)
    find_track = staticmethod(catalog.find_track)
    get_public_lessons = staticmethod(catalog.get_public_lessons)
    get_tracks_summary = staticmethod(catalog.get_tracks_summary)
