# Business Intelligence Dashboard Report

## Output for `advanced_financial_analysis.py`

### STDOUT

```
No output generated.
```

## Output for `business_etl.py`

### STDOUT

```
--- Extracting Data ---
--- Running Base ETL Metrics ---
--- Calculating LTV Metrics ---
--- Predicting Upgrade Candidates ---

--- ETL Run Summary ---

Base KPIs:
                 kpi    value
0    Acceptance Rate    0.145
1  Pending Contracts    0.160
2   Avg Days Blocked  349.875
3   Valid Email Rate    0.950
4    Conversion Rate    0.490
5   System Signups %    0.435

Average Client LTV: R$6,649.59

Top 5 Upgrade Candidates:
  codigo      cliente  status_cliente  ...          ltv days_active upgrade_prob
0   C155  Cliente 155               4  ...  4735.549704         156     0.365437
1   C189  Cliente 189               4  ...  7652.114992         242     0.351979
2   C175  Cliente 175               4  ...  8691.289123         265     0.344766
3   C116  Cliente 116               3  ...  2125.323131          66     0.324438
4   C149  Cliente 149               4  ...  7062.874989         256     0.319769

[5 rows x 17 columns]
```

### STDERR

```
D:\codex\master_code\base\bi_dash\gerencial\dashboard_gerencial\.venv\Lib\site-packages\sklearn\linear_model\_logistic.py:473: ConvergenceWarning: lbfgs failed to converge after 1000 iteration(s) (status=1):
STOP: TOTAL NO. OF ITERATIONS REACHED LIMIT

Increase the number of iterations to improve the convergence (max_iter=1000).
You might also want to scale the data as shown in:
    https://scikit-learn.org/stable/modules/preprocessing.html
Please also refer to the documentation for alternative solver options:
    https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression
  n_iter_i = _check_optimize_result(
```

## Output for `business_health_analysis.py`

### STDOUT

```
No output generated.
```

## Output for `business_intelligence_etl.py`

### STDOUT

```
No output generated.
```

## Output for `create_mock_data.py`

### STDOUT

```
No output generated.
```

## Output for `deep_dive_analysis.py`

### STDOUT

```
No output generated.
```

## Output for `financial_analysis.py`

### STDOUT

```
An error occurred: "None of [Index(['Receita', 'Despesa'], dtype='object')] are in the [columns]"
```

### STDERR

```
D:\codex\master_code\base\bi_dash\gerencial\dashboard_gerencial\bi_dash\components\financial_analysis.py:63: UserWarning: This pattern is interpreted as a regular expression, and has match groups. To actually get the groups, use str.extract.
  if col in numeric_cols_to_convert or df[col].str.contains(r'(\d\.\d{3})|(\d+,\d{2})', na=False).any():
```

## Output for `gym_analytics_etl.py`

### STDOUT

```
[{'kpi': 'Avg Member Age', 'value': 44.544}, {'kpi': 'Total Monthly Revenue', 'value': 22205}, {'kpi': 'Most Popular Class', 'value': 'Dance'}, {'kpi': 'Churn Rate', 'value': '15.00%'}]
```

## Output for `sales_funnel_analysis.py`

### STDOUT

```
DAILY STATUS REPORT
=====================
Period: 2024-01-01 to 2024-03-01
Days analyzed: 3

Key Metrics:
| Status                 | Avg  | Min | Max | Last Value |
|------------------------|------|-----|-----|------------|
| Ativo                  | 105.0 | 100.0 | 110.0 | 110.0 |
| Cancelado              | 11.0 | 10.0 | 12.0 | 12.0 |
| Prospect               | 19.0 | 18.0 | 20.0 | 18.0 |


================================================================================

EMAIL VALIDATION REPORT (email_check_2507290033)
================================
Total Records: 3
Overall Validation Rate: 66.7%

By Status:
| Status           | Count | Validated | Rate  |
|------------------|-------|-----------|-------|
| Ativo            | 1.0 | 1.0 | 100.0% |
| Inativo          | 1.0 | 0.0 | 0.0% |
| Prospect         | 1.0 | 1.0 | 100.0% |


================================================================================

EMAIL VALIDATION REPORT (email_check_2508021059)
================================
Total Records: 3
Overall Validation Rate: 66.7%

By Status:
| Status           | Count | Validated | Rate  |
|------------------|-------|-----------|-------|
| Ativo            | 2.0 | 2.0 | 100.0% |
| Cancelado        | 1.0 | 0.0 | 0.0% |


================================================================================


STATUS COMPARISON (Last Day vs Email Data):
| Status           | Daily Count | Email Count | Difference |
|------------------|-------------|-------------|------------|
| Cancelado        |          12 |           1 |        -11 |
| Ativo            |         110 |           2 |       -108 |
| Prospect         |          18 |           0 |        -18 |

Generated 2 plot(s).
```

### STDERR

```
D:\codex\master_code\base\bi_dash\gerencial\dashboard_gerencial\bi_dash\components\sales_funnel_analysis.py:155: FutureWarning: 

Passing `palette` without assigning `hue` is deprecated and will be removed in v0.14.0. Assign the `x` variable to `hue` and set `legend=False` for the same effect.

  ax = sns.barplot(x=validation_df.index, y=validation_df['validation_rate'], palette='viridis')
```

## Output for `statistical_analysis.py`

### STDOUT

```
No output generated.
```

