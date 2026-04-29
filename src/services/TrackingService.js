// frontend/src/services/TrackingService.js
import { supabase } from "../supabaseClient";

class TrackingService {
  constructor() {
    this.sessionId = this.getSessionId();
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
  }

  async trackPageView(page, userEmail = null) {
    try {
      console.log("📊 Tracking page:", page);
      
      const { error } = await supabase
        .from("tracking_page_views")
        .insert([{
          session_id: this.sessionId,
          page_url: window.location.pathname,
          page_title: page,
          created_at: new Date().toISOString(),
          user_email: userEmail
        }]);
      
      if (error) {
        console.error("Erreur tracking:", error);
      } else {
        console.log("✅ Visite enregistrée");
      }
    } catch (err) {
      console.error("Erreur tracking:", err);
    }
  }
}

export const trackingService = new TrackingService();

export const useTracking = () => {
  const trackPageView = (page, user) => trackingService.trackPageView(page, user?.email);
  return { trackPageView };
};