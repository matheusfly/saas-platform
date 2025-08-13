from advanced_financial_analysis import execute_advanced_gym_analysis
import json

def save_bi_results(bi_results, output_file):
    """
    Saves business intelligence results to a JSON file

    Parameters:
    bi_results (dict): Results from gym_business_intelligence_etl
    output_file (str): Path to save the JSON file

    Returns:
    bool: Success status
    """
    import json

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(bi_results, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"Error saving results: {str(e)}")
        return False

if __name__ == "__main__":
    # Define file paths
    cash_flow_file = 'fluxo_caixa.xlsx'
    output_file = 'advanced_financial_analysis_results.json'

    # Run the ETL pipeline
    print("Starting Advanced Financial Analysis ETL process...")
    bi_results = execute_advanced_gym_analysis(cash_flow_file)

    # Save the results
    if bi_results:
        print(f"ETL process completed. Saving results to {output_file}...")
        if save_bi_results(bi_results, output_file):
            print("Results saved successfully.")
        else:
            print("Failed to save results.")
    else:
        print("ETL process failed.")
