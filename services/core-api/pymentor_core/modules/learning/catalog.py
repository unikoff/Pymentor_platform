"""CourseCatalog/LessonContent/PracticeSpec port facade; no file or SQL access."""

from pymentor_core.shared.bindings import get_bindings


def default_track_id(*args, **kwargs):
    return get_bindings().content.default_track_id(*args, **kwargs)


def find_lesson(*args, **kwargs):
    return get_bindings().content.find_lesson(*args, **kwargs)


def find_lesson_by_task(*args, **kwargs):
    return get_bindings().content.find_lesson_by_task(*args, **kwargs)


def find_task(*args, **kwargs):
    return get_bindings().content.find_task(*args, **kwargs)


def get_content_revision(*args, **kwargs):
    return get_bindings().content.get_content_revision(*args, **kwargs)


def find_track(*args, **kwargs):
    return get_bindings().content.find_track(*args, **kwargs)


def get_public_lessons(*args, **kwargs):
    return get_bindings().content.get_public_lessons(*args, **kwargs)


def get_tracks_summary(*args, **kwargs):
    return get_bindings().content.get_tracks_summary(*args, **kwargs)
