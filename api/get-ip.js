// api/get-ip.js
export default async function handler(req, res) {
  // Ajouter les headers CORS pour la sécurité
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Répondre aux requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Retourner les données au frontend
    res.status(200).json({
      country_name: data.country_name || 'France',
      city: data.city || 'Inconnu',
      region: data.region || 'Inconnu',
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    });
  } catch (error) {
    console.error('Erreur API:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération de la géolocalisation",
      country_name: 'France',
      city: 'Inconnu'
    });
  }
}