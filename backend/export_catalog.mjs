// Run from backend/: node export_catalog.mjs
// Dumps your existing React metadata + datasets to JSON so the Python backend reuses them.
import fs from "fs";
import * as m from "../src/data/metadataCatalog.js";
fs.writeFileSync("catalog_base.json", JSON.stringify({ pages: m.PAGES_METADATA, navigation: m.NAVIGATION_TREE }, null, 1));
fs.writeFileSync("datasets_base.json", JSON.stringify({
  sales_analytics: m.SALES_ANALYTICS_DATASET, regional_sales: m.REGIONAL_SALES_DATASET,
  operations_supply: m.OPERATIONS_SUPPLY_DATASET, customer_churn: m.CUSTOMER_CHURN_DATASET,
  financial_reports: m.FINANCIAL_REPORTS_DATASET }, null, 1));
console.log("exported");
