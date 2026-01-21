export class Day {
    day: string
    durchgehend: boolean
    pause: boolean
    startTime1: string
    endTime1: string
    startTime2?: string
    endTime2?: string
}

export class Block {
    selectedDays: string[]
    durchgehend: boolean
    pause: boolean
    startTime1: string
    endTime1: string
    startTime2: string
    endTime2: string
}

export class SpecialOpeningTime {
    ID: string
    reason: string
    from: string
    to: string
    durchgehend: boolean
    pause: boolean
    geschlossen: boolean
    startTime1: string
    endTime1: string
    startTime2: string
    endTime2: string
    geschlossenText?: string
}