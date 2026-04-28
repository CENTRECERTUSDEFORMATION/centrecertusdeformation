// frontend/src/services/TrackingService.js
import { supabase } from "../supabaseClient";
import UAParser from 'ua-parser-js';

class TrackingService {
  constructor() {
    this.sessionId = this.getSessionId();
    this.visitStartTime = Date.now();
    this.isTrackingEnabled = true; // Désactiver en développement si besoin
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
  }

  async getLocationFromIP() {
    try {
      // Utiliser localStorage pour mettre en cache la géolocalisation
      const cachedLocation = localStorage.getItem('user_location');
      if (cachedLocation) {
        return JSON.parse(cachedLocation);
      }
      
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const location = {
        country: data.country_name,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        ip: data.ip
      };
      
      // Cache pour 24 heures
      localStorage.setItem('user_location', JSON.stringify(location));
      return location;
    } catch (error) {
      console.error('Erreur géolocalisation IP:', error);
      return null;
    }
  }

  getDeviceInfo() {
    // Mettre en cache les infos appareil
    if (this.cachedDeviceInfo) return this.cachedDeviceInfo;
    
    const parser = new UAParser();
    const result = parser.getResult();
    this.cachedDeviceInfo = {
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name,
      browserVersion: result.browser.version,
      os: result.os.name,
      osVersion: result.os.version,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language
    };
    return this.cachedDeviceInfo;
  }

  getReferrer() {
    return document.referrer || 'direct';
  }

  // Tracking non bloquant avec setTimeout
  trackPageView(page, userEmail = null) {
    // Ne pas bloquer le chargement de la page
    setTimeout(async () => {
      try {
        const location = await this.getLocationFromIP();
        const deviceInfo = this.getDeviceInfo();
        
        const pageView = {
          session_id: this.sessionId,
          page_url: window.location.pathname,
          page_title: page,
          referrer: this.getReferrer(),
          country: location?.country || 'Inconnu',
          city: location?.city || 'Inconnu',
          region: location?.region || 'Inconnu',
          latitude: location?.latitude,
          longitude: location?.longitude,
          timezone: location?.timezone,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          browser_version: deviceInfo.browserVersion,
          os: deviceInfo.os,
          screen_resolution: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
          language: deviceInfo.language,
          user_email: userEmail,
          visit_duration: 0,
          created_at: new Date().toISOString()
        };

        await supabase
          .from("tracking_page_views")
          .insert([pageView]);
      } catch (error) {
        console.error("Erreur tracking:", error);
      }
    }, 100); // Attendre 100ms après le chargement
  }

  trackClick(elementType, elementName, additionalData = {}) {
    // Tracking des clics peut rester immédiat car peu fréquent
    setTimeout(async () => {
      try {
        const click = {
          session_id: this.sessionId,
          page_url: window.location.pathname,
          element_type: elementType,
          element_name: elementName,
          additional_data: additionalData,
          created_at: new Date().toISOString(),
          user_email: additionalData.userEmail || null
        };

        await supabase
          .from("tracking_clicks")
          .insert([click]);
      } catch (error) {
        console.error("Erreur tracking click:", error);
      }
    }, 50);
  }

  endSession() {
    const visitDuration = Math.floor((Date.now() - this.visitStartTime) / 1000);
    
    supabase
      .from("tracking_page_views")
      .update({ visit_duration: visitDuration })
      .eq("session_id", this.sessionId)
      .is("visit_duration", 0)
      .then(() => {});
  }
}

export const trackingService = new TrackingService();

export const useTracking = () => {
  const trackPageView = (page, user) => trackingService.trackPageView(page, user?.email);
  const trackClick = (elementType, elementName, user) => 
    trackingService.trackClick(elementType, elementName, { userEmail: user?.email });
  
  return { trackPageView, trackClick };
};