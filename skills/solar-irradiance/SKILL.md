# Solar Irradiance Lookup

Look up solar irradiance data (GHI, DNI, DHI) for any location worldwide using the EU PVGIS API.

## Instructions

When the user asks about solar irradiance, solar potential, or solar radiation for a location:

1. Identify the latitude and longitude of the location. If the user provides a city name, use approximate coordinates.
2. Call the PVGIS API to get monthly and annual irradiance data.
3. Present the results clearly, including:
   - Annual GHI (Global Horizontal Irradiance) in kWh/m²/year
   - Annual DNI (Direct Normal Irradiance) in kWh/m²/year
   - Annual DHI (Diffuse Horizontal Irradiance) in kWh/m²/year
   - Monthly breakdown if requested
   - Optimal tilt angle for fixed panels
4. Provide context by comparing to typical ranges (e.g., "This is excellent for solar — comparable to the Sahel region").

## Tools

### pvgis_lookup

Look up solar irradiance data for a given latitude and longitude.

**Endpoint:** `GET https://re.jrc.ec.europa.eu/api/v5_3/PVcalc`

**Parameters:**
- `lat` (number, required): Latitude (-90 to 90)
- `lon` (number, required): Longitude (-180 to 180)
- `peakpower` (number, optional): Nominal power of the PV system in kWp. Default: 1
- `loss` (number, optional): System losses in %. Default: 14
- `outputformat` (string, optional): Output format. Default: "json"
- `angle` (number, optional): Tilt angle. If omitted, optimal angle is calculated.
- `aspect` (number, optional): Azimuth angle. Default: 0 (south-facing)

**Example Request:**
```
GET https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=6.45&lon=3.40&peakpower=1&loss=14&outputformat=json
```

### pvgis_monthly

Get monthly solar radiation data for a location.

**Endpoint:** `GET https://re.jrc.ec.europa.eu/api/v5_3/MRcalc`

**Parameters:**
- `lat` (number, required): Latitude
- `lon` (number, required): Longitude
- `startyear` (number, optional): Start year for data. Default: 2020
- `endyear` (number, optional): End year for data. Default: 2020
- `outputformat` (string, optional): Output format. Default: "json"

**Example Request:**
```
GET https://re.jrc.ec.europa.eu/api/v5_3/MRcalc?lat=6.45&lon=3.40&startyear=2020&endyear=2020&outputformat=json
```

## Examples

**User:** What's the solar irradiance in Lagos, Nigeria?

**Assistant:** Here's the solar irradiance data for Lagos, Nigeria (6.45°N, 3.40°E):

| Metric | Value |
|--------|-------|
| Annual GHI | ~1,680 kWh/m²/year |
| Annual DNI | ~1,120 kWh/m²/year |
| Annual DHI | ~780 kWh/m²/year |
| Optimal Tilt | ~7° (near-equatorial) |
| Annual PV Output | ~1,450 kWh/kWp |

Lagos receives good solar radiation year-round due to its proximity to the equator, though the rainy season (May–July) reduces output by about 20–30%. This level of irradiance is suitable for both utility-scale and rooftop solar installations.
