// Read the heart rate data from the input file
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');

// Function to calculate statistics for each day
function calculateStatisticsByDay(heartRateData) {
  const statisticsByDay = {};
  
  heartRateData.forEach(entry => {
    const date = entry.timestamps.startTime.split('T')[0]; // Extract date from start time
    
    // Initialize statistics object for the date if it doesn't exist
    if (!statisticsByDay[date]) {
      statisticsByDay[date] = {
        min: Infinity,
        max: -Infinity,
        heartRates: [],
        latestDataTimestamp: null
      };
    }
    
    // Update statistics for the date
    const { min, max, heartRates } = statisticsByDay[date];
    const { beatsPerMinute } = entry;
    statisticsByDay[date].min = Math.min(min, beatsPerMinute);
    statisticsByDay[date].max = Math.max(max, beatsPerMinute);
    statisticsByDay[date].heartRates.push(beatsPerMinute);
    
    // Update latest data timestamp if applicable
    if (!statisticsByDay[date].latestDataTimestamp || entry.timestamps.endTime > statisticsByDay[date].latestDataTimestamp) {
      statisticsByDay[date].latestDataTimestamp = entry.timestamps.endTime;
    }
  });
  
  // Calculate median for each day
  for (const date in statisticsByDay) {
    const { heartRates } = statisticsByDay[date];
    statisticsByDay[date].median = calculateMedian(heartRates);
    // Convert latest data timestamp to ISO string format
    statisticsByDay[date].latestDataTimestamp = new Date(statisticsByDay[date].latestDataTimestamp).toISOString();
  }
  
  return statisticsByDay;
}

// Function to calculate median
function calculateMedian(values) {
  const sortedValues = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  } else {
    return sortedValues[middle];
  }
}

try {
  // Read input from JSON file
  const jsonData = fs.readFileSync('heartrate.json', 'utf8');
  
  // Parse JSON data
  const heartRateData = JSON.parse(jsonData);
  
  // Calculate statistics by day
  const statisticsByDay = calculateStatisticsByDay(heartRateData);
  
  // Convert statistics to desired output format
  const output = Object.keys(statisticsByDay).map(date => ({
    date,
    min: statisticsByDay[date].min,
    max: statisticsByDay[date].max,
    median: statisticsByDay[date].median,
    latestDataTimestamp: statisticsByDay[date].latestDataTimestamp
  }));
  
  // Write output to JSON file
  fs.writeFileSync('output.json', JSON.stringify(output, null, 2));
  
  console.log('Statistics by day written to output.json file.');
  
} catch (error) {
  // Handle errors
  console.error('Error reading or parsing JSON file:', error);
}