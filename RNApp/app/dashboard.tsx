import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Vibration,
  Platform
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Location from 'expo-location'
import Feather from 'react-native-vector-icons/Feather'
import AsyncStorage from '@react-native-async-storage/async-storage'
import MapView, { Marker } from 'react-native-maps'
import { useRouter } from "expo-router";
import supabase from './supabase'
import ShakeDetector from './shakeDetector';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  ChatScreen: undefined;
  ReportSos: undefined;
  Community: undefined;
  Profile: undefined;
};

interface DashboardScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>
}
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationCoords {
  latitude: number
  longitude: number
}

export default function DashboardScreen ({ navigation }: DashboardScreenProps) {
  const [user, setUser] = useState<{ email: string, id?: string } | null>(null)
  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLocationLoading, setIsLocationLoading] = useState(true)
  const router = useRouter();

  const handleChat = () => {
    router.push("/chatscreen");
  };

  const handleReportCrime = () => {
    router.push("/reportsos");
  };

  // Get user data
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data, error }: { data: { user: any } | null; error: any }) => {
        if (error || !data || !data.user) {
          navigation.replace('Login')
        } else {
          setUser(data.user)
        }
      })
  }, [navigation])

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        setIsLocationLoading(true)
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied')
          setIsLocationLoading(false)
          return
        }

        let location = await Location.getCurrentPositionAsync({})
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        })
      } catch (error) {
        setErrorMsg('Could not fetch location')
        console.error('Location error:', error)
      } finally {
        setIsLocationLoading(false)
      }
    })()
  }, [])

  const handleShakeDetected = () => {
    Alert.alert(
      'Emergency SOS',
      'Shake detected! Send emergency alert?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Vibration.cancel()
        },
        {
          text: 'Send',
          onPress: () => {
            if (location) {
              sendEmergencyAlert(location);
            } else {
              Alert.alert('Error', 'Location is not available.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const sendEmergencyAlert = async (location: Coordinates): Promise<void> => {
    try {
      // 🔔 Vibrate pattern to confirm SOS
      Vibration.vibrate([500, 200, 500, 200, 500]);
  
      if (!location) {
        Alert.alert('Error', 'Could not determine your location.');
        return;
      }
  
      // ✅ Get user from AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        Alert.alert('Error', 'User not logged in. Please log in and try again.');
        console.warn('No user found in AsyncStorage');
        return;
      }
  
      const user = JSON.parse(storedUser);
  
      // 💬 Notify user
      Alert.alert('Sending Alert', 'Please wait...');
  
      // 📡 Fetch full user data from Supabase
      const { data: userData, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (error || !userData) {
        console.error('DB Error:', error);
        Alert.alert('Error', 'Failed to fetch user data from database.');
        return;
      }
  
      if (!userData.emergency_contact) {
        Alert.alert('Error', 'No emergency contact found. Please update your profile.');
        return;
      }
  
      // 📍 Reverse geocode
      const address = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
  
      const addressText = address?.[0]
        ? `${address[0].name || ''}, ${address[0].street || ''}, ${address[0].city || ''}`
        : 'Unknown location';
  
      // 🚨 Send SOS to backend via Twilio
      const response = await fetch('http://172.20.10.2:5000/api/sos/send-sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactNumber: userData.emergency_contact,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: addressText,
          },
          userId: user.id,
          userEmail: user.email || 'unknown',
        }),
      });
  
      if (response.ok) {
        Alert.alert('Alert Sent', 'Help is on the way!');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to send alert: ${errorText}`);
      }
    } catch (err: any) {
      console.error('SOS error:', err);
      Alert.alert('Error', err.message || 'Failed to send emergency alert');
    }
  };
  
  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const handleSOSPress = () => {
    handleShakeDetected(); // Reuse the same alert flow
  };

  const handleLogout = async () => {
    await supabase.auth.signOut()
    Alert.alert('Logged Out', 'You have been logged out.')
    navigation.replace('Login')
  }

  return (
    <View style={styles.container}>
      {/* Shake Detector Component */}
      <ShakeDetector onShake={handleShakeDetected} />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <Text style={styles.appTitle}>SafetyNet</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statCardContent}>
                <View>
                  <Text style={styles.statLabel}>Your Safety Score</Text>
                  <Text style={styles.statValue}>87</Text>
                </View>
                <Text style={styles.statChange}>+1.5%</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.iconTextRow}>
                <Feather name='map-pin' size={20} color='#fff' />
                <Text style={styles.statCardText}>Live Map</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Feather name='alert-triangle' size={20} color='#dc2626' />
              <Text style={styles.alertTitle}>High Priority Alert</Text>
            </View>
            <Text style={styles.alertText}>
              Suspicious activity reported near Dadar Station
            </Text>
            <Text style={styles.alertSubtext}>Tap for details</Text>
          </View>
        </View>

        {/* Police Station & SOS */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.policeStationContainer}>
              <View>
                <Text style={styles.cardTitle}>Nearest Police Station</Text>
                <Text style={styles.cardText}>Colaba Police Station</Text>
                <Text style={styles.cardSubtext}>0.6 km away</Text>
              </View>
              <TouchableOpacity 
                style={styles.sosButton}
                onPress={handleSOSPress}
              >
                <Text style={styles.sosButtonText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Shake Instructions */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.iconTextRow}>
              <Feather name='alert-circle' size={20} color='#dc2626' />
              <Text style={styles.cardTitle}>Emergency Shake Feature</Text>
            </View>
            <Text style={styles.cardText}>
              Quickly shake your phone 3 times to trigger emergency alert
            </Text>
            <View style={styles.shakeExample}>
              <Feather name="alert-triangle" size={24} color="#dc2626" />
              <Text style={styles.shakeExampleText}>← Shake like this in danger</Text>
            </View>
          </View>
        </View>

        {/* Community Safety */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.iconTextRow}>
              <Feather name='users' size={20} color='#2563eb' />
              <Text style={styles.cardTitle}>Community Safety Meeting</Text>
            </View>
            <Text style={styles.cardText}>Saturday, March 30 at 6:00 PM</Text>
            <Text style={styles.cardSubtext}>
              Colaba Community Center, Near Gateway of India
            </Text>
          </View>
        </View>

        {/* User Location Section */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Location</Text>
            <View style={styles.mapContainer}>
              {isLocationLoading ? (
                <View style={styles.loadingContainer}>
                  <Feather name='loader' size={24} color='#2563eb' />
                  <Text style={styles.loadingText}>Loading map...</Text>
                </View>
              ) : errorMsg ? (
                <View style={styles.errorContainer}>
                  <Feather name='alert-circle' size={24} color='#dc2626' />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : location ? (
                <View>
                  <View style={styles.locationInfoContainer}>
                    <Feather name='map-pin' size={20} color='#2563eb' />
                    <Text style={styles.locationText}>
                      Location found: {location.latitude.toFixed(4)},{' '}
                      {location.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <View style={styles.mapView}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: location.latitude,
                          longitude: location.longitude
                        }}
                        title='Your location'
                        description='You are here'
                      />
                    </MapView>
                  </View>
                </View>
              ) : (
                <View style={styles.errorContainer}>
                  <Feather name='x-circle' size={24} color='#dc2626' />
                  <Text style={styles.errorText}>
                    Could not determine location
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome {user?.email}!</Text>
            <Text style={styles.infoText}>
              Your safety is our priority. This dashboard provides real-time
              safety information for your area.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Feather name='home' size={24} color='#2563eb' />
          <Text style={[styles.navButtonText, { color: '#2563eb' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Community')}
        >
          <Feather name='users' size={24} color='#6b7280' />
          <Text style={styles.navButtonText}>Community</Text>
        </TouchableOpacity>
        
        {/* Central Report Crime Button */}
        <TouchableOpacity 
          style={styles.reportNavButton}
          onPress={handleReportCrime}
        >
          <Feather name='phone-call' size={28} color='white' />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={handleChat}
        >
          <Feather name='message-circle' size={24} color='#6b7280' />
          <Text style={styles.navButtonText}>IPC Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Feather name='user' size={24} color='#6b7280' />
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 70 // Space for bottom navigation
  },
  topSection: {
    backgroundColor: '#2563eb',
    padding: 16
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    flex: 1
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  statChange: {
    color: '#4ade80'
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statCardText: {
    color: 'white'
  },
  section: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  alertCard: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  alertTitle: {
    color: '#dc2626',
    fontWeight: '600'
  },
  alertText: {
    fontSize: 14,
    color: '#4b5563'
  },
  alertSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16
  },
  policeStationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563'
  },
  cardSubtext: {
    fontSize: 12,
    color: '#6b7280'
  },
  sosButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8
  },
  sosButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    minHeight: 150
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8
  },
  loadingText: {
    marginTop: 8,
    color: '#4b5563'
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8
  },
  errorText: {
    marginTop: 8,
    color: '#dc2626'
  },
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  locationText: {
    fontSize: 14,
    color: '#4b5563'
  },
  mapView: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20
  },
  shakeExample: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8
  },
  shakeExampleText: {
    marginLeft: 8,
    color: '#dc2626',
    fontWeight: '600'
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    flex: 1,
  },
  reportNavButton: {
    backgroundColor: '#dc2626',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30, // Makes it pop up above the nav bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: '#6b7280',
  }
})