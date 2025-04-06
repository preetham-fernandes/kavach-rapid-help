// admin-webapp/src/lib/sos-utils.ts
import { supabase } from '@/lib/supabase';

export interface SosReport {
  id: string;
  user_id: string;
  audio_url: string | null;
  location: {
    address?: string;
    lat?: number;
    long?: number;
  } | null;
  additional_details: string | null;
  status: 'pending' | 'responding' | 'resolved';
  emergency_contact: string | null;
  created_at: string;
}

export async function fetchSosReports(): Promise<SosReport[]> {
  try {
    const { data, error } = await supabase
      .from('crime_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching SOS reports:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch SOS reports:', error);
    return [];
  }
}

export async function fetchSosReportById(id: string): Promise<SosReport | null> {
  try {
    const { data, error } = await supabase
      .from('crime_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching SOS report with id ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch SOS report with id ${id}:`, error);
    return null;
  }
}

export async function updateSosReportStatus(id: string, status: 'pending' | 'responding' | 'resolved'): Promise<void> {
  try {
    const { error } = await supabase
      .from('crime_reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(`Error updating SOS report status:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Failed to update SOS report status:`, error);
    throw error;
  }
}

export function getAudioUrl(url: string | null): string | null {
  if (!url) return null;
  
  // If the URL is already a full URL, return it
  if (url.startsWith('http')) return url;
  
  // Otherwise, get the public URL from Supabase
  try {
    const { data } = supabase.storage.from('crime-recordings').getPublicUrl(url);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return null;
  }
}

export function formatLocation(location: any): string {
    if (!location) return 'Unknown location';
    
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return location;
      }
    }
    
    if (location.address) return location.address;
    
    if (location.coordinates && location.coordinates.latitude && location.coordinates.longitude) {
      return `Lat: ${location.coordinates.latitude}, Long: ${location.coordinates.longitude}`;
    }
    
    return 'Unknown location';
  }

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-red-500';
    case 'responding':
      return 'bg-amber-500';
    case 'resolved':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}