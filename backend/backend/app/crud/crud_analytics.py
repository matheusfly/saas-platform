from sqlalchemy.orm import Session
from ..models import analytics as models
from ..schemas import analytics as schemas

def get_activities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Activity).offset(skip).limit(limit).all()

def create_activity(db: Session, activity: schemas.ActivityCreate, customer_id: int):
    db_activity = models.Activity(**activity.dict(), customer_id=customer_id)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity