from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ... import crud
from ...schemas import productivity as schemas
from ..deps import get_db

router = APIRouter()

@router.get("/teachers/", response_model=List[schemas.Teacher])
def read_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    teachers = crud.crud_productivity.get_teachers(db, skip=skip, limit=limit)
    return teachers

@router.get("/work_logs/", response_model=List[schemas.WorkLog])
def read_work_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    work_logs = crud.crud_productivity.get_work_logs(db, skip=skip, limit=limit)
    return work_logs

@router.get("/schedule_entries/", response_model=List[schemas.ScheduleEntry])
def read_schedule_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    schedule_entries = crud.crud_productivity.get_schedule_entries(db, skip=skip, limit=limit)
    return schedule_entries
