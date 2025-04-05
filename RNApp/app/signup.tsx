import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type Address = {
  street: string
  city: string
  state: string
  pincode: string
}

const { width } = Dimensions.get('window')

export default function SignupScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const scrollViewRef = useRef<ScrollView>(null)

  const sendOtp = async () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Mobile number is required for OTP verification')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://172.20.10.3:5000/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobile: mobileNumber
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setOtpSent(true)
      Alert.alert(
        'OTP Sent',
        'Please check your mobile for the verification code'
      )
    } catch (error: any) {
      Alert.alert(
        'OTP Error',
        error.message || 'Failed to send OTP. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP')
      return
    }

    if (!mobileNumber) {
      Alert.alert('Error', 'Mobile number is required for verification')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://172.20.10.3:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobile: mobileNumber,
          otp: otp
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      if (data.verified) {
        await handleSignup()
      } else {
        throw new Error('OTP verification failed')
      }
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid OTP. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://172.20.10.3:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          mobileNumber,
          emergencyContact,
          aadhaarNumber,
          address,
          gender,
          age: parseInt(age) || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.push('/login') }
      ])
    } catch (error: any) {
      console.error('Signup error:', error)
      Alert.alert(
        'Signup Failed',
        error.message || 'An error occurred during signup'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && (!fullName || !email || !password)) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
    }
  }

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map(step => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= step ? styles.activeStep : styles.inactiveStep
              ]}
            >
              {currentStep > step ? (
                <Ionicons name='checkmark' size={16} color='white' />
              ) : (
                <Text
                  style={
                    currentStep >= step
                      ? styles.activeStepText
                      : styles.inactiveStepText
                  }
                >
                  {step}
                </Text>
              )}
            </View>
            {step < 4 && (
              <View
                style={[
                  styles.stepLine,
                  currentStep > step
                    ? styles.activeStepLine
                    : styles.inactiveStepLine
                ]}
              />
            )}
          </View>
        ))}
      </View>
    )
  }

  const renderStepTitle = () => {
    const titles = [
      'Basic Information',
      'Contact Details',
      'Personal Information',
      'OTP Verification'
    ]

    return <Text style={styles.stepTitle}>{titles[currentStep - 1]}</Text>
  }

  const renderStep1 = () => {
    return (
      <>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='person-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='John Doe'
              value={fullName}
              onChangeText={setFullName}
              style={styles.inputField}
              autoCapitalize='words'
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='mail-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='example@email.com'
              value={email}
              onChangeText={setEmail}
              style={styles.inputField}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='lock-closed-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='Minimum 8 characters'
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={[styles.inputField, { paddingRight: 50 }]}
              autoComplete='new-password'
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color='#6b7280'
              />
            </TouchableOpacity>
          </View>
        </View>
      </>
    )
  }

  const renderStep2 = () => {
    return (
      <>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='call-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='With country code (e.g. +1234567890)'
              value={mobileNumber}
              onChangeText={setMobileNumber}
              style={styles.inputField}
              keyboardType='phone-pad'
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Emergency Contact</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='alert-circle-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='Emergency contact number'
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              style={styles.inputField}
              keyboardType='phone-pad'
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Aadhaar Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='id-card-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='12-digit Aadhaar number'
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
              style={styles.inputField}
              keyboardType='number-pad'
              maxLength={12}
            />
          </View>
        </View>
      </>
    )
  }

  const renderStep3 = () => {
    return (
      <>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Street Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='home-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='123 Main Street'
              value={address.street}
              onChangeText={text => setAddress({ ...address, street: text })}
              style={styles.inputField}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>City</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name='business-outline'
                size={20}
                color='#6b7280'
                style={styles.inputIcon}
              />
              <TextInput
                placeholder='City'
                value={address.city}
                onChangeText={text => setAddress({ ...address, city: text })}
                style={styles.inputField}
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.inputLabel}>State</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name='map-outline'
                size={20}
                color='#6b7280'
                style={styles.inputIcon}
              />
              <TextInput
                placeholder='State'
                value={address.state}
                onChangeText={text => setAddress({ ...address, state: text })}
                style={styles.inputField}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Pincode</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name='location-outline'
              size={20}
              color='#6b7280'
              style={styles.inputIcon}
            />
            <TextInput
              placeholder='Postal code'
              value={address.pincode}
              onChangeText={text => setAddress({ ...address, pincode: text })}
              style={styles.inputField}
              keyboardType='number-pad'
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name='people-outline'
                size={20}
                color='#6b7280'
                style={styles.inputIcon}
              />
              <TextInput
                placeholder='Gender'
                value={gender}
                onChangeText={setGender}
                style={styles.inputField}
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Age</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name='calendar-outline'
                size={20}
                color='#6b7280'
                style={styles.inputIcon}
              />
              <TextInput
                placeholder='Age'
                value={age}
                onChangeText={setAge}
                style={styles.inputField}
                keyboardType='number-pad'
              />
            </View>
          </View>
        </View>
      </>
    )
  }

  const renderStep4 = () => {
    return (
      <>
        {!otpSent ? (
          <TouchableOpacity
            onPress={sendOtp}
            style={styles.otpButton}
            disabled={isLoading || (!email && !mobileNumber)}
          >
            {isLoading ? (
              <ActivityIndicator color='white' />
            ) : (
              <>
                <Ionicons
                  name='shield-checkmark-outline'
                  size={18}
                  color='white'
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>Send Verification OTP</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter OTP</Text>
              <View style={styles.otpInputContainer}>
                {[0, 1, 2, 3, 4, 5].map(index => (
                  <TextInput
                    key={index}
                    style={styles.otpDigit}
                    maxLength={1}
                    keyboardType='number-pad'
                    value={otp[index] || ''}
                    onChangeText={value => {
                      const newOtp = otp.split('')
                      newOtp[index] = value
                      setOtp(newOtp.join(''))
                    }}
                  />
                ))}
              </View>
            </View>
            <TouchableOpacity
              onPress={verifyOtp}
              style={styles.verifyButton}
              disabled={isLoading || otp.length < 6}
            >
              {isLoading ? (
                <ActivityIndicator color='white' />
              ) : (
                <>
                  <Ionicons
                    name='checkmark-circle-outline'
                    size={18}
                    color='white'
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Verify OTP</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      default:
        return null
    }
  }

  const renderNavButtons = () => {
    return (
      <View style={styles.navButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={prevStep}
            disabled={isLoading}
          >
            <Ionicons
              name='arrow-back'
              size={18}
              color='#4b5563'
              style={{ marginRight: 8 }}
            />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < 4 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 1 &&
                (!email || !password || !fullName) &&
                styles.disabledButton,
              { flex: currentStep > 1 ? 0.48 : 1 }
            ]}
            onPress={nextStep}
            disabled={
              isLoading ||
              (currentStep === 1 && (!email || !password || !fullName))
            }
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons
              name='arrow-forward'
              size={18}
              color='white'
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.signupButton,
              (!email || !password || !fullName) && styles.disabledButton,
              { flex: currentStep > 1 ? 0.48 : 1 }
            ]}
            onPress={handleSignup}
            disabled={isLoading || !email || !password || !fullName}
          >
            {isLoading ? (
              <ActivityIndicator color='white' />
            ) : (
              <>
                <Text style={styles.buttonText}>Create Account</Text>
                <Ionicons
                  name='checkmark-circle'
                  size={18}
                  color='white'
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us today and get started</Text>
          </View>

          {renderStepIndicator()}
          {renderStepTitle()}

          <View style={styles.formContainer}>{renderCurrentStep()}</View>

          {renderNavButtons()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => router.push('/login')}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center'
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeStep: {
    backgroundColor: '#007bff'
  },
  inactiveStep: {
    backgroundColor: '#333'
  },
  activeStepText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  inactiveStepText: {
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 14
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 5
  },
  activeStepLine: {
    backgroundColor: '#007bff'
  },
  inactiveStepLine: {
    backgroundColor: '#333'
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center'
  },
  formContainer: {
    marginBottom: 24
  },
  inputContainer: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden'
  },
  inputIcon: {
    paddingHorizontal: 12,
    color: '#ccc'
  },
  inputField: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
    fontSize: 16,
    color: 'white'
  },
  passwordToggle: {
    position: 'absolute',
    right: 12
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  otpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  otpDigit: {
    width: (width - 80) / 6,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#333',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 0.48
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc'
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  footer: {
    alignItems: 'center',
    marginTop: 8
  },
  footerText: {
    fontSize: 14,
    color: '#ccc'
  },
  footerLink: {
    color: '#66b2ff',
    fontWeight: '600'
  }
})