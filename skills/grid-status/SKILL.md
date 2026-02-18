# Grid Status

Installed capacity, renewable share, and electricity market data for countries worldwide.

## Instructions

When the user asks about grid status, electricity mix, renewable share, or installed capacity for a country:

1. Reference the built-in country database below for key markets.
2. For countries not in the database, use the Ember API to fetch data.
3. Present data clearly with:
   - Total installed capacity (GW)
   - Renewable share (%)
   - Breakdown by source (solar, wind, hydro, fossil)
   - Electricity generation (TWh/year)
   - Grid carbon intensity (gCO₂/kWh)
4. Provide trend context (growing/declining renewable share).

## Tools

### ember_electricity

Fetch electricity generation data by country from the Ember Global Electricity Review.

**Endpoint:** `GET https://ember-data-api-scg3n.ondigitalocean.app/v1/electricity-generation/yearly`

**Parameters:**
- `entity` (string, required): Country name (e.g., "Kenya", "Nigeria", "South Africa")
- `start_date` (string, optional): Start year. Default: "2022"
- `end_date` (string, optional): End year. Default: "2023"

**Example Request:**
```
GET https://ember-data-api-scg3n.ondigitalocean.app/v1/electricity-generation/yearly?entity=Kenya&start_date=2022&end_date=2023
```

## Country Database (2023 Data)

### Kenya
- Total Capacity: ~3.3 GW
- Renewable Share: ~92% of generation
- Sources: Geothermal 45%, Hydro 30%, Wind 15%, Solar 2%, Thermal 8%
- Generation: ~12.5 TWh/year
- Carbon Intensity: ~60 gCO₂/kWh

### Nigeria
- Total Capacity: ~13.5 GW (available ~4–5 GW)
- Renewable Share: ~20% of generation
- Sources: Gas 70%, Hydro 20%, Solar <1%, Wind <1%
- Generation: ~30 TWh/year (grid only)
- Carbon Intensity: ~400 gCO₂/kWh

### South Africa
- Total Capacity: ~60 GW
- Renewable Share: ~15% of generation
- Sources: Coal 65%, Wind 8%, Solar 5%, Nuclear 5%, Gas 3%, Hydro 2%
- Generation: ~230 TWh/year
- Carbon Intensity: ~850 gCO₂/kWh

### Morocco
- Total Capacity: ~11 GW
- Renewable Share: ~38% of generation
- Sources: Coal 30%, Wind 18%, Solar 10%, Hydro 10%, Gas 22%
- Generation: ~42 TWh/year
- Carbon Intensity: ~550 gCO₂/kWh

### Egypt
- Total Capacity: ~60 GW
- Renewable Share: ~12% of generation
- Sources: Gas 75%, Wind 5%, Hydro 5%, Solar 2%, Oil 13%
- Generation: ~210 TWh/year
- Carbon Intensity: ~450 gCO₂/kWh

### India
- Total Capacity: ~425 GW
- Renewable Share: ~24% of generation
- Sources: Coal 55%, Solar 10%, Wind 8%, Hydro 6%, Gas 5%, Nuclear 3%
- Generation: ~1,800 TWh/year
- Carbon Intensity: ~650 gCO₂/kWh

### Germany
- Total Capacity: ~250 GW
- Renewable Share: ~55% of generation
- Sources: Wind 27%, Solar 13%, Biomass 8%, Hydro 4%, Gas 15%, Coal 20%
- Generation: ~510 TWh/year
- Carbon Intensity: ~350 gCO₂/kWh

### Brazil
- Total Capacity: ~200 GW
- Renewable Share: ~85% of generation
- Sources: Hydro 60%, Wind 14%, Solar 6%, Biomass 5%, Gas 10%
- Generation: ~680 TWh/year
- Carbon Intensity: ~80 gCO₂/kWh

### United States
- Total Capacity: ~1,300 GW
- Renewable Share: ~22% of generation
- Sources: Gas 40%, Wind 10%, Nuclear 18%, Coal 16%, Solar 5%, Hydro 6%
- Generation: ~4,200 TWh/year
- Carbon Intensity: ~380 gCO₂/kWh

### China
- Total Capacity: ~2,900 GW
- Renewable Share: ~32% of generation
- Sources: Coal 55%, Hydro 14%, Wind 10%, Solar 6%, Nuclear 5%, Gas 3%
- Generation: ~9,200 TWh/year
- Carbon Intensity: ~530 gCO₂/kWh

## Examples

**User:** What's the grid renewable share in Kenya?

**Assistant:** Kenya has one of the greenest grids in Africa:

| Metric | Value |
|--------|-------|
| Total Installed Capacity | ~3.3 GW |
| Renewable Share | ~92% of generation |
| Grid Carbon Intensity | ~60 gCO₂/kWh |
| Annual Generation | ~12.5 TWh |

**Generation Mix:**
| Source | Share |
|--------|-------|
| Geothermal | 45% |
| Hydro | 30% |
| Wind | 15% |
| Solar | 2% |
| Thermal (backup) | 8% |

Kenya's grid is dominated by geothermal energy from the Rift Valley, making it one of the lowest-carbon grids globally. The Lake Turkana Wind Power project (310 MW) significantly boosted wind's contribution since 2019.
