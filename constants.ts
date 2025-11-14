import type { Delivery, DeliveryStatus, IslandCode } from './types';

export const SUPPLIERS = [
    "Atramentum",
    "Bluestar",
    "Compuspain",
    "Depau",
    "Development Systems",
    "DMI",
    "Esprinet",
    "Esselte",
    "Formularios Insulares",
    "Futursat",
    "Gateway",
    "Inforpor",
    "Instant Byte",
    "Lurbe Grup",
    "Megasur",
    "Pepegreen",
    "Phoenix Technologies",
    "Posiflex",
    "Salicru",
    "Telcomdis",
    "Trust",
    "V-Valley",
];

export const STATUS_OPTIONS: DeliveryStatus[] = ['En tránsito', 'En almacén', 'Dado de alta'];

export const ISLAND_OPTIONS: IslandCode[] = ['GC', 'TF'];

export const DUMMY_DELIVERIES: Delivery[] = [
    {
        id: '1',
        supplier: "Exprinet",
        expectedDate: "2025-12-13",
        arrival: null,
        pallets: null,
        packages: null,
        status: "En tránsito",
        lastUpdate: "2024-07-28T10:00:00Z",
        tracking: "EXP-TRACK-001",
        observations: null,
        island: 'GC'
    },
    {
        id: '2',
        supplier: "Ingram Micro",
        expectedDate: "2025-12-14",
        arrival: "2025-12-14T09:32:00Z",
        pallets: 5,
        packages: 22,
        status: "En almacén",
        lastUpdate: "2024-07-29T09:35:00Z",
        tracking: "ING-90210",
        observations: "Revisar documentación",
        island: 'TF'
    },
    {
        id: '3',
        supplier: "Tech Data",
        expectedDate: "2025-12-12",
        arrival: "2025-12-12T14:00:00Z",
        pallets: 2,
        packages: 10,
        status: "En almacén",
        lastUpdate: "2024-07-29T14:05:00Z",
        tracking: null,
        observations: null,
        island: 'TF'
    },
    {
        id: '4',
        supplier: "MCR",
        expectedDate: "2025-12-15",
        arrival: null,
        pallets: null,
        packages: null,
        status: "En tránsito",
        lastUpdate: "2024-07-27T16:00:00Z",
        tracking: null,
        observations: null,
        island: 'GC'
    }
];
