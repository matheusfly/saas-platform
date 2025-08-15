from sadisplay import describe
from app.models import customer, sales, productivity, analytics

with open("../docs/schema_diagrams/schema.plantuml", "w") as f:
    f.write(
        "\n".join(
            describe(
                [
                    customer.Customer,
                    sales.SalesFunnel,
                    sales.Transaction,
                    productivity.WorkLog,
                    productivity.Teacher,
                    productivity.ScheduleEntry,
                    analytics.Activity,
                ]
            )
        )
    )