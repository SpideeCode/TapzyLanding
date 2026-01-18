import { useState } from 'react';
import { Mail, MessageSquare, Send, Check } from 'lucide-react';
import FadeIn from '../components/FadeIn';

export default function Contact() {
    const [status, setStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const subject = encodeURIComponent(`Contact Tapzy: ${formData.get('name')}`);
        const body = encodeURIComponent(`Message de: ${formData.get('name')} (${formData.get('email')})\n\n${formData.get('message')}`);

        window.location.href = `mailto:hello@tapzy.io?subject=${subject}&body=${body}`;
        setStatus('success');
    };

    return (
        <div className="container mx-auto px-6 py-20">
            <FadeIn>
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-4 text-[#EAEAEA]">Contactez-nous</h1>
                        <p className="text-xl text-[#A0A0A0]">
                            Une question ? Un partenariat ? N'hésitez pas à nous écrire.
                        </p>
                    </div>

                    <div className="bg-[#161617] rounded-3xl p-8 md:p-12 border border-[#2A2A2B]">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#EAEAEA] mb-2">Message prêt !</h3>
                                <p className="text-[#A0A0A0]">
                                    Votre client mail devrait s'ouvrir. Si ce n'est pas le cas, écrivez-nous directement à <a href="mailto:hello@tapzy.io" className="text-[#3B82F6] hover:underline">hello@tapzy.io</a>.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-8 text-[#A0A0A0] hover:text-[#EAEAEA] transition-colors"
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                                        Nom
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            className="w-full px-6 py-4 bg-[#0A0A0B] border border-[#2A2A2B] rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all pl-12"
                                            placeholder="Votre nom"
                                        />
                                        <MessageSquare className="w-5 h-5 text-[#525252] absolute left-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            className="w-full px-6 py-4 bg-[#0A0A0B] border border-[#2A2A2B] rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all pl-12"
                                            placeholder="votre@email.com"
                                        />
                                        <Mail className="w-5 h-5 text-[#525252] absolute left-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-[#A0A0A0] mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        className="w-full px-6 py-4 bg-[#0A0A0B] border border-[#2A2A2B] rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                                        placeholder="Comment pouvons-nous vous aider ?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold hover:bg-[#2563EB] hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>Envoyer le message</span>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
