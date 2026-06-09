// frontend/src/services/TrackingService.js
import { supabase } from '../supabaseClient';

class TrackingService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.country = null;
    this.city = null;
    this.region = null;
    this.geoLoaded = false;
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  async getCountry() {
    // Si déjà chargé, retourner directement
    if (this.geoLoaded) {
      return { country: this.country, city: this.city, region: this.region };
    }

    try {
      // Utiliser l'API gratuite ipapi.co avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        this.country = data.country_name || data.country || 'Tunisie';
        this.city = data.city || 'Monastir';
        this.region = data.region || 'Monastir';
      } else {
        // Valeurs par défaut pour la Tunisie
        this.country = 'Tunisie';
        this.city = 'Monastir';
        this.region = 'Monastir';
      }
    } catch (error) {
      // Valeurs par défaut en cas d'erreur
      this.country = 'Tunisie';
      this.city = 'Monastir';
      this.region = 'Monastir';
    }
    
    this.geoLoaded = true;
    return { country: this.country, city: this.city, region: this.region };
  }

  getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    
    let deviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    if (isTablet) deviceType = 'tablet';
    
    let browser = 'unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';
    
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    return {
      device_type: deviceType,
      browser: browser,
      os: os,
      screen_resolution: `${window.screen.width}x${window.screen.height}`
    };
  }

  async trackPageView(pageUrl, userEmail = null) {
    // Ne pas bloquer l'application
    try {
      const [geoData, deviceInfo] = await Promise.all([
        this.getCountry(),
        Promise.resolve(this.getDeviceInfo())
      ]);
      
      const data = {
        session_id: this.sessionId,
        page_url: pageUrl,
        page_title: document.title || 'Centre Certus',
        referrer: document.referrer || null,
        country: geoData.country,
        city: geoData.city,
        region: geoData.region,
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screen_resolution: deviceInfo.screen_resolution,
        language: navigator.language || 'fr',
        user_email: userEmail,
        created_at: new Date().toISOString()
      };
      
      // Envoi asynchrone sans await pour ne pas bloquer
      supabase
        .from('tracking_page_views')
        .insert(data)
        .then(({ error }) => {
          if (error) console.debug('Tracking DB error:', error.message);
        })
        .catch(err => console.debug('Tracking error:', err.message));
        
    } catch (err) {
      // Erreur silencieuse - ne pas polluer la console
      console.debug('Tracking error:', err.message);
    }
  }

  async trackClick(elementType, elementName, additionalData = {}, userEmail = null) {
    try {
      const data = {
        session_id: this.sessionId,
        page_url: window.location.pathname,
        element_type: elementType,
        element_name: elementName,
        additional_data: additionalData,
        user_email: userEmail,
        created_at: new Date().toISOString()
      };
      
      supabase
        .from('tracking_clicks')
        .insert(data)
        .then(({ error }) => {
          if (error) console.debug('Click tracking error:', error.message);
        })
        .catch(err => console.debug('Click tracking error:', err.message));
        
    } catch (err) {
      console.debug('Click tracking error:', err.message);
    }
  }
}

export const trackingService = new TrackingService();