
import React, { useState, FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import logoBlue from '@/assets/logo-blue.png';
import { MailIcon, LockClosedIcon } from '../components/ui/Icons';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Introduce tu correo y contraseña.');
            return;
        }
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess();
        } catch (firebaseError) {
            if (firebaseError instanceof FirebaseError) {
                switch (firebaseError.code) {
                    case 'auth/invalid-email':
                    case 'auth/missing-email':
                        setError('El correo no es válido.');
                        break;
                    case 'auth/missing-password':
                    case 'auth/invalid-credential':
                    case 'auth/wrong-password':
                        setError('Contraseña incorrecta.');
                        break;
                    case 'auth/user-disabled':
                        setError('Usuario deshabilitado. Contacta con TI.');
                        break;
                    case 'auth/user-not-found':
                        setError('No existe un usuario con ese correo.');
                        break;
                    default:
                        setError('No se ha podido iniciar sesión. Intenta de nuevo.');
                }
            } else {
                setError('Ha ocurrido un error inesperado. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[--color-surface]">
            {/* Columna Izquierda: Formulario de Login */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <img src={logoBlue} alt="AV" className="h-12 w-12 object-contain" />
                        <h1 className="mt-4 text-3xl font-bold text-[--color-text-primary]">Acceso interno</h1>
                        <p className="mt-2 text-[--color-text-secondary]">Entradas de mercancía · Compras y Almacén</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-3 flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo corporativo</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MailIcon className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nombre.apellido@empresa.com"
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                             <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    {showPassword ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[--color-primary] focus:ring-[--color-primary]" />
                                <label htmlFor="remember" className="text-gray-600">Recordar este equipo</label>
                            </div>
                            <a href="#" className="font-medium text-[--color-primary] hover:text-[--color-primary-dark]">He olvidado mi contraseña</a>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-[--color-primary] hover:bg-[--color-primary-light] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-primary]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Accediendo...
                                    </>
                                ) : (
                                    'ENTRAR'
                                )}
                            </button>
                        </div>
                    </form>
                    <p className="mt-8 text-center text-xs text-gray-500">
                        Sólo para uso interno del personal autorizado.
                    </p>
                </div>
            </div>

            {/* Columna Derecha: Branding */}
            <div className="hidden lg:flex w-3/5 bg-gray-50 items-center justify-center p-12">
                 <div className="max-w-md text-center">
                    <img src={logoBlue} alt="AV" className="h-32 w-32 mx-auto object-contain" />
                    <h2 className="mt-8 text-4xl font-bold text-[--color-text-primary]">
                        Entradas de mercancía
                    </h2>
                    <p className="mt-4 text-lg text-[--color-text-secondary]">
                        Sincroniza Compras y Almacén en tiempo real. Previsiones, llegadas y altas de forma sencilla y centralizada.
                    </p>
                 </div>
            </div>
        </div>
    );
};
