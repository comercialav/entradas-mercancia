export type UserRole = 'Compras' | 'Almacén';

export type Page = 'dashboard' | 'history';

export type IslandCode = 'GC' | 'TF';

export type DeliveryStatus = 'En tránsito' | 'En almacén' | 'Dado de alta';

export interface DeliveryPhoto {
    id: string;
    url: string;
    uploadedAt: string; // ISO format string
    uploadedBy: string;
    uploadedByName?: string;
}

export interface Delivery {
    id: string;
    supplier: string;
    expectedDate: string; // ISO format string
    arrival: string | null; // ISO format string
    pallets: number | null;
    packages: number | null;
    status: DeliveryStatus;
    lastUpdate: string; // ISO format string
    notes?: string;
    tracking?: string | null;
    observations?: string | null;
    island: IslandCode;
    estimatedPallets?: number | null;
    estimatedPackages?: number | null;
    transportCompany?: string | null;
    photos?: DeliveryPhoto[];
    hasIncident?: boolean | null;
    incidentDescription?: string | null;
    incidentSolution?: string | null;
    incidentResolvedAt?: string | null;
    incidentResolvedByName?: string | null;
}

export type IncidentState = 'unset' | 'open' | 'none' | 'resolved';

export const getIncidentState = (
    delivery: Pick<Delivery, 'hasIncident' | 'incidentSolution'>
): IncidentState => {
    if (delivery.hasIncident === true) {
        return delivery.incidentSolution?.trim() ? 'resolved' : 'open';
    }
    if (delivery.hasIncident === false) {
        return 'none';
    }
    return 'unset';
};
