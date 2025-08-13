from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from .enums import TipoAtividadeEnum, TipoFinanceiroEnum, MetodoPagamentoEnum, StatusPagamentoEnum

# DimUsuario
class DimUsuarioBase(BaseModel):
    nome: str
    email: str

class DimUsuarioCreate(DimUsuarioBase):
    pass

class DimUsuario(DimUsuarioBase):
    id: int

    class Config:
        orm_mode = True

# DimEmpresa
class DimEmpresaBase(BaseModel):
    nome_empresa: str
    segmento: str

class DimEmpresaCreate(DimEmpresaBase):
    pass

class DimEmpresa(DimEmpresaBase):
    id: int

    class Config:
        orm_mode = True

# DimPessoa
class DimPessoaBase(BaseModel):
    nome: str
    empresa_id: int

class DimPessoaCreate(DimPessoaBase):
    pass

class DimPessoa(DimPessoaBase):
    id: int

    class Config:
        orm_mode = True

# DimEstagio
class DimEstagioBase(BaseModel):
    estagio_nome: str
    ordem: int

class DimEstagioCreate(DimEstagioBase):
    pass

class DimEstagio(DimEstagioBase):
    id: int

    class Config:
        orm_mode = True

# DimOrigem
class DimOrigemBase(BaseModel):
    origem_nome: str

class DimOrigemCreate(DimOrigemBase):
    pass

class DimOrigem(DimOrigemBase):
    id: int

    class Config:
        orm_mode = True

# FatoOportunidades
class FatoOportunidadesBase(BaseModel):
    company_id: int
    person_id: int
    user_id: int
    data_criacao: datetime
    data_encerramento: Optional[datetime] = None
    stage_id: int
    valor: float
    origem_id: int

class FatoOportunidadesCreate(FatoOportunidadesBase):
    pass

class FatoOportunidades(FatoOportunidadesBase):
    id: int

    class Config:
        orm_mode = True

# FatoMovimentacoes
class FatoMovimentacoesBase(BaseModel):
    deal_id: int
    out_stage_id: int
    in_stage_id: int
    user_id: int
    data_entrada: datetime
    data_saida: datetime

class FatoMovimentacoesCreate(FatoMovimentacoesBase):
    pass

class FatoMovimentacoes(FatoMovimentacoesBase):
    id: int

    class Config:
        orm_mode = True

# FatoAtividades
class FatoAtividadesBase(BaseModel):
    deal_id: int
    user_id: int
    data_criacao: datetime
    data_realizada: datetime
    tipo_atividade: TipoAtividadeEnum

class FatoAtividadesCreate(FatoAtividadesBase):
    pass

class FatoAtividades(FatoAtividadesBase):
    id: int

    class Config:
        orm_mode = True

# FatoFinanceiro
class FatoFinanceiroBase(BaseModel):
    empresa_id: Optional[int] = None
    data: datetime
    valor: float
    tipo: TipoFinanceiroEnum
    metodo: Optional[MetodoPagamentoEnum] = None
    status: StatusPagamentoEnum

class FatoFinanceiroCreate(FatoFinanceiroBase):
    pass

class FatoFinanceiro(FatoFinanceiroBase):
    id: int

    class Config:
        orm_mode = True
