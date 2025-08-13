from sqlalchemy.orm import Session
from .. import models
from ..schemas import business_intelligence as schemas

# CRUD for DimUsuario
def get_usuario(db: Session, usuario_id: int):
    return db.query(models.DimUsuario).filter(models.DimUsuario.id == usuario_id).first()

def get_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DimUsuario).offset(skip).limit(limit).all()

def create_usuario(db: Session, usuario: schemas.DimUsuarioCreate):
    db_usuario = models.DimUsuario(**usuario.dict())
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

# CRUD for DimEmpresa
def get_empresa(db: Session, empresa_id: int):
    return db.query(models.DimEmpresa).filter(models.DimEmpresa.id == empresa_id).first()

def get_empresas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DimEmpresa).offset(skip).limit(limit).all()

def create_empresa(db: Session, empresa: schemas.DimEmpresaCreate):
    db_empresa = models.DimEmpresa(**empresa.dict())
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

# ... and so on for all the other models
