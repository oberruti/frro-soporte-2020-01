import { isNil } from './checks'

export function noop(): void {
    return
}

export function formatDate(date?: string | null): string {
    if (isNil(date)) {
        return ''
    }
    const dateFormatted = new Date(date)
    return dateFormatted.toLocaleDateString()
}
