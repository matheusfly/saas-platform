import json
from app.schemas import customer, sales, productivity, analytics

schemas = [
    customer.Customer,
    sales.SalesFunnel,
    sales.Transaction,
    productivity.WorkLog,
    productivity.Teacher,
    productivity.ScheduleEntry,
    analytics.Activity,
]

json_schemas = [s.schema_json(indent=2) for s in schemas]

with open("../docs/schema_diagrams/schema.json", "w") as f:
    f.write(json.dumps(json_schemas, indent=2))