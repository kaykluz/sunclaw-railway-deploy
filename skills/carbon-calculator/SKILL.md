# Carbon Emissions Calculator

Calculate avoided CO₂ emissions and estimate carbon credit value for renewable energy projects.

## Instructions

When the user asks about carbon emissions, avoided emissions, carbon credits, or carbon offset value:

1. Gather the required inputs:
   - Project type (solar PV, onshore wind, offshore wind)
   - Installed capacity (MW)
   - Capacity factor (%) — use regional defaults if not provided
   - Country/region — needed for grid emission factor
   - Project lifetime (years) — default 25
2. Calculate avoided emissions using:
   - Annual generation = Capacity × CF × 8760 hours
   - Avoided CO₂ = Annual generation × Grid emission factor
   - Grid emission factors from IEA/IRENA data (see database below)
3. Estimate carbon credit value using:
   - Voluntary carbon market price range: $5–50/tCO₂ (varies by standard and vintage)
   - CDM/Article 6 price range: $2–15/tCO₂
   - EU ETS price (for reference): ~$60–80/tCO₂
4. Present lifetime totals and annual breakdowns.

## Grid Emission Factors (gCO₂/kWh)

| Country | Factor | Source |
|---------|--------|--------|
| South Africa | 850 | IEA 2023 |
| India | 650 | IEA 2023 |
| China | 530 | IEA 2023 |
| Nigeria | 400 | IEA 2023 |
| Morocco | 550 | IEA 2023 |
| Egypt | 450 | IEA 2023 |
| United States | 380 | IEA 2023 |
| Germany | 350 | IEA 2023 |
| United Kingdom | 200 | IEA 2023 |
| Brazil | 80 | IEA 2023 |
| Kenya | 60 | IEA 2023 |
| France | 55 | IEA 2023 |
| Global Average | 436 | IEA 2023 |

## Examples

**User:** Estimate avoided CO₂ for a 50MW wind farm in South Africa

**Assistant:** Here's the avoided CO₂ emissions estimate for a 50 MW onshore wind farm in South Africa:

**Assumptions:**
| Parameter | Value |
|-----------|-------|
| Capacity | 50 MW |
| Capacity Factor | 30% (South Africa onshore average) |
| Grid Emission Factor | 850 gCO₂/kWh (Eskom grid) |
| Project Lifetime | 25 years |

**Annual Calculations:**
| Metric | Value |
|--------|-------|
| Annual Generation | 131,400 MWh |
| Avoided CO₂ | 111,690 tCO₂/year |
| Equivalent Cars Removed | ~24,000 cars/year |

**Lifetime Totals:**
| Metric | Value |
|--------|-------|
| Total Generation | 3,285,000 MWh |
| Total Avoided CO₂ | 2,792,250 tCO₂ |

**Carbon Credit Value Estimate:**
| Market | Price Range | Annual Value |
|--------|-------------|--------------|
| Voluntary (VCS/Gold Standard) | $10–30/tCO₂ | $1.1M–$3.4M/year |
| CDM/Article 6 | $5–15/tCO₂ | $0.6M–$1.7M/year |

South Africa's coal-heavy grid (Eskom) makes wind projects particularly impactful for carbon reduction. The 850 gCO₂/kWh emission factor is among the highest globally, meaning each MWh of wind energy displaces significantly more carbon than in most other countries.

Over 25 years, this single project would avoid nearly **2.8 million tonnes of CO₂** — equivalent to taking ~600,000 cars off the road for a year.
