import { useEffect, useState } from 'react'
import type { WeatherData } from '../lib/weather'
import { fetchWeather, getRestockSuggestions, checkPayday } from '../lib/weather'

export default function WeatherAlert() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isPayday, daysUntilPayday } = checkPayday()

  useEffect(() => {
    getLocation()
  }, [])

  function getLocation() {
    if (!navigator.geolocation) {
      setError('Hindi available ang GPS sa browser na ito.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude)
          setWeather(data)
        } catch (e) {
          setError('Hindi ma-load ang weather. Subukan ulit mamaya.')
        }
        setLoading(false)
      },
      () => {
        setError('I-allow ang location para makita ang weather forecast.')
        setLoading(false)
      }
    )
  }

  const suggestions = weather
    ? getRestockSuggestions(weather.condition, isPayday)
    : isPayday ? getRestockSuggestions('normal', true) : []

  const weatherEmoji = {
    rain: '🌧️',
    hot: '☀️',
    cloudy: '☁️',
    normal: '🌤️'
  }

  if (loading) {
    return (
      <div className="mx-4 mt-4 bg-[#FFF3CD] border-l-4 border-[#E8A500] rounded-xl p-3">
        <p className="text-[#7A5500] text-sm">🌤️ Kinukuha ang weather forecast...</p>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-4 flex flex-col gap-2">

      {/* Weather Banner */}
      {weather && (
        <div className={`border-l-4 rounded-xl p-3 ${
          weather.condition === 'rain'
            ? 'bg-blue-50 border-blue-400'
            : weather.condition === 'hot'
            ? 'bg-orange-50 border-orange-400'
            : 'bg-[#FFF3CD] border-[#E8A500]'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {weatherEmoji[weather.condition]} Bukas sa {weather.city}: {weather.temp}°C
              </p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{weather.description}</p>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
              alt="weather"
              className="w-10 h-10"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-gray-50 border-l-4 border-gray-300 rounded-xl p-3">
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      )}

      {/* Payday Alert */}
      {isPayday && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-3">
          <p className="text-green-700 text-sm font-semibold">
            💸 {daysUntilPayday === 0 ? 'Payday ngayon!' : 'Payday bukas!'} Mag-stock ng mas marami!
          </p>
        </div>
      )}

      {/* Restock Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            📋 Irekomendang i-restock
          </p>
          <div className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-lg">{s.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}