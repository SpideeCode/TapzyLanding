import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WaitlistFormProps {
    variant?: 'hero' | 'footer';
}

export default function WaitlistForm({ variant = 'footer' }: WaitlistFormProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email }]);

            if (error) throw error;
            setStatus('success');
            setEmail('');
        } catch (error: any) {
            console.error('Error:', error);
            setStatus('error');
            if (error.code === '23505') {
                setErrorMessage("Cet email est déjà inscrit sur la liste d'attente !");
            } else {
                setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
            }
        }
    };

    if (status === 'success') {
        return (
            <div className={`bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl flex items-center justify-center gap-2 ${variant === 'hero' ? 'max-w-md' : 'max-w-md mx-auto'}`}>
                <Check className="w-5 h-5" />
                <span>Merci ! Vous êtes bien inscrit.</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`${variant === 'hero' ? 'max-w-md' : 'max-w-md mx-auto'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`flex-1 px-6 py-4 bg-[#0A0A0B] border border-[#2A2A2B] rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#525252] ${variant === 'hero' ? 'shadow-lg' : ''}`}
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold hover:bg-[#2563EB] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Rejoindre'
                    )}
                </button>
            </div>
            {status === 'error' && (
                <p className="text-red-400 text-sm mt-3 text-left">
                    {errorMessage}
                </p>
            )}
        </form>
    );
}
