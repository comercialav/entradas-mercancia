const CANARY_TIME_ZONE = 'Atlantic/Canary';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
    timeZone: CANARY_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
};

const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
    ...DATE_FORMAT,
    hour: '2-digit',
    minute: '2-digit',
};

type CanaryParts = {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
};

const canaryParts = (date: Date): CanaryParts => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: CANARY_TIME_ZONE,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(date);
    const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
    const hour = pick('hour') === '24' ? '00' : pick('hour');
    return {
        year: pick('year'),
        month: pick('month'),
        day: pick('day'),
        hour,
        minute: pick('minute'),
        second: pick('second'),
    };
};

const canaryOffsetMinutes = (date: Date): number => {
    const parts = canaryParts(date);
    const asUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
    );
    return Math.round((asUtc - date.getTime()) / 60000);
};

export const formatCanaryDate = (value?: string | null): string => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-ES', DATE_FORMAT);
};

export const formatCanaryDateTime = (value?: string | null): string => {
    if (!value) return '';
    return new Date(value).toLocaleString('es-ES', DATE_TIME_FORMAT);
};

/** ISO en UTC -> valor de input datetime-local en hora de Canarias. */
export const toCanaryDateTimeLocal = (iso?: string | null): string => {
    if (!iso) return '';
    const parts = canaryParts(new Date(iso));
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

/** Valor de input (fecha u hora de Canarias) -> ISO en UTC. */
export const fromCanaryDateTimeLocal = (value: string): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
    if (!match) {
        return new Date(value).toISOString();
    }
    const [, year, month, day, hour, minute] = match;
    const wallUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    const firstOffset = canaryOffsetMinutes(new Date(wallUtc));
    let utc = new Date(wallUtc - firstOffset * 60000);
    const secondOffset = canaryOffsetMinutes(utc);
    if (secondOffset !== firstOffset) {
        utc = new Date(wallUtc - secondOffset * 60000);
    }
    return utc.toISOString();
};

export const canaryDateKey = (iso?: string | null): string => {
    if (!iso) return '';
    return toCanaryDateTimeLocal(iso).slice(0, 10);
};

export const canaryTodayKey = (now = new Date()): string => canaryDateKey(now.toISOString());

export const addCalendarDays = (dateKey: string, days: number): string => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};
