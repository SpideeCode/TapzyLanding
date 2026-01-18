import { motion } from 'framer-motion';
import { QrCode, ShoppingCart, Utensils } from 'lucide-react';

const steps = [
  {
    icon: QrCode,
    title: 'Scan',
    description: 'Le client scanne le QR code posé sur la table avec son smartphone',
  },
  {
    icon: ShoppingCart,
    title: 'Commande',
    description: 'Il parcourt le menu, sélectionne ses plats et valide son panier en quelques clics',
  },
  {
    icon: Utensils,
    title: 'Déguste',
    description: 'Paiement instantané. La commande arrive en cuisine et le plat est servi',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600">
            Une expérience fluide en 3 étapes simples
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF4F18] to-[#FF6B3D] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#FF4F18]/20">
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#FF4F18] text-white font-bold rounded-full flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#FF4F18] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
