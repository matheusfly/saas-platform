from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from ..database.base import Base
import enum

class DimUsuario(Base):
    __tablename__ = 'dim_usuario'
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)

class DimEmpresa(Base):
    __tablename__ = 'dim_empresa'
    id = Column(Integer, primary_key=True, index=True)
    nome_empresa = Column(String, index=True)
    segmento = Column(String, index=True)

class DimPessoa(Base):
    __tablename__ = 'dim_pessoa'
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    empresa_id = Column(Integer, ForeignKey('dim_empresa.id'))
    empresa = relationship("DimEmpresa")

class DimEstagio(Base):
    __tablename__ = 'dim_estagio'
    id = Column(Integer, primary_key=True, index=True)
    estagio_nome = Column(String, unique=True, index=True)
    ordem = Column(Integer)

class DimOrigem(Base):
    __tablename__ = 'dim_origem'
    id = Column(Integer, primary_key=True, index=True)
    origem_nome = Column(String, unique=True, index=True)

class FatoOportunidades(Base):
    __tablename__ = 'fato_oportunidades'
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey('dim_empresa.id'))
    person_id = Column(Integer, ForeignKey('dim_pessoa.id'))
    user_id = Column(Integer, ForeignKey('dim_usuario.id'))
    data_criacao = Column(DateTime)
    data_encerramento = Column(DateTime, nullable=True)
    stage_id = Column(Integer, ForeignKey('dim_estagio.id'))
    valor = Column(Float)
    origem_id = Column(Integer, ForeignKey('dim_origem.id'))

    empresa = relationship("DimEmpresa")
    pessoa = relationship("DimPessoa")
    usuario = relationship("DimUsuario")
    estagio = relationship("DimEstagio")
    origem = relationship("DimOrigem")

class FatoMovimentacoes(Base):
    __tablename__ = 'fato_movimentacoes'
    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey('fato_oportunidades.id'))
    out_stage_id = Column(Integer, ForeignKey('dim_estagio.id'))
    in_stage_id = Column(Integer, ForeignKey('dim_estagio.id'))
    user_id = Column(Integer, ForeignKey('dim_usuario.id'))
    data_entrada = Column(DateTime)
    data_saida = Column(DateTime)

    oportunidade = relationship("FatoOportunidades")
    estagio_saida = relationship("DimEstagio", foreign_keys=[out_stage_id])
    estagio_entrada = relationship("DimEstagio", foreign_keys=[in_stage_id])
    usuario = relationship("DimUsuario")

class TipoAtividadeEnum(str, enum.Enum):
    email = "email"
    call = "call"
    meeting = "meeting"

class FatoAtividades(Base):
    __tablename__ = 'fato_atividades'
    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey('fato_oportunidades.id'))
    user_id = Column(Integer, ForeignKey('dim_usuario.id'))
    data_criacao = Column(DateTime)
    data_realizada = Column(DateTime)
    tipo_atividade = Column(SQLAlchemyEnum(TipoAtividadeEnum))

    oportunidade = relationship("FatoOportunidades")
    usuario = relationship("DimUsuario")

class TipoFinanceiroEnum(str, enum.Enum):
    entrada = "entrada"
    saida = "saida"

class MetodoPagamentoEnum(str, enum.Enum):
    dinheiro = "dinheiro"
    pix = "pix"
    cartao = "cartao"
    boleto = "boleto"

class StatusPagamentoEnum(str, enum.Enum):
    sucesso = "sucesso"
    falha = "falha"

class FatoFinanceiro(Base):
    __tablename__ = 'fato_financeiro'
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey('dim_empresa.id'), nullable=True)
    data = Column(DateTime)
    valor = Column(Float)
    tipo = Column(SQLAlchemyEnum(TipoFinanceiroEnum))
    metodo = Column(SQLAlchemyEnum(MetodoPagamentoEnum), nullable=True)
    status = Column(SQLAlchemyEnum(StatusPagamentoEnum))

    empresa = relationship("DimEmpresa")
