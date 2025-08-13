from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import enum

class TeacherType(str, enum.Enum):
    TITULAR = 'Titular'
    AUXILIAR = 'Auxiliar'

class ClassType(str, enum.Enum):
    CALISTENIA = 'Calistenia'
    ESCALADA = 'Escalada'
    BOTH = 'Ambos'
    PONTO = 'Ponto'

class TeacherBase(BaseModel):
    name: str
    type: TeacherType
    contractedHours: int

class TeacherCreate(TeacherBase):
    pass

class Teacher(TeacherBase):
    id: str

    class Config:
        orm_mode = True

class StudentBase(BaseModel):
    name: str

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: str

    class Config:
        orm_mode = True

class ScheduleEntryBase(BaseModel):
    teacherId: str
    studentIds: List[str]
    startTime: datetime
    endTime: datetime
    day: int
    classType: ClassType
    workLogId: Optional[str] = None
    isUnplanned: Optional[bool] = False

class ScheduleEntryCreate(ScheduleEntryBase):
    pass

class ScheduleEntry(ScheduleEntryBase):
    id: str

    class Config:
        orm_mode = True

class WorkLogBase(BaseModel):
    teacherId: str
    checkIn: datetime
    checkOut: Optional[datetime] = None

class WorkLogCreate(WorkLogBase):
    pass

class WorkLog(WorkLogBase):
    id: str

    class Config:
        orm_mode = True
