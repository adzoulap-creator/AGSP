function About() {

    return (
        <div className="bg-[#F7F5F0] min-h-screen">
            <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                    À PROPOS DE NOUS
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                    Dans le but de simplifier la vie des citoyens, <span className="text-green-600">AGSP</span> — Application de Gestion des Services Publics — permet de numériser la prise de rendez-vous pour les services publics.
                </h1>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre mission</h2>
                    <p className="text-gray-600 leading-relaxed">
                        En République du Congo, de nombreuses administrations publiques continuent de fonctionner avec des méthodes traditionnelles : files d'attente prolongées, registres papier, absence de créneaux réservés. AGSP a été conçue pour changer cela, en offrant une plateforme simple et accessible qui permet à chaque citoyen de réserver un rendez-vous en ligne, sans se déplacer inutilement.
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <p className="text-3xl font-bold text-green-600 mb-2">0</p>
                    <p className="text-gray-500 text-sm">file d'attente pour prendre rendez-vous</p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Comment ça marche</h2>
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <p className="text-green-600 font-bold text-lg mb-2">1</p>
                        <p className="text-gray-800 font-medium">Choisissez l'administration</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <p className="text-green-600 font-bold text-lg mb-2">2</p>
                        <p className="text-gray-800 font-medium">Sélectionnez la démarche</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <p className="text-green-600 font-bold text-lg mb-2">3</p>
                        <p className="text-gray-800 font-medium">Réservez un créneau</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <p className="text-green-600 font-bold text-lg mb-2">4</p>
                        <p className="text-gray-800 font-medium">Recevez votre confirmation</p>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Nos engagements</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-gray-200">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2"></span>
                        <div>
                            <p className="text-gray-900 font-semibold mb-1">Service gratuit</p>
                            <p className="text-gray-600 text-sm">
                                La prise de rendez-vous via AGSP ne nécessite aucun paiement.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-gray-200">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                        <div>
                            <p className="text-gray-900 font-semibold mb-1">Données sécurisées</p>
                            <p className="text-gray-600 text-sm">
                                Les informations transmises par les citoyens sont protégées et utilisées uniquement pour le traitement de leur demande.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default About;