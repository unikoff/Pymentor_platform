"""Allow the old hosting PYTHONPATH=backend to find the single Core package."""
from _core_entrypoint import activate_core_package
activate_core_package()
