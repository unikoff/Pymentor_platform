"""Runner failures exposed at the practice boundary."""


class RunnerBusy(Exception):
    pass


class RunnerUnavailable(Exception):
    pass
