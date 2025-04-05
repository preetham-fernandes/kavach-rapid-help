import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
// First, install expo-camera
// npm install expo-camera
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';
import Voice from '@react-native-voice/voice';
import { FontAwesome, Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';


// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI('AIzaSyCFA_ppwTGV1AQp5J7oeqJCis2cVzvIM3s'); // Replace with your actual API key


interface EvidenceData {
  uri: string;
  type: string;
}

interface Props {
  navigation: any;
}

const ReportSosScreen: React.FC<Props> = ({ navigation }) => {
  // State variables
  const [step, setStep] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const [speechText, setSpeechText] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [atCrimeScene, setAtCrimeScene] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('');
  const [evidence, setEvidence] = useState<{ uri: string; type: string } | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Set up Voice recognition listeners
  useEffect(() => {
    // Voice event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Request permissions on component mount
    const setupPermissions = async () => {
      // Request location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to report the crime location.');
      }

      // Request camera permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is needed to take photos.');
      }

      // Request media library permissions
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission required', 'Media library permission is needed to upload evidence.');
      }
    };

    setupPermissions();

    // Cleanup function
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Voice event handlers
  const onSpeechStart = () => {
    console.log('Speech started');
    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start timer to track recording duration
    durationInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setIsRecording(false);
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
  };

  const onSpeechResults = (event: any) => {
    if (event.value && event.value.length > 0) {
      const transcribedText = event.value[0];
      setSpeechText(transcribedText);
      console.log('Speech results:', transcribedText);
    }
  };

  const onSpeechError = (error: any) => {
    console.error('Speech recognition error:', error);
    setIsRecording(false);
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    Alert.alert('Error', 'Failed to recognize speech. Please try again.');
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop voice recording and process with Gemini
  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsProcessingAudio(true);
      
      // Process the speech text with Gemini to generate a summary
      if (speechText) {
        try {
          // Get the Gemini model
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          
          // Create a prompt for Gemini to summarize the crime report
          const prompt = `Summarize the following crime report in a clear, structured format. Extract key details like location, time, type of crime, description of suspects, and any other relevant information:
          
          "${speechText}"`;
          
          // Generate content with Gemini
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const processedText = response.text();
          
          setVoiceTranscript(processedText);
        } catch (error) {
          console.error('Error processing with Gemini:', error);
          // If Gemini processing fails, use the raw speech text
          setVoiceTranscript(speechText);
          Alert.alert('Warning', 'Could not process with AI. Using raw transcription instead.');
        }
      } else {
        Alert.alert('Error', 'No speech was detected. Please try again.');
      }
      
      setIsProcessingAudio(false);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setIsProcessingAudio(false);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    }
  };

  // Location handling functions
  const getCurrentLocation = async () => {
    try {
      // Ensure we have location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to report the crime location.');
        return;
      }

      // Get current position with high accuracy
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
      });
      
      // Update state with the location
      setLocation(currentLocation);
      
      // Get address from coordinates using reverse geocoding
      const addressResult = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      if (addressResult && addressResult.length > 0) {
        const addressData = addressResult[0];
        const formattedAddress = [
          addressData.name,
          addressData.street,
          addressData.district,
          addressData.city,
          addressData.region,
          addressData.postalCode,
          addressData.country,
        ].filter(Boolean).join(', ');
        
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please enter manually.');
    }
  };

  // Evidence handling functions
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const evidenceData: EvidenceData = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image',
        };
        setEvidence(evidenceData);
        setCameraVisible(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select from gallery. Please try again.');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setEvidence({ uri: photo.uri, type: 'image' });
          setCameraVisible(false);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate based on anonymity choice
    if (isAnonymous && !evidence) {
      Alert.alert('Evidence Required', 'Evidence is required for anonymous reports.');
      return;
    }
    
    // Prepare the report data
    const reportData = {
      isAnonymous: isAnonymous || false, // Default to false if null
      voiceTranscript,
      location: atCrimeScene ? location : null,
      address: address,
      evidence,
    };
    
    // Show loading indicator
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the data to your backend
      // For demo purposes, we'll just show a success message after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      Alert.alert(
        'Report Submitted',
        `Thank you for your report. The authorities have been notified. Your report ID is REP${Math.floor(Math.random() * 1000000)}.`,
        [{ 
          text: 'OK', 
          onPress: () => {
            resetForm();
            navigation.goBack();
          } 
        }]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setIsAnonymous(null);
    setIsRecording(false);
    setRecordingDuration(0);
    setSpeechText('');
    setVoiceTranscript('');
    setIsEditing(false);
    setAtCrimeScene(null);
    setLocation(null);
    setAddress('');
    setEvidence(null);
    setCameraVisible(false);
  };

  // Navigation functions
  const nextStep = () => {
    // Validate current step
    if (step === 1 && !voiceTranscript) {
      Alert.alert('Voice recording required', 'Please record your statement or enter a description of the incident.');
      return;
    }
    
    if (step === 2 && !address) {
      Alert.alert('Location required', 'Please provide the location of the incident.');
      return;
    }
    
    if (step === 3 && isAnonymous && !evidence) {
      Alert.alert('Evidence required', 'Evidence is required for anonymous reports.');
      return;
    }
    
    // If at the final step, submit the form
    if (step === 3) {
      handleSubmit();
      return;
    }
    
    // Skip evidence step for non-anonymous reports if desired
    if (step === 2 && isAnonymous === false) {
      // Ask if they want to skip evidence
      Alert.alert(
        'Add Evidence?',
        'You can skip adding evidence since you\'re reporting non-anonymously. Would you like to add evidence anyway?',
        [
          { text: 'Add Evidence', onPress: () => setStep(step + 1) },
          { text: 'Skip & Submit', onPress: handleSubmit }
        ]
      );
      return;
    }
    
    // Normal progression
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Render each step of the form
  const renderReportTypeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>File A Report</Text>
      
      <TouchableOpacity 
        style={[styles.optionButton, isAnonymous === true && styles.selectedOption]}
        onPress={() => setIsAnonymous(true)}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isAnonymous === true && styles.checkboxSelected]}>
            {isAnonymous === true && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[styles.optionText, isAnonymous === true && styles.selectedOptionText]}>Anonymous</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.optionButton, isAnonymous === false && styles.selectedOption]}
        onPress={() => setIsAnonymous(false)}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isAnonymous === false && styles.checkboxSelected]}>
            {isAnonymous === false && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[styles.optionText, isAnonymous === false && styles.selectedOptionText]}>Non-Anonymous</Text>
        </View>
      </TouchableOpacity>
      
      {isAnonymous === true && (
        <Text style={styles.infoText}>
          Anonymous reports require evidence submission and will not disclose your identity.
        </Text>
      )}
      
      {isAnonymous === false && (
        <Text style={styles.infoText}>
          Non-anonymous reports may allow for follow-up questions from authorities.
        </Text>
      )}
      
      <TouchableOpacity
        style={[styles.nextButton, isAnonymous === null && styles.disabledButton]}
        onPress={nextStep}
        disabled={isAnonymous === null}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVoiceRecording = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>1. Voice Recording</Text>
      <Text style={styles.stepDescription}>
        Record your statement about what happened. Speak clearly and include details about the incident.
      </Text>
      
      {isProcessingAudio ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.processingText}>Processing your recording with AI...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <FontAwesome name={isRecording ? "stop-circle" : "microphone"} size={40} color="#fff" />
        </TouchableOpacity>
      )}
      
      {isRecording && (
        <Text style={styles.recordingText}>
          Recording... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
        </Text>
      )}
      
      {!isRecording && voiceTranscript && !isEditing ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptTitle}>Incident Summary:</Text>
          <Text style={styles.transcript}>{voiceTranscript}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.submitButton]}
              onPress={nextStep}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
      
      {isEditing && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptTitle}>Edit Incident Summary:</Text>
          <TextInput
            style={styles.transcriptInput}
            multiline
            value={voiceTranscript}
            onChangeText={setVoiceTranscript}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.submitButton]}
              onPress={nextStep}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.navButton} onPress={prevStep}>
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLocationInput = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>2. Location</Text>
      <Text style={styles.stepDescription}>
        Provide the location where the incident occurred.
      </Text>
      
      <View style={styles.locationOptions}>
        <TouchableOpacity
          style={[styles.locationOption, atCrimeScene === true && styles.selectedOption]}
          onPress={() => {
            setAtCrimeScene(true);
            getCurrentLocation();
          }}
        >
          <MaterialIcons 
            name="my-location" 
            size={24} 
            color={atCrimeScene === true ? "#fff" : "#1e3a8a"} 
          />
          <Text style={[
            styles.locationOptionText, 
            atCrimeScene === true && styles.selectedOptionText
          ]}>
            I am at the crime scene
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.locationOption, atCrimeScene === false && styles.selectedOption]}
          onPress={() => {
            setAtCrimeScene(false);
            setAddress('');
          }}
        >
          <Entypo 
            name="location" 
            size={24} 
            color={atCrimeScene === false ? "#fff" : "#1e3a8a"} 
          />
          <Text style={[
            styles.locationOptionText, 
            atCrimeScene === false && styles.selectedOptionText
          ]}>
            I am away from the crime scene
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Address:</Text>
        <TextInput
          style={styles.addressInput}
          placeholder="Enter the location of the incident"
          multiline
          value={address}
          onChangeText={setAddress}
          editable={!atCrimeScene || atCrimeScene === null}
        />
      </View>
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.navButton} onPress={prevStep}>
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !address && styles.disabledButton]}
          onPress={nextStep}
          disabled={!address}
        >
          <Text style={[styles.navButtonText, address ? styles.nextButtonText : null]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEvidenceUpload = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>3. Evidence</Text>
      {isAnonymous && (
        <Text style={styles.requiredField}>!! Required field for filing anonymous report</Text>
      )}
      <Text style={styles.stepDescription}>
        Upload photos or videos as evidence for the incident.
      </Text>
      
      {cameraVisible ? (
        <View style={styles.cameraContainer}>
          {!permission ? (
            <View />
          ) : !permission.granted ? (
            <View style={styles.container}>
              <Text style={styles.stepDescription}>We need your permission to show the camera</Text>
              <TouchableOpacity 
                style={[styles.nextButton, { marginTop: 10 }]} 
                onPress={requestPermission}
              >
                <Text style={styles.buttonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
            >
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cameraButton} onPress={() => setCameraVisible(false)}>
                  <Ionicons name="close-circle" size={40} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                  <Ionicons name="camera" size={50} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cameraButton} 
                  onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                >
                  <Ionicons name="camera-reverse" size={40} color="#fff" />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      ) : (
        <View style={styles.evidenceContainer}>
          {evidence ? (
            <View style={styles.evidencePreview}>
              <Image source={{ uri: evidence.uri }} style={styles.evidenceImage} />
              <TouchableOpacity
                style={styles.removeEvidenceButton}
                onPress={() => setEvidence(null)}
              >
                <Ionicons name="close-circle" size={30} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.evidenceOptions}>
              <TouchableOpacity
                style={styles.evidenceOption}
                onPress={pickImage}
              >
                <Ionicons name="images" size={40} color="#1e3a8a" />
                <Text style={styles.evidenceOptionText}>Upload from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.evidenceOption}
                onPress={() => setCameraVisible(true)}
              >
                <Ionicons name="camera" size={40} color="#1e3a8a" />
                <Text style={styles.evidenceOptionText}>Use Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {!cameraVisible && (
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.navButton} onPress={prevStep}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              (isAnonymous === true && !evidence) && styles.disabledButton
            ]}
            onPress={nextStep}
            disabled={isAnonymous === true && !evidence}
          >
            <Text style={[
              styles.navButtonText, 
              !(isAnonymous === true && !evidence) && styles.nextButtonText
            ]}>
              Submit Report
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render progress indicator
  const renderProgressIndicator = () => {
    const totalSteps = 4; // Including report type selection
    
    return (
      <View style={styles.progressContainer}>
        {[...Array(totalSteps)].map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.progressStep,
              index <= step && styles.activeProgressStep
            ]}
          />
        ))}
      </View>
    );
  };

  // Render the main screen based on current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return renderReportTypeSelection();
      case 1:
        return renderVoiceRecording();
      case 2:
        return renderLocationInput();
      case 3:
        return renderEvidenceUpload();
      default:
        return null;
    }
  };

  // Main component render
  return (
    <View style={styles.container}>
      {renderProgressIndicator()}
      
      <ScrollView contentContainerStyle={styles.scrollView}>
        {isSubmitting ? (
          <View style={styles.submittingContainer}>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.submittingText}>Submitting your report...</Text>
          </View>
        ) : (
          renderStep()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressStep: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  activeProgressStep: {
    backgroundColor: '#1e3a8a',
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  stepContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  selectedOption: {
    backgroundColor: '#1e3a8a',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1e3a8a',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1e3a8a',
    borderColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 15,
  },
  nextButton: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#ff3b30',
  },
  recordingText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
    color: '#ff3b30',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  transcriptContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  transcript: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  transcriptInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#555',
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  navButtonText: {
    color: '#555',
    fontWeight: 'bold',
  },
  nextButtonText: {
    color: '#fff',
  },
  locationOptions: {
    marginVertical: 15,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  locationOptionText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  addressContainer: {
    marginVertical: 15,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  addressInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 100,
  },
  requiredField: {
    color: '#ff3b30',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  evidenceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    minHeight: 200,
  },
  evidenceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  evidenceOption: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#1e3a8a',
    borderRadius: 10,
    borderStyle: 'dashed',
    backgroundColor: '#f5f5f5',
    width: 150,
    height: 150,
    justifyContent: 'center',
  },
  evidenceOptionText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#1e3a8a',
  },
  evidencePreview: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  removeEvidenceButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'flex-end',
  },
  cameraButton: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    padding: 10,
  },
  submittingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  submittingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#1e3a8a',
    textAlign: 'center',
  }
});

export default ReportSosScreen;