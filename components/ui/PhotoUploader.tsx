import React, { useState, useRef, useCallback } from 'react';
import { CameraIcon, UploadIcon, XCircleIcon, CloseIcon } from './Icons';
import type { DeliveryPhoto } from '../../types';
import { uploadDeliveryPhoto, deleteDeliveryPhoto } from '../../services/storageService';

interface PhotoUploaderProps {
    deliveryId: string;
    userId: string;
    userDisplayName?: string;
    photos: DeliveryPhoto[];
    onPhotoUploaded: (photo: DeliveryPhoto) => void;
    onPhotoDeleted: (photo: DeliveryPhoto) => void;
    disabled?: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
    deliveryId,
    userId,
    userDisplayName,
    photos,
    onPhotoUploaded,
    onPhotoDeleted,
    disabled = false,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<DeliveryPhoto | null>(null);

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0 || disabled) return;

        setUploadError(null);
        setIsUploading(true);

        try {
            for (const file of Array.from(files)) {
                // Validar tipo de archivo
                if (!file.type.startsWith('image/')) {
                    setUploadError('Solo se permiten archivos de imagen');
                    continue;
                }

                // Validar tamaño (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    setUploadError('Las imágenes deben ser menores a 10MB');
                    continue;
                }

                const photo = await uploadDeliveryPhoto(deliveryId, file, userId, userDisplayName);
                onPhotoUploaded(photo);
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            setUploadError('Error al subir la foto. Inténtalo de nuevo.');
        } finally {
            setIsUploading(false);
        }
    }, [deliveryId, userId, userDisplayName, onPhotoUploaded, disabled]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
    }, [handleFiles, disabled]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeletePhoto = async (photo: DeliveryPhoto) => {
        try {
            await deleteDeliveryPhoto(deliveryId, photo);
            onPhotoDeleted(photo);
        } catch (error) {
            console.error('Error deleting photo:', error);
            setUploadError('Error al eliminar la foto');
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                    transition-all duration-200 ease-out
                    ${isDragging
                        ? 'border-[--color-primary] bg-[--color-primary]/5 scale-[1.02]'
                        : 'border-[--color-border-strong] hover:border-[--color-primary] hover:bg-gray-50'
                    }
                    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                    ${isUploading ? 'pointer-events-none' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="flex flex-col items-center gap-2">
                    {isUploading ? (
                        <>
                            <div className="w-10 h-10 border-4 border-[--color-primary] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-[--color-text-secondary]">Subiendo foto...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-[--color-primary]/10 flex items-center justify-center">
                                <CameraIcon className="w-6 h-6 text-[--color-primary]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[--color-text-primary]">
                                    Añadir fotos de incidencias
                                </p>
                                <p className="text-xs text-[--color-text-muted] mt-1">
                                    Arrastra o haz clic para subir
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {uploadError && (
                <p className="text-sm text-[--color-error] text-center">{uploadError}</p>
            )}

            {/* Photo Thumbnails */}
            {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="relative"
                        >
                            <button
                                onClick={() => setSelectedPhoto(photo)}
                                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity w-full"
                            >
                                <img
                                    src={photo.url}
                                    alt="Foto de incidencia"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                            {/* Botón eliminar - siempre visible en esquina */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('¿Seguro que quieres eliminar esta foto? Esta acción no se puede deshacer.')) {
                                        handleDeletePhoto(photo);
                                    }
                                }}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:rotate-90 transition-all duration-300 z-10"
                                title="Eliminar foto"
                            >
                                <XCircleIcon className="w-4 h-4" />
                            </button>
                            <div className="mt-1.5">
                                <p className="text-[10px] text-[--color-text-muted] truncate text-center">
                                    {photo.uploadedByName || 'Usuario'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botón cerrar */}
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                        >
                            <CloseIcon className="w-8 h-8" />
                        </button>

                        {/* Botón eliminar */}
                        <button
                            onClick={() => {
                                if (confirm('¿Seguro que quieres eliminar esta foto? Esta acción no se puede deshacer.')) {
                                    handleDeletePhoto(selectedPhoto);
                                    setSelectedPhoto(null);
                                }
                            }}
                            className="absolute -top-12 left-0 flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Eliminar</span>
                        </button>

                        {/* Imagen ampliada */}
                        <img
                            src={selectedPhoto.url}
                            alt="Foto de incidencia ampliada"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />

                        {/* Info de la foto */}
                        <div className="mt-4 text-center text-white">
                            <p className="text-sm">
                                <span className="font-medium">{selectedPhoto.uploadedByName || 'Usuario'}</span>
                                <span className="mx-2">•</span>
                                <span className="text-gray-300">
                                    {new Date(selectedPhoto.uploadedAt).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </p>
                        </div>

                        {/* Navegación de miniaturas */}
                        {photos.length > 1 && (
                            <div className="flex justify-center gap-4 mt-4">
                                {photos.map((photo) => (
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
                                            alt="Miniatura"
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
