from datetime import date
from typing import Literal
from pydantic import BaseModel, constr


class SlotCreate(BaseModel):
    slot_date: date
    start_time: constr(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")  # "HH:MM"
    duration_minutes: Literal[60, 90, 120] = 60
