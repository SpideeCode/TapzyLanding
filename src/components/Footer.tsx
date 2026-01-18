import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const { error } = await supabase.from('waitlist').insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          setMessage('Cet email est déjà inscrit !');
        } else {
          setMessage('Une erreur est survenue. Réessayez.');
        }
        setStatus('error');
      } else {
        setMessage('Merci ! Vous êtes sur la liste 🎉');
        setStatus('success');
        setEmail('');
      }
    } catch {
      setMessage('Une erreur est survenue. Réessayez.');
      setStatus('error');
    }

    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  return (
    <footer id="waitlist" className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Rejoignez la révolution
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Inscrivez-vous maintenant pour bénéficier d'un accès anticipé et d'une
            offre de lancement exclusive.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4F18] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-4 bg-[#FF4F18] text-white font-semibold rounded-xl hover:bg-[#FF6B3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'loading' ? 'Inscription...' : "M'inscrire"}
              </motion.button>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl flex items-center gap-2 ${
                  status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {status === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message}</span>
              </motion.div>
            )}
          </form>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-2xl font-bold text-gray-900">FlashMenu</div>
              <div className="text-gray-600">
                © 2024 FlashMenu. Tous droits réservés.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
