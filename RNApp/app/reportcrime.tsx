import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from './supabase'; // Adjust path to your supabase client

const ReportCrime = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasNetwork, setHasNetwork] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUser();
  }, []);

  // Show initial disclaimer
  useEffect(() => {
    Alert.alert(
      'Important Disclaimer',
      'This platform is for reporting crimes. False reporting is a punishable offense. Please provide accurate information.',
      [{ text: 'I Understand', style: 'default' }]
    );
  }, []);

  // Location tracking
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      return () => {
        locationSubscription.remove();
      };
    })();
  }, []);

  // Network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setHasNetwork(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Audio recording functions
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
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const uploadAudioToSupabase = async () => {
    if (!audioUri || !user?.id) return null;

    try {
      const audioBlob = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = `recording_${user.id}_${Date.now()}.wav`;
      const filePath = `crime-recordings/${fileName}`;

      const { data, error } = await supabase.storage
        .from('crime-recordings')
        .upload(filePath, FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        }), {
          contentType: 'audio/wav',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('crime-recordings')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  };

  const submitReport = async () => {
    if (!location || !audioUri || !user?.id) {
      Alert.alert('Error', 'Please provide both audio and location');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload audio to Supabase
      const audioUrl = await uploadAudioToSupabase();
      
      // 2. Submit report to backend
      const response = await axios.post('http://YOUR_SERVER_IP:5000/api/report/submit', {
        audioUrl,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        userId: user.id
      });

      Alert.alert('Success', 'Report submitted successfully');
      setAudioUri(null);
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.error || 'Failed to submit report'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendEmergencySMS = async () => {
    if (!location || !user?.id) {
      Alert.alert('Error', 'Location information missing');
      return;
    }

    try {
      const response = await axios.post('http://YOUR_SERVER_IP:5000/api/report/emergency', {
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        userId: user.id
      });

      Alert.alert('Success', 'Emergency alert sent to your contacts');
    } catch (error) {
      console.error('Emergency SMS error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.error || 'Failed to send emergency alert'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Crime</Text>

      {/* Audio Recording Section */}
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
          <Text style={styles.successText}>Recording saved successfully</Text>
        )}
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Location</Text>
        {location ? (
          <Text style={styles.locationText}>
            Location captured: {'\n'}
            Lat: {location.coords.latitude.toFixed(6)}{'\n'}
            Long: {location.coords.longitude.toFixed(6)}
          </Text>
        ) : (
          <ActivityIndicator size="small" color="#0000ff" />
        )}
      </View>

      {/* Submit Section */}
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

        {!hasNetwork && (
          <TouchableOpacity
            style={[styles.button, styles.emergencyButton]}
            onPress={sendEmergencySMS}
          >
            <Text style={styles.buttonText}>Send Emergency Alert</Text>
          </TouchableOpacity>
        )}
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
});

export default ReportCrime;