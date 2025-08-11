import pandas as pd
from business_etl import complete_etl_pipeline
from gym_analytics_etl import run_gym_etl

def main():
    """
    Main function to run the entire integrated ETL pipeline, including predictive models.
    """
    print("--- Running Complete Business ETL (with Predictive Models) ---")
    try:
        # This function now returns a dictionary with base KPIs and predictive metrics
        business_results = complete_etl_pipeline('datasets/clientes.xlsx')
        business_kpis = business_results.get('base_kpis', pd.DataFrame())

        print("\n--- Business ETL Summary ---")
        if not business_kpis.empty:
            print("\nBase KPIs:")
            print(business_kpis)

        ltv_metrics = business_results.get('ltv_metrics', {})
        if ltv_metrics:
            print(f"\nAverage Client LTV: R${ltv_metrics.get('avg_ltv', 0):,.2f}")

        upgrade_candidates = business_results.get('upgrade_candidates', [])
        if upgrade_candidates:
            print("\nTop 5 Upgrade Candidates:")
            print(pd.DataFrame(upgrade_candidates).head())

    except Exception as e:
        print(f"Error running complete business ETL: {e}")
        business_kpis = pd.DataFrame()

    print("\n\n--- Running Gym Analytics ETL ---")
    try:
        gym_kpis = run_gym_etl('datasets')
        print("\nGym KPIs:")
        print(gym_kpis)
    except Exception as e:
        print(f"Error running gym analytics ETL: {e}")
        gym_kpis = pd.DataFrame()

    print("\n\n--- Combining Core KPIs ---")
    if not business_kpis.empty or not gym_kpis.empty:
        # Combine the two core KPI dataframes
        combined_kpis = pd.concat([business_kpis, gym_kpis])

        # Save the combined KPIs to a new CSV file
        output_path = 'combined_business_kpis.csv'
        combined_kpis.to_csv(output_path)

        print(f"\nCombined core KPI dashboard saved to '{output_path}'")
        print("--- Final Combined Dashboard ---")
        print(combined_kpis)
    else:
        print("All pipelines failed. No KPIs to combine.")


if __name__ == "__main__":
    main()
