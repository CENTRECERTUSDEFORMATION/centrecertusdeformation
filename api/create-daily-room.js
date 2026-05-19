// frontend/api/create-daily-room.js
export default async function handler(req, res) {
  // Autoriser CORS pour le développement
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { roomName, formationId } = req.body;

  if (!roomName) {
    return res.status(400).json({ error: 'roomName requis' });
  }

  // Ta clé API Daily
  const DAILY_API_KEY = 'a130a99015bbb668b7a2993537ab3802c96cb8bdcd0b2528d8ef90cc4db57065';

  try {
    console.log('Création salle Daily:', roomName);
    
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public',
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          lang: 'fr',
          enable_network_ui: true,
          enable_prejoin_ui: true,
          exp: Math.floor(Date.now() / 1000) + 7200
        }
      })
    });

    const data = await response.json();
    console.log('Réponse Daily:', data);
    
    if (response.ok && data.url) {
      return res.status(200).json({ success: true, url: data.url });
    } else {
      return res.status(500).json({ success: false, error: data.error || 'Erreur Daily', message: data.info });
    }
  } catch (error) {
    console.error('Erreur Daily:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}