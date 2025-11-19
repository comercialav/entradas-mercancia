export type UserRole = 'Compras' | 'Almacén';

export type Page = 'dashboard' | 'history';

export type IslandCode = 'GC' | 'TF';

export type DeliveryStatus = 'En tránsito' | 'En almacén' | 'Dado de alta';

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
}
