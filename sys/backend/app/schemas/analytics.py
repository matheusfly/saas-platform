from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ActivityBase(BaseModel):
    description: str
    date: datetime

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int
    customer_id: int

    class Config:
        orm_mode = True