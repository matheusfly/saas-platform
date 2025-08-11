from business_intelligence_etl import gym_business_intelligence_etl, save_bi_results

if __name__ == "__main__":
    # Define file paths
    cash_flow_file = 'fluxo_caixa.xlsx'
    output_file = 'business_intelligence_results.json'

    # Run the ETL pipeline
    print("Starting Business Intelligence ETL process...")
    bi_results = gym_business_intelligence_etl(cash_flow_file)

    # Save the results
    if bi_results:
        print(f"ETL process completed. Saving results to {output_file}...")
        if save_bi_results(bi_results, output_file):
            print("Results saved successfully.")
        else:
            print("Failed to save results.")
    else:
        print("ETL process failed.")
