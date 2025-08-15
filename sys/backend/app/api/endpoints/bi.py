from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ... import crud
from ...schemas import business_intelligence as schemas
from ..deps import get_db

router = APIRouter()

@router.post("/usuarios/", response_model=schemas.DimUsuario)
def create_usuario(usuario: schemas.DimUsuarioCreate, db: Session = Depends(get_db)):
    return crud.crud_bi.create_usuario(db=db, usuario=usuario)

@router.get("/usuarios/", response_model=List[schemas.DimUsuario])
def read_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = crud.crud_bi.get_usuarios(db, skip=skip, limit=limit)
    return usuarios

@router.get("/usuarios/{usuario_id}", response_model=schemas.DimUsuario)
def read_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = crud.crud_bi.get_usuario(db, usuario_id=usuario_id)
    if db_usuario is None:
        raise HTTPException(status_code=404, detail="Usuario not found")
    return db_usuario

# Add similar endpoints for all other models...
