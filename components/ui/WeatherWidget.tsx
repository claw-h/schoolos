'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react'

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  icon: 'sunny' | 'cloudy' | 'rainy'
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch weather for Mathura (from open-meteo.com - free, no API key required)
    const fetchWeather = async () => {
      try {
        // Mathura coordinates: 27.5041, 77.6740
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=27.5041&longitude=77.6740&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Kolkata'
        )
        const data = await response.json()
        const current = data.current

        // Map WMO weather codes to conditions
        const weatherCode = current.weather_code
        let condition = 'Clear'
        let icon: 'sunny' | 'cloudy' | 'rainy' = 'sunny'

        if (weatherCode === 0) {
          condition = 'Clear'
          icon = 'sunny'
        } else if (weatherCode <= 3) {
          condition = 'Cloudy'
          icon = 'cloudy'
        } else if (weatherCode <= 67) {
          condition = 'Rainy'
          icon = 'rainy'
        }

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          icon,
        })
      } catch (error) {
        console.error('Weather fetch failed:', error)
        // Fallback with placeholder data
        setWeather({
          temp: 28,
          condition: 'Mathura',
          humidity: 65,
          windSpeed: 8,
          icon: 'sunny',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !weather) return null

  const getWeatherIcon = () => {
    switch (weather.icon) {
      case 'sunny':
        return <Sun size={18} style={{ color: 'var(--summit)' }} strokeWidth={1.5} />
      case 'cloudy':
        return <Cloud size={18} style={{ color: 'var(--glacier)' }} strokeWidth={1.5} />
      case 'rainy':
        return <CloudRain size={18} style={{ color: 'var(--attempted)' }} strokeWidth={1.5} />
    }
  }

  return (
    <div style={{
      background: 'var(--bone)',
      border: '1px solid var(--border-heavy)',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    }}>
      {getWeatherIcon()}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '9px', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>WEATHER</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
            {weather.temp}°C
          </div>
          <div style={{ fontSize: '11px', color: 'var(--glacier)', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
            {weather.condition}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', fontSize: '10px', color: 'var(--stone)', fontFamily: 'var(--font-body)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Droplets size={13} color="var(--attempted)" strokeWidth={1.5} />
          <span>{weather.humidity}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Wind size={13} color="var(--glacier)" strokeWidth={1.5} />
          <span>{weather.windSpeed}km/h</span>
        </div>
      </div>
    </div>
  )
}
