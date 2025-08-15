from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ... import models
from ...schemas import analytics as schemas
from ...crud import crud_analytics as crud
from .. import deps

router = APIRouter()

@router.post("/activities/", response_model=schemas.Activity)
def create_activity(
    activity: schemas.ActivityCreate,
    customer_id: int,
    db: Session = Depends(deps.get_db),
):
    return crud.create_activity(db=db, activity=activity, customer_id=customer_id)

@router.get("/activities/", response_model=List[schemas.Activity])
def read_activities(
    skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)
):
    activities = crud.get_activities(db, skip=skip, limit=limit)
    return activities