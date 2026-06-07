export type WeatherData = {
  condition: 'rain' | 'hot' | 'cloudy' | 'normal'
  description: string
  temp: number
  city: string
  icon: string
}

export type RestockSuggestion = {
  emoji: string
  name: string
  reason: string
}

// Get weather suggestions based on forecast
export function getRestockSuggestions(condition: WeatherData['condition'], isPayday: boolean): RestockSuggestion[] {
  const suggestions: RestockSuggestion[] = []

  if (condition === 'rain') {
    suggestions.push(
      { emoji: '☕', name: 'Kopiko / Nescafe', reason: 'Malamig — maraming mag-iinit ng kape' },
      { emoji: '🍜', name: 'Lucky Me Noodles', reason: 'Paboritong pagkain sa ulan' },
      { emoji: '💊', name: 'Biogesic / Neozep', reason: 'Maraming magkakasipon sa ulan' },
      { emoji: '🕯️', name: 'Kandila / Flashlight', reason: 'Maaaring may brownout' },
    )
  }

  if (condition === 'hot') {
    suggestions.push(
      { emoji: '🧊', name: 'Softdrinks / Juice', reason: 'Mainit — maraming iinom' },
      { emoji: '🍦', name: 'Ice Cream / Dirty Kitchen', reason: 'Paboritong panlamig' },
      { emoji: '💧', name: 'Tubig / Water', reason: 'Maraming mauuhaw' },
    )
  }

  if (condition === 'cloudy' || condition === 'normal') {
    suggestions.push(
      { emoji: '🍬', name: 'Merienda items', reason: 'Normal na araw — regular na benta' },
    )
  }

  if (isPayday) {
    suggestions.push(
      { emoji: '🚬', name: 'Marlboro / Philip Morris', reason: 'Payday — mas maraming bibilhin' },
      { emoji: '🥛', name: 'Bear Brand / Milo', reason: 'Payday — pang-almusal ng pamilya' },
      { emoji: '🍺', name: 'Beer / Tanduay', reason: 'Payday — tipon-tipon sa gabi' },
    )
  }

  return suggestions
}

// Check if today or tomorrow is payday (15th or 30th)
export function checkPayday(): { isPayday: boolean; daysUntilPayday: number } {
    const today = new Date()
    const month = today.getMonth()
    const year = today.getFullYear()

  const paydays = [
    new Date(year, month, 15),
    new Date(year, month, 30),
  ]

  // Check next month's paydays too
  paydays.push(new Date(year, month + 1, 15))
  paydays.push(new Date(year, month + 1, 30))

  let daysUntilPayday = 999
  for (const payday of paydays) {
    const diff = Math.ceil((payday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff < daysUntilPayday) {
      daysUntilPayday = diff
    }
  }

  return {
    isPayday: daysUntilPayday <= 1,
    daysUntilPayday
  }
}

// Fetch weather from OpenWeatherMap
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=8`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')

  const data = await res.json()

  // Get tomorrow's forecast (8 x 3hr intervals = 24hrs)
  const tomorrow = data.list[4]
  const weatherId = tomorrow.weather[0].id
  const temp = Math.round(tomorrow.main.temp)
  const description = tomorrow.weather[0].description
  const icon = tomorrow.weather[0].icon
  const city = data.city.name

  // Classify condition
  let condition: WeatherData['condition'] = 'normal'
  if (weatherId >= 200 && weatherId < 700) condition = 'rain'
  else if (temp >= 33) condition = 'hot'
  else if (weatherId >= 801) condition = 'cloudy'

  return { condition, description, temp, city, icon }
}