import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { Send, Bot, ArrowLeft, Sparkles } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width: screenWidth } = Dimensions.get("window");

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AITutor() {
  const [inputText, setInputText] = useState("");
  const API_URL = Constants.expoConfig?.extra?.apiUrl;
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm your AI Nutrition Guide. I can help you with meal planning, nutrition advice, and healthy eating tips. What would you like to know today?",
    },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Colors for both light and dark modes
  const colors = {
    primary: isDarkMode ? "#059669" : "#059669",
    darkPrimary: isDarkMode ? "#065f46" : "#065f46",
    background: isDarkMode ? "#0f172a" : "#f0fdf4",
    card: isDarkMode ? "#1e293b" : "#ffffff",
    text: isDarkMode ? "#f1f5f9" : "#1f2937",
    secondaryText: isDarkMode ? "#94a3b8" : "#64748b",
    border: isDarkMode ? "#334155" : "#d1fae5",
    inputBackground: isDarkMode ? "#1e293b" : "#f0fdf4",
    aiBubble: isDarkMode ? "#1e293b" : "#f0fdf4",
    userBubble: isDarkMode ? "#065f46" : "#059669",
    disabledButton: isDarkMode ? "#1e3a5f" : "#a7f3d0",
  };

  const saveChatLog = async (userMessage: string, aiMessage: string) => {
    const userId = await AsyncStorage.getItem("userId");
    try {
      await fetch(`${API_URL}/api/chatlogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userMessage,
          botReply: aiMessage,
        }),
      });
    } catch (err) {
      console.warn("Failed to save chat log:", err);
    }
  };
  useEffect(() => {
    const loadChatHistory = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await fetch(
          `${API_URL}/api/chatlogs/user/${userId}/messages`
        );
        const data: Message[] = await res.json();

        if (Array.isArray(data)) {
          setMessages([
            {
              role: "assistant",
              content:
                "Welcome back! Let's continue your healthy eating journey.",
            },
            ...data,
          ]);
        }
      } catch (err) {
        console.warn("Could not load chat history:", err);
      }
    };

    loadChatHistory();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await fetch("https://healthyeats2-0.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error("Failed to fetch AI response");

      const data = await response.json();

      // Assuming response shape: { reply: string }
      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
      saveChatLog(userMessage.content, aiMessage.content);
      // Optionally: Save the conversation locally or trigger any logging here
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the AI right now. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.darkPrimary, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <LinearGradient
              colors={[colors.primary, colors.darkPrimary]}
              style={styles.tutorAvatar}
            >
              <Sparkles size={24} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>AI Nutrition Guide</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping
                  ? "Analyzing your query..."
                  : "Your personal wellness assistant"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={[
          styles.messagesContainer,
          { backgroundColor: colors.background },
        ]}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.role === "user" ? styles.userMessageContainer : null,
            ]}
          >
            {msg.role === "assistant" && (
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.darkPrimary]}
                  style={styles.avatar}
                >
                  <Sparkles size={18} color="#FFF" />
                </LinearGradient>
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                msg.role === "assistant"
                  ? [styles.aiBubble, { backgroundColor: colors.aiBubble }]
                  : [styles.userBubble, { backgroundColor: colors.userBubble }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.role === "assistant"
                    ? { color: colors.text }
                    : styles.userMessageText,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageContainer, styles.typingContainer]}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[colors.primary, colors.darkPrimary]}
                style={styles.avatar}
              >
                <Sparkles size={18} color="#FFF" />
              </LinearGradient>
            </View>
            <View
              style={[
                styles.typingBubble,
                { backgroundColor: colors.aiBubble },
              ]}
            >
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[styles.typingText, { color: colors.secondaryText }]}
                >
                  Analyzing nutrition info...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Ask about nutrition, meal plans, or healthy recipes..."
            placeholderTextColor={colors.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (!inputText.trim() || isTyping) && [
                styles.disabledSendButton,
                { backgroundColor: colors.disabledButton },
              ],
            ]}
            disabled={!inputText.trim() || isTyping}
            onPress={handleSend}
          >
            {isTyping ? (
              <ActivityIndicator size={20} color="#FFF" />
            ) : (
              <Send size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tutorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  messageBubble: {
    maxWidth: screenWidth * 0.8,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFF",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  typingBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    fontSize: 14,
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 32,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledSendButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
});
