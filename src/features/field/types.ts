export interface DailyLogRecord {
  name: string
  task: string
  site_engineer: string
  log_date: string
  quantity_completed?: number
  crew_size?: number
  crew_experience_years?: number
  hours_worked?: number
  weather_condition?: string
  execution_quality_score?: number
  geotag_lat?: number
  geotag_lng?: number
  creation: string
}

export interface CreateDailyLogPayload {
  task: string
  site_engineer: string
  log_date: string
  quantity_completed?: number
  crew_size?: number
  crew_experience_years?: number
  hours_worked?: number
  weather_condition?: string
  execution_quality_score?: number
}