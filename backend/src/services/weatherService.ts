import axios from 'axios';

export interface WeatherData {
    temperature: number;
    condition: string;
    description: string;
}

/**
 * Fetch weather for a given lat/lon using Open-Meteo
 */
export async function getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await axios.get(url);

        if (response.data && response.data.current_weather) {
            const cw = response.data.current_weather;
            const weatherCode = cw.weathercode;

            // Map Open-Meteo WMO codes to simple conditions
            // https://open-meteo.com/en/docs
            let condition = 'clear';
            if (weatherCode >= 1 && weatherCode <= 3) condition = 'cloudy';
            if (weatherCode >= 45 && weatherCode <= 48) condition = 'foggy';
            if (weatherCode >= 51 && weatherCode <= 67) condition = 'rainy';
            if (weatherCode >= 71 && weatherCode <= 77) condition = 'snowy';
            if (weatherCode >= 80 && weatherCode <= 82) condition = 'rain_showers';
            if (weatherCode >= 95 && weatherCode <= 99) condition = 'stormy';

            return {
                temperature: cw.temperature,
                condition,
                description: `Weather Code: ${weatherCode}`,
            };
        }
    } catch (error) {
        console.error('Failed to fetch weather:', error);
    }
    return null;
}

/**
 * Suggest habits based on weather condition
 */
export function suggestHabitsForWeather(condition: string) {
    const suggestions: Record<string, string[]> = {
        clear: ['Running', 'Outdoor Walk', 'Cycling', 'Gardening'],
        cloudy: ['Lifting Weights', 'Pilates', 'Reading Outdoors'],
        rainy: ['Indoor Yoga', 'Reading', 'Meditation', 'Cooking'],
        snowy: ['Home Workout', 'Journaling', 'Hot Yoga'],
        stormy: ['Indoor HIIT', 'Gaming (Social)', 'Learning a new skill'],
        foggy: ['Stretching', 'Indoor Walk', 'Listening to Podcast'],
    };

    return suggestions[condition] || ['Indoor Activity', 'Meditation'];
}
