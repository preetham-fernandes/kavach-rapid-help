import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  ChatScreen: undefined;
  ReportSos: undefined;
  Community: undefined;
  Profile: undefined;
};

// Create a reference to hold navigation
let globalNavigation: NavigationProp<RootStackParamList>;

// Configure axios instance
const api = axios.create({
  baseURL: 'http://172.20.10.2:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptors for token handling
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('http://172.20.10.2:5000/api/auth/refresh', {
          refreshToken
        });

        const { token: newToken } = response.data;
        await AsyncStorage.setItem('authToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (globalNavigation) {
                  globalNavigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Login' as keyof RootStackParamList }],
                    })
                  );
                }
              }
            }
          ]
        );
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const ReportSos = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasNetwork, setHasNetwork] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Set navigation reference
  useEffect(() => {
    globalNavigation = navigation;
  }, [navigation]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const [storedUser, authToken] = await AsyncStorage.multiGet(['user', 'authToken']);
        
        if (!storedUser[1] || !authToken[1]) {
          Alert.alert('Authentication Required', 'Please login to report a crime.');
          navigation.navigate('Login' as keyof RootStackParamList);
          return;
        }
        
        setUser(JSON.parse(storedUser[1]));
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data. Please login again.');
        navigation.navigate('Login' as keyof RootStackParamList);
      }
    };
    loadUser();
  }, [navigation]);

  useEffect(() => {
    Alert.alert(
      'Important Disclaimer',
      'This platform is for reporting crimes. False reporting is a punishable offense. Please provide accurate information.',
      [{ text: 'I Understand' }]
    );
  }, []);

  useEffect(() => {
    const setupLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        setLocation
      );

      return () => sub.remove();
    };
    setupLocation();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setHasNetwork(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setAudioUri(uri);
    } catch (err) {
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      await sound.playAsync();
    } catch {
      Alert.alert('Playback Error', 'Could not play the audio');
    }
  };

  const uploadAudioToSupabase = async (): Promise<string> => {
    if (!audioUri || !user?.id) throw new Error('Missing audio or user ID');

    const fileName = `user_${user.id}/${Date.now()}_recording.wav`;
    const base64Data = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from('crime-recordings')
      .upload(fileName, decode(base64Data), {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (error) throw error;

    const signedUrlResponse = await supabase.storage
      .from('crime-recordings')
      .createSignedUrl(data.path, 3600);

    if (!signedUrlResponse.data?.signedUrl) {
      throw new Error('Failed to get signed URL');
    }

    return signedUrlResponse.data.signedUrl;
  };

  const submitReport = async () => {
    if (!location || !audioUri || !user?.id) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setIsSubmitting(true);

    try {
      const audioUrl = await uploadAudioToSupabase();

      const response = await api.post('/report/submit', {
        audioUrl,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        userId: user.id,
      });

      setAudioUri(null);
      Alert.alert('Success', 'Crime report submitted successfully');
    } catch (error: any) {
      console.error('Submission error:', error);
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please Login again',
          [{ text: 'OK', onPress: () => navigation.navigate('Login' as keyof RootStackParamList) }]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error || 'Submission failed. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendEmergencySMS = async () => {
    if (!location || !user?.id) {
      Alert.alert('Error', 'Location data missing');
      return;
    }

    try {
      await api.post('/report/emergency', {
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        userId: user.id,
      });
      Alert.alert('Alert Sent', 'Help is on the way!');
    } catch (error: any) {
      console.error('Emergency error:', error);
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please Login again',
          [{ text: 'OK', onPress: () => navigation.navigate('Login' as keyof RootStackParamList) }]
        );
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to send emergency alert');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Crime</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Voice Recording</Text>
        <TouchableOpacity
          style={[styles.button, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        {audioUri && (
          <>
            <Text style={styles.successText}>Recording saved successfully</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#6c757d' }]}
              onPress={playAudio}
            >
              <Text style={styles.buttonText}>Play Recording</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Location</Text>
        {location ? (
          <Text style={styles.locationText}>
            Location captured: {'\n'}
            Lat: {location.coords.latitude.toFixed(6)}{'\n'}
            Long: {location.coords.longitude.toFixed(6)}{'\n'}
          </Text>
        ) : (
          <ActivityIndicator size="small" color="#0000ff" />
        )}
      </View>


      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={submitReport}
          disabled={isSubmitting || !location || !audioUri || !user}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.emergencyButton]}
          onPress={sendEmergencySMS}
          disabled={!location || !user}
        >
          <Text style={styles.buttonText}>Send Emergency Alert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a73e8',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  recordingButton: {
    backgroundColor: '#dc3545',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  emergencyButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  successText: {
    color: '#28a745',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default ReportSos;