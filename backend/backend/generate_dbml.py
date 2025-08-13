from sqlalchemy_dbml import DBML
from app.core.database import Base

with open("../docs/schema_diagrams/schema.dbml", "w") as f:
    f.write(DBML(Base).render())