import pandas as pd
import numpy as np
import re
from datetime import datetime
import logging
import os
from sqlalchemy.orm import Session
from app import crud
from app.schemas import customer as schemas

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("CustomerDataService")

def clean_monetary(value):
    if pd.isna(value) or value in [000, '000', '-', '']:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        if re.match(r'^\d{1,3}(\.\d{3})*,\d{2}$', value):
            return float(value.replace('.', '').replace(',', '.'))
        elif re.match(r'^\d{1,3}(,\d{3})*\.\d{2}$', value):
            return float(value.replace(',', ''))
        else:
            numeric_part = re.sub(r'[^\d,\.]', '', value)
            if numeric_part:
                # Complex logic to handle mixed separators
                if ',' in numeric_part and '.' in numeric_part:
                    if numeric_part.rfind(',') > numeric_part.rfind('.'):
                        return float(numeric_part.replace('.', '').replace(',', '.'))
                    else:
                        return float(numeric_part.replace(',', ''))
                elif ',' in numeric_part:
                    return float(numeric_part.replace('.', '').replace(',', '.'))
                elif '.' in numeric_part:
                    return float(numeric_part.replace(',', ''))
            return 0.0
    return 0.0

def load_and_process_data(db: Session):
    logger.info("Starting up and loading data from Excel files...")
    try:
        # Define file paths relative to the business-intelligence-dashboard
        base_path = '../business-intelligence-dashboard/datasets/'
        clientes_path = os.path.join(base_path, 'clientes.xlsx')
        fluxo_path = os.path.join(base_path, 'fluxo_caixa.xlsx')
        funil_path = os.path.join(base_path, 'funil_vendas.xlsx')

        # Check for files
        if not all(os.path.exists(p) for p in [clientes_path, fluxo_path, funil_path]):
            logger.warning("One or more data files are missing. API will run with empty data.")
            return

        # --- Data Extraction ---
        customers_df = pd.read_excel(clientes_path, header=None)
        # Simple extraction logic, assuming structure from previous analysis
        customers_records = []
        for i in range(1, len(customers_df)):
            row = customers_df.iloc[i]
            if pd.isna(row[1]): continue
            try:
                customer_id = str(int(float(row[1])))
                customers_records.append({
                    'customer_id': customer_id, 'name': str(row[2]),
                    'status': str(row[7]), 'email': str(row[8]), 'phone': str(row[9]),
                    'source': str(row[10])
                })
            except (ValueError, TypeError):
                logger.warning(f"Skipping row {i+1} in clientes.xlsx due to invalid customer ID: {row[1]}")
                continue
        customers_master = pd.DataFrame(customers_records)

        transactions_df = pd.read_excel(fluxo_path)
        sales_df = pd.read_excel(funil_path)

        # --- Data Cleaning & Transformation ---
        for col in ['Valor Unitário', 'Valor Total', 'Valor Desconto']:
            if col in transactions_df.columns:
                transactions_df[col] = transactions_df[col].apply(clean_monetary)
        if 'Data (Recibo)' in transactions_df.columns:
            transactions_df['Data (Recibo)'] = pd.to_datetime(transactions_df['Data (Recibo)'], errors='coerce')
        if 'Código' in transactions_df.columns:
            transactions_df['Código'] = transactions_df['Código'].astype(str)

        # --- Unifying Data ---
        customer_ids_from_master = set()
        if not customers_master.empty and 'customer_id' in customers_master.columns:
            customer_ids_from_master = set(customers_master['customer_id'].unique())

        customer_ids_from_transactions = set()
        if 'Código' in transactions_df.columns:
            customer_ids_from_transactions = set(transactions_df['Código'].unique())

        customer_ids_from_sales = set()
        if 'Código' in sales_df.columns:
            customer_ids_from_sales = set(sales_df['Código'].unique())

        all_customer_ids = customer_ids_from_master \
            .union(customer_ids_from_transactions) \
            .union(customer_ids_from_sales)
        all_customer_ids = {cid for cid in all_customer_ids if cid != 'nan'}

        for customer_id in all_customer_ids:
            customer_info = customers_master[customers_master['customer_id'] == customer_id]
            customer_tx = transactions_df[transactions_df['Código'] == customer_id]
            
            last_transaction = customer_tx['Data (Recibo)'].max() if not customer_tx.empty else None
            activity_status = "New"
            if last_transaction:
                days_since_last = (datetime.now() - last_transaction).days
                if days_since_last < 30: activity_status = "Active"
                elif days_since_last < 90: activity_status = "At Risk"
                else: activity_status = "Inactive"

            customer_data = {
                'id': customer_id,
                'name': customer_info['name'].values[0] if not customer_info.empty else "Unknown Customer",
                'status': activity_status,
                'total_spent': float(customer_tx['Valor Total'].sum()),
                'total_transactions': len(customer_tx),
                'last_transaction_date': last_transaction
            }
            customer_schema = schemas.CustomerCreate(**customer_data)
            crud.crud_customer.create_customer(db, customer=customer_schema)

        logger.info("Data loaded and processed successfully.")

    except Exception as e:
        logger.error(f"An error occurred during data loading: {e}")
