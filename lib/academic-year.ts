/**
 * Academic Year Utilities
 * Academic year: April - March (e.g., 2026-27 for April 2026 - March 2027)
 */

/**
 * Calculate current academic year based on system date
 */
export function getCurrentAcademicYear(): string {
  const now = new Date()
  const month = now.getMonth() // 0-11 (Jan=0, Apr=3)
  const year = now.getFullYear()

  // Academic year starts in April (month 3)
  if (month >= 3) {
    // April onwards: current year - next year
    return `${year}-${String(year + 1).slice(-2)}`
  } else {
    // January to March: previous year - current year
    return `${year - 1}-${String(year).slice(-2)}`
  }
}

/**
 * Get academic year start and end dates
 */
export function getAcademicYearDates(academicYear: string) {
  const [startYear, endYearStr] = academicYear.split('-')
  const startYearNum = parseInt(startYear)
  const endYearNum = startYearNum + 1

  return {
    startDate: new Date(startYearNum, 3, 1), // April 1st
    endDate: new Date(endYearNum, 2, 31),    // March 31st
  }
}

/**
 * Check if year should be transitioned (for admin alerts)
 * Returns true during April 1-7 (start of academic year)
 */
export function isAcademicYearStarting(): boolean {
  const now = new Date()
  const month = now.getMonth()
  const day = now.getDate()

  return month === 3 && day <= 7
}

/**
 * Check if academic year is ending (March 25-31)
 */
export function isAcademicYearEnding(): boolean {
  const now = new Date()
  const month = now.getMonth()
  const day = now.getDate()

  return month === 2 && day >= 25
}
