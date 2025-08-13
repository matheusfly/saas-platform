from sqlalchemy.orm import Session
from .. import models
from ..schemas import productivity as schemas

# CRUD for Teacher
def get_teacher(db: Session, teacher_id: str):
    return db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()

def get_teachers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Teacher).offset(skip).limit(limit).all()

def create_teacher(db: Session, teacher: schemas.TeacherCreate):
    db_teacher = models.Teacher(**teacher.dict())
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

# CRUD for WorkLog
def get_work_log(db: Session, work_log_id: str):
    return db.query(models.WorkLog).filter(models.WorkLog.id == work_log_id).first()

def get_work_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.WorkLog).offset(skip).limit(limit).all()

def create_work_log(db: Session, work_log: schemas.WorkLogCreate):
    db_work_log = models.WorkLog(**work_log.dict())
    db.add(db_work_log)
    db.commit()
    db.refresh(db_work_log)
    return db_work_log

# CRUD for ScheduleEntry
def get_schedule_entry(db: Session, schedule_entry_id: str):
    return db.query(models.ScheduleEntry).filter(models.ScheduleEntry.id == schedule_entry_id).first()

def get_schedule_entries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ScheduleEntry).offset(skip).limit(limit).all()

def create_schedule_entry(db: Session, schedule_entry: schemas.ScheduleEntryCreate):
    db_schedule_entry = models.ScheduleEntry(**schedule_entry.dict())
    db.add(db_schedule_entry)
    db.commit()
    db.refresh(db_schedule_entry)
    return db_schedule_entry
