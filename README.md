# Viennas-Public-Transportation-VIS
The visualizations were created as part of the course “Fundamentals of Visualization” at the Vienna University of Technology.

# Setup
Node.js and npm should be installed

```bash
npm intall
npm run dev
```

# Project Structure

src/
- main.js     # page layout, global state, toggles
- map.js      # connectivity Map
- style.css   # styling

public/data/
- district.geojson      #data for map
- district_metrics.csv

# Interactions
- Day/Night toogle
- Weekday/Weekend toogle
- Hover tooltip on districts