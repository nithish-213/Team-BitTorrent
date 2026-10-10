# Ground Truth Analytical Anomalies & Planted Drivers

The synthetic dataset for **NimbusRev** includes 4 planted anomalies designed to evaluate analytical correctness:

| Anomaly ID | Metric | Period | Expected Primary Driver | Expected Delta | Explanation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | `token_usage` | July 2026 vs June 2026 | **Provider X** | `-30.5%` | Token consumption dropped ~30% in July 2026 due to traffic reduction on Provider X. |
| **B** | `billed_revenue` | Q2 2026 vs Q1 2026 | **CUST-ENT-04 & CUST-ENT-09** | `-18.5%` | Billed revenue dipped in Q2 2026 vs Q1 because two large Enterprise customers churned. |
| **C** | `overdue_invoices` | August 2026 | **EMEA Region** | `+$142,000` | Overdue invoice receivables spiked in EMEA during August 2026. |
| **D** | `draft_services` | March 2026 | **Service Creation Spike** | `+18 Draft Services` | 18 new Draft services were created in March 2026 during monetization restructuring. |
