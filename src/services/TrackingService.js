// frontend/src/services/TrackingService.js
import { supabase } from "../supabaseClient";

class TrackingService {
  constructor() {
    this.sessionId = this.getSessionId();
    this.deviceInfo = this.getDeviceInfo();
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
  }

  getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    
    let deviceType = 'desktop';
    if (isMobile) deviceType = 'mobile';
    if (isTablet) deviceType = 'tablet';
    
    let browser = 'Inconnu';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';
    
    let os = 'Inconnu';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    return { deviceType, browser, os };
  }

  async getCountry() {
    // Vérifier si déjà en cache
    if (sessionStorage.getItem('user_country')) {
      return sessionStorage.getItem('user_country');
    }
    
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const country = data.country_name || 'Inconnu';
      sessionStorage.setItem('user_country', country);
      return country;
    } catch (error) {
      console.error("Erreur géolocalisation:", error);
      return 'Inconnu';
    }
  }

  async trackPageView(page, userEmail = null) {
    try {
      const country = await this.getCountry();
      const { deviceType, browser, os } = this.deviceInfo;
      
      console.log("📊 Tracking:", { page, country, deviceType, browser });
      
      const { error } = await supabase
        .from("tracking_page_views")
        .insert([{
          session_id: this.sessionId,
          page_url: window.location.pathname,
          page_title: page,
          country: country,
          device_type: deviceType,
          browser: browser,
          os: os,
          created_at: new Date().toISOString(),
          user_email: userEmail
        }]);
      
      if (error) {
        console.error("❌ Erreur tracking:", error);
      } else {
        console.log("✅ Visite enregistrée - Pays:", country, "Appareil:", deviceType);
      }
    } catch (err) {
      console.error("❌ Erreur tracking:", err);
    }
  }
}

export const trackingService = new TrackingService();

export const useTracking = () => {
  const trackPageView = (page, user) => trackingService.trackPageView(page, user?.email);
  return { trackPageView };
};