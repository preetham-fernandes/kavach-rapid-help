import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Easing
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = "http://172.20.10.2:9000";

const ChatScreen = () => {
  // State and refs
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  // Typing animation
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [loading]);

  const sendMessage = async () => {
    if (!query.trim()) return;
    
    // Animate send button
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    const userMessage = createMessage(query, "user");
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    Keyboard.dismiss();

    // Animate message appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();

    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, 
        { query },
        { headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );

      const botMessage = createMessage(response.data.response, "bot");
      setMessages(prev => [...prev, botMessage]);
      
      // Animate bot response
      animateMessageAppearance();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const createMessage = (text: string, sender: "user" | "bot") => ({
    text,
    sender,
    timestamp: Date.now(),
    id: Math.random().toString(36).substring(7)
  });

  const animateMessageAppearance = () => {
    fadeAnim.setValue(0);
    slideUpAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true
      })
    ]).start();
  };

  const handleError = (error: any) => {
    const errorMessage = getErrorMessage(error);
    const botMessage = createMessage(errorMessage, "bot");
    setMessages(prev => [...prev, botMessage]);
    animateMessageAppearance();
    Alert.alert("Connection Error", errorMessage);
  };

  const getErrorMessage = (error: any) => {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") return "Request timeout. Server is not responding.";
      if (error.response?.status === 404) return "Endpoint not found. Check your API URL.";
      if (error.request) return "No response from server. Check your connection.";
    }
    return error.message || "Unknown error occurred";
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <Animated.View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userBubble : styles.botBubble,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <Text style={item.sender === "user" ? styles.userText : styles.botText}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );

  const renderTypingIndicator = () => (
    <Animated.View style={[
      styles.typingContainer,
      { opacity: typingAnim }
    ]}>
      <View style={styles.typingBubble}>
        {[0, 1, 2].map(i => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                transform: [{
                  translateY: typingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5]
                  })
                }]
              }
            ]}
          />
        ))}
      </View>
      <Text style={styles.typingText}>AI is thinking...</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 0 })}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Legal AI Assistant</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="sparkles" size={48} color="#3B82F6" />
              <Text style={styles.emptyTitle}>Ask me anything about Indian law</Text>
              <Text style={styles.emptySubtitle}>I can help explain IPC sections, legal concepts, and more</Text>
            </View>
          ) : (
            messages.map((msg, index) => (
              <View key={msg.id}>
                {renderMessage({ item: msg })}
                {index === messages.length - 1 && loading && renderTypingIndicator()}
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Area */}
        <BlurView intensity={90} tint="light" style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Type your legal question..."
              placeholderTextColor="#94A3B8"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!loading}
              multiline
              maxLength={500}
            />
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  !query.trim() || loading ? styles.disabledButton : styles.activeButton
                ]} 
                onPress={sendMessage}
                disabled={!query.trim() || loading}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerBackText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B'
  },
  headerRight: {
    width: 24
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  messagesContent: {
    paddingBottom: 20
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
    marginLeft: '20%'
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    marginRight: '20%',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  userText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24
  },
  botText: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 24
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 16
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
    marginHorizontal: 2
  },
  typingText: {
    fontSize: 14,
    color: '#64748B'
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.select({ ios: 16, android: 8 })
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 52,
    fontSize: 16,
    maxHeight: 120,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    lineHeight: 24
  },
  sendButton: {
    position: 'absolute',
    right: 24,
    bottom: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#CBD5E1'
  },
  activeButton: {
    backgroundColor: '#3B82F6'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: '30%'
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 24,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24
  }
});

type Message = {
  text: string;
  sender: "user" | "bot";
  timestamp: number;
  id: string;
};

export default ChatScreen;