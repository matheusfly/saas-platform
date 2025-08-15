from enum import Enum

class TipoAtividadeEnum(str, Enum):
    call = "call"
    email = "email"
    meeting = "meeting"

class TipoFinanceiroEnum(str, Enum):
    revenue = "revenue"
    expense = "expense"

class MetodoPagamentoEnum(str, Enum):
    credit_card = "credit_card"
    bank_transfer = "bank_transfer"
    paypal = "paypal"

class StatusPagamentoEnum(str, Enum):
    paid = "paid"
    pending = "pending"
    failed = "failed"
