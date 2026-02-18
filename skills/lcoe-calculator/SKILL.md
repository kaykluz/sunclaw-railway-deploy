# LCOE Calculator

Calculate the Levelized Cost of Energy (LCOE) for renewable energy projects and compare against IRENA benchmarks.

## Instructions

When the user asks about LCOE, cost of energy, or project economics:

1. Gather the required inputs:
   - Technology type (solar PV, onshore wind, offshore wind, CSP)
   - Installed capacity (MW)
   - Capital cost ($/kW) — use IRENA defaults if not provided
   - Capacity factor (%) — use regional defaults if not provided
   - O&M cost ($/kW/year) — use IRENA defaults if not provided
   - Discount rate (%) — default 7.5% for developing countries, 5% for developed
   - Project lifetime (years) — default 25 for solar, 25 for wind
2. Calculate LCOE using the standard formula:
   - LCOE = (Total Lifecycle Cost) / (Total Lifetime Energy Production)
   - LCOE = (CAPEX × CRF + O&M) / (Capacity × CF × 8760)
   - CRF = Capital Recovery Factor = r(1+r)^n / ((1+r)^n - 1)
3. Compare against IRENA 2023 benchmark data:
   - Solar PV: Global weighted average $0.049/kWh
   - Onshore Wind: Global weighted average $0.033/kWh
   - Offshore Wind: Global weighted average $0.075/kWh
4. Provide sensitivity analysis if requested.

## Tools

This skill uses computational reasoning (no external API). The agent performs calculations directly.

## Examples

**User:** Calculate LCOE for a 10MW solar farm in Kenya

**Assistant:** Here's the LCOE calculation for a 10 MW solar PV farm in Kenya:

**Assumptions:**
| Parameter | Value | Source |
|-----------|-------|--------|
| Capacity | 10 MW | User input |
| CAPEX | $850/kW | IRENA 2023 Sub-Saharan Africa average |
| Capacity Factor | 18.5% | PVGIS estimate for Kenya |
| O&M Cost | $17/kW/year | IRENA 2023 benchmark |
| Discount Rate | 7.5% | Developing country standard |
| Lifetime | 25 years | Industry standard |

**Calculation:**
- Total CAPEX: $8,500,000
- CRF: 0.0897
- Annual CAPEX payment: $762,450
- Annual O&M: $170,000
- Annual generation: 10,000 × 0.185 × 8,760 = 16,206,000 kWh

**LCOE = $0.057/kWh**

This is 16% above the IRENA global weighted average of $0.049/kWh for solar PV, primarily due to the higher discount rate typical in East African markets. The project is still highly competitive against grid electricity prices in Kenya (~$0.15–0.20/kWh).
