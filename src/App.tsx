import { useState } from 'react';
import { QrCode, Smartphone, Zap, Clock, CreditCard, Users, ArrowRight, Check, LogOut, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import FadeIn from './components/FadeIn';

import InteractiveDemo from './components/InteractiveDemo';

// Mock auth state for the landing page
const auth = undefined; // or { user: { name: 'Demo User' } }
const isAuthenticated = Boolean(auth);

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

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

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EAEAEA] font-sans">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center hover:bg-[#2563EB] transition-colors">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#3B82F6]">
              Tapzy
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-[#EAEAEA]">Bonjour, User</span>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-[#A0A0A0] hover:text-[#3B82F6] transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <a
                href="#demo"
                className="px-6 py-2 bg-[#3B82F6] text-white rounded-full hover:bg-[#2563EB] hover:shadow-lg transition-all hover:scale-105 font-medium"
              >
                Démo
              </a>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <FadeIn>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-[#161617] rounded-full text-[#3B82F6] text-sm font-semibold border border-[#2A2A2B]">
                ✨ La nouvelle ère de la restauration
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Commandez et payez{' '}
                <span className="text-[#3B82F6]">
                  en un scan
                </span>
              </h1>
              <p className="text-xl text-[#A0A0A0] leading-relaxed">
                Tapzy révolutionne l'expérience restaurant. Scannez le QR code sur votre table,
                commandez, et payez directement depuis votre smartphone. Simple, rapide, fluide.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="group px-8 py-4 bg-[#3B82F6] text-white rounded-full font-semibold hover:bg-[#2563EB] hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                >
                  {isAuthenticated ? 'Tableau de bord' : 'Commencer maintenant'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <button className="px-8 py-4 border-2 border-[#3B82F6] text-[#3B82F6] rounded-full font-semibold hover:bg-[#161617] transition-all">
                  Voir la démo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-[#161617] rounded-3xl shadow-2xl p-8 border border-[#2A2A2B]">
                <div className="aspect-square bg-[#1E1E1F] rounded-2xl flex items-center justify-center">
                  <QrCode className="w-64 h-64 text-[#3B82F6]" strokeWidth={1.5} />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#0A0A0B] rounded-xl border border-[#2A2A2B]">
                    <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#EAEAEA]">Scannez</div>
                      <div className="text-sm text-[#A0A0A0]">Le QR code sur votre table</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#0A0A0B] rounded-xl border border-[#2A2A2B]">
                    <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#EAEAEA]">Commandez</div>
                      <div className="text-sm text-[#A0A0A0]">Parcourez le menu et validez</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Interactive Demo Section */}
      <div id="demo">
        <InteractiveDemo />
      </div>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#EAEAEA]">
              Pourquoi choisir <span className="text-[#3B82F6]">Tapzy</span> ?
            </h2>
            <p className="text-xl text-[#A0A0A0]">
              Une solution complète pour moderniser votre établissement
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8 text-white" />,
              title: "Rapidité",
              desc: "Réduisez les temps d'attente. Vos clients commandent instantanément sans attendre le serveur."
            },
            {
              icon: <Users className="w-8 h-8 text-white" />,
              title: "Libérez vos équipes",
              desc: "Vos serveurs se concentrent sur l'expérience client plutôt que sur la prise de commande."
            },
            {
              icon: <CreditCard className="w-8 h-8 text-white" />,
              title: "Paiement intégré",
              desc: "Paiement sécurisé directement depuis l'application. Fini les allers-retours pour l'addition."
            },
            {
              icon: <Clock className="w-8 h-8 text-white" />,
              title: "Gain de temps",
              desc: "Augmentez votre rotation de tables et servez plus de clients sans stress."
            },
            {
              icon: <Smartphone className="w-8 h-8 text-white" />,
              title: "Zéro installation",
              desc: "Aucune application à télécharger pour vos clients. Tout fonctionne depuis le navigateur."
            },
            {
              icon: <QrCode className="w-8 h-8 text-white" />,
              title: "Simple à mettre en place",
              desc: "Imprimez vos QR codes, collez-les sur vos tables. C'est prêt !"
            }
          ].map((feature, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="group p-8 bg-[#161617] rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-[#2A2A2B] h-full">
                <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2563EB] group-hover:scale-110 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#EAEAEA]">{feature.title}</h3>
                <p className="text-[#A0A0A0]">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] py-20">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#EAEAEA] mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-xl text-[#A0A0A0]">
                En 3 étapes simples pour vos clients
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { id: 1, title: 'Scanner', desc: 'Le client scanne le QR code sur la table avec son smartphone' },
              { id: 2, title: 'Commander', desc: 'Il parcourt le menu, choisit ses plats et valide sa commande' },
              { id: 3, title: 'Payer', desc: 'Paiement sécurisé en un clic, sans attendre l\'addition' }
            ].map((step, index) => (
              <FadeIn key={step.id} delay={index * 0.2}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <span className="text-3xl font-bold text-[#3B82F6]">{step.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#EAEAEA] mb-4">{step.title}</h3>
                  <p className="text-[#A0A0A0]">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <FadeIn>
          <div className="bg-[#161617] rounded-3xl p-12 lg:p-20 text-center border-2 border-[#2A2A2B]">
            <h2 className="text-4xl font-bold mb-6 text-[#EAEAEA]">Bientôt disponible</h2>
            <p className="text-xl text-[#A0A0A0] mb-10 max-w-2xl mx-auto">
              Nous finalisons les derniers détails. Rejoignez la liste d'attente pour être informé du lancement et bénéficier d'avantages exclusifs.
            </p>

            {status === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl max-w-md mx-auto flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                <span>Merci ! Vous êtes bien inscrit.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-6 py-4 bg-[#0A0A0B] border border-[#2A2A2B] rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[#525252]"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold hover:bg-[#2563EB] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            )}

            <p className="text-sm text-[#A0A0A0] mt-8">
              Soyez les premiers informés • Pas de spam
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0B] py-12 border-t border-[#2A2A2B]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center hover:bg-[#2563EB] transition-colors">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#3B82F6]">
                Tapzy
              </span>
            </div>
            <div className="text-[#A0A0A0]">
              &copy; 2025 Tapzy. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
