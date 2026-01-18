import { motion } from 'framer-motion';
import { Clock, Users, TrendingUp, Zap, Shield, Smile } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Gain de temps massif',
    description:
      'Réduisez le temps de prise de commande de 80%. Plus besoin d\'attendre qu\'un serveur soit disponible.',
    stat: '-80%',
    statLabel: 'Temps d\'attente',
  },
  {
    icon: Users,
    title: 'Rotation optimisée',
    description:
      'Accélérez le flux de clients et augmentez votre capacité d\'accueil sans embaucher plus de personnel.',
    stat: '+40%',
    statLabel: 'Tables servies',
  },
  {
    icon: TrendingUp,
    title: 'Panier moyen augmenté',
    description:
      'Les suggestions intelligentes et la facilité de commande encouragent les clients à commander davantage.',
    stat: '+25%',
    statLabel: 'Revenu par table',
  },
  {
    icon: Zap,
    title: 'Communication instantanée',
    description:
      'Zéro erreur de transmission. Les commandes arrivent directement en cuisine, claires et précises.',
    stat: '0',
    statLabel: 'Erreurs',
  },
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    description:
      'Transactions cryptées et conformes aux normes bancaires. Vos clients paient en toute confiance.',
    stat: '100%',
    statLabel: 'Sécurisé',
  },
  {
    icon: Smile,
    title: 'Satisfaction client',
    description:
      'Une expérience moderne et fluide qui ravit vos clients et génère des avis positifs.',
    stat: '4.8/5',
    statLabel: 'Note moyenne',
  },
];

export default function Benefits() {
  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pourquoi choisir FlashMenu ?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Des résultats mesurables qui transforment votre restaurant
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-[#FF4F18]/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#FF4F18] to-[#FF6B3D] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#FF4F18]/20">
                <benefit.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {benefit.title}
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed">
                {benefit.description}
              </p>

              <div className="pt-4 border-t border-gray-700">
                <div className="text-3xl font-bold text-[#FF4F18] mb-1">
                  {benefit.stat}
                </div>
                <div className="text-sm text-gray-500">{benefit.statLabel}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-[#FF4F18] to-[#FF6B3D] rounded-2xl p-12 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Prêt à révolutionner votre restaurant ?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez les centaines de restaurateurs qui ont déjà adopté FlashMenu
            et transformé leur service.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-white text-[#FF4F18] text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Rejoindre la liste d'attente
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
