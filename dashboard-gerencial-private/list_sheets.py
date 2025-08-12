import openpyxl
workbook = openpyxl.load_workbook('D:/codex/master_code/base/bi_dash/gerencial/dashboard_gerencial/bi_dash/datasets/clientes.xlsx')
print(workbook.sheetnames)
