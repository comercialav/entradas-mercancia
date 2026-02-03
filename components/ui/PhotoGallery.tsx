import React, { useState } from 'react';
import { CloseIcon, ImageIcon, TrashIcon } from './Icons';
import type { DeliveryPhoto } from '../../types';

interface PhotoGalleryProps {
    photos: DeliveryPhoto[];
    emptyMessage?: string;
    onDeletePhoto?: (photo: DeliveryPhoto) => void;
    canDelete?: boolean;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    emptyMessage = 'No hay fotos de incidencias',
    onDeletePhoto,
    canDelete = false
}) => {
    const [selectedPhoto, setSelectedPhoto] = useState<DeliveryPhoto | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (photo: DeliveryPhoto, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onDeletePhoto) return;

        if (confirm('¿Seguro que quieres eliminar esta foto? Esta acción no se puede deshacer.')) {
            setDeletingId(photo.id);
            try {
                await onDeletePhoto(photo);
                if (selectedPhoto?.id === photo.id) {
                    setSelectedPhoto(null);
                }
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-[--color-text-muted]">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                    <div key={photo.id} className="relative">
                        <button
                            onClick={() => setSelectedPhoto(photo)}
                            className="relative aspect-square rounded-lg overflow-hidden w-full focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2 group"
                        >
                            <img
                                src={photo.url}
                                alt="Foto de incidencia"
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                        {/* Delete button - siempre visible en la esquina */}
                        {canDelete && onDeletePhoto && (
                            <button
                                onClick={(e) => handleDelete(photo, e)}
                                disabled={deletingId === photo.id}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:rotate-90 transition-all duration-300 disabled:opacity-50 z-10"
                                title="Eliminar foto"
                            >
                                {deletingId === photo.id ? (
                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <CloseIcon className="w-3.5 h-3.5" />
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                        >
                            <CloseIcon className="w-8 h-8" />
                        </button>

                        {/* Delete Button in Lightbox */}
                        {canDelete && onDeletePhoto && (
                            <button
                                onClick={(e) => handleDelete(selectedPhoto, e)}
                                disabled={deletingId === selectedPhoto.id}
                                className="absolute -top-12 left-0 flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Eliminar</span>
                            </button>
                        )}

                        {/* Image */}
                        <img
                            src={selectedPhoto.url}
                            alt="Foto de incidencia ampliada"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />

                        {/* Photo Info */}
                        <div className="mt-4 text-center text-white">
                            <p className="text-sm">
                                <span className="font-medium">{selectedPhoto.uploadedByName || 'Usuario'}</span>
                                <span className="mx-2">•</span>
                                <span className="text-gray-300">{formatDate(selectedPhoto.uploadedAt)}</span>
                            </p>
                        </div>

                        {/* Navigation */}
                        {photos.length > 1 && (
                            <div className="flex justify-center gap-4 mt-4">
                                {photos.map((photo, index) => (
                                    <button
                                        key={photo.id}
                                        onClick={() => setSelectedPhoto(photo)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${photo.id === selectedPhoto.id
                                            ? 'ring-2 ring-white scale-110'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={photo.url}
                                            alt={`Miniatura ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
