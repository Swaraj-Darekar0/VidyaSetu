import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingPalette, getSubjectDefinition } from '@/constants/onboarding';
import { useLanguage } from '@/contexts/language';
import { useQAModel } from '@/hooks/useQAModel';
import { supabase } from '@/lib/supabase';

type OnlineImage = {
  title: string;
  imageUrl: string;
  pageUrl: string;
  thumbnailUrl?: string;
};

type OnlineVideo = {
  videoId: string;
  title: string;
  url: string;
  channelTitle?: string;
  publishedAt?: string;
};

type OnlineSource = {
  title: string;
  url: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  attachments?: {
    images?: OnlineImage[];
    videos?: OnlineVideo[];
    sources?: OnlineSource[];
  };
};

const offlineSeedConversation: Message[] = [
  {
    id: '1',
    role: 'user',
    text: "Explain Newton's first law of motion.",
  },
  {
    id: '2',
    role: 'assistant',
    text: "Newton's First Law of Motion, also known as the law of inertia, states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force.",
  },
  {
    id: '3',
    role: 'user',
    text: 'What about the second law?',
  },
  {
    id: '4',
    role: 'assistant',
    text: 'The second law states that the acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass (F = ma).',
  },
];

const onlineSeedConversation: Message[] = [
 
];

export default function SubjectAssistantScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId?: string }>();
  const { copy } = useLanguage();
  const subjectCopy = copy.subject;
  const [prompt, setPrompt] = useState('');
  const [offlineMode, setOfflineMode] = useState(true);
  const [offlineHistory, setOfflineHistory] = useState<Message[]>(offlineSeedConversation);
  const [onlineHistory, setOnlineHistory] = useState<Message[]>(onlineSeedConversation);
  const [isResponding, setIsResponding] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [classLoadError, setClassLoadError] = useState<string | null>(null);
  const micScale = useRef(new Animated.Value(1)).current;
  const wavePulse = useRef(new Animated.Value(0)).current;
  const waveLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const typingDots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;
  const typingLoopRef = useRef<Animated.CompositeAnimation[]>([]);

  const subjectDefinition = subjectId ? getSubjectDefinition(subjectId) : null;

  const pageTitle = useMemo(() => {
    if (!subjectDefinition) return 'Subject AI';
    return `${subjectDefinition.title} AI`;
  }, [subjectDefinition]);

  const { isReady: isOfflineReady, isLoading: isOfflineLoading, error: offlineDataError, findAnswer } = useQAModel(
    classId,
    subjectId ?? null,
  );

  const activeMessages = offlineMode ? offlineHistory : onlineHistory;
  const modeHintText = offlineMode ? subjectCopy.offlineHint : subjectCopy.onlineHint;
  const inputPlaceholder = offlineMode ? subjectCopy.offlinePlaceholder : subjectCopy.onlinePlaceholder;
  const isSendDisabled = !prompt.trim() || isResponding;

  useEffect(() => {
    let isMounted = true;

    const loadClassPreference = async () => {
      try {
        setClassLoadError(null);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user?.id) throw new Error('Please log in again to access offline packs.');

        const { data, error: progressError } = await supabase
          .from('onboarding_progress')
          .select('class_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError;
        }

        if (!isMounted) return;
        setClassId((data?.class_id ?? '8') as string);
      } catch (err) {
        if (!isMounted) return;
        setClassLoadError(err instanceof Error ? err.message : subjectCopy.loadPreferenceError);
      }
    };

    loadClassPreference();
    return () => {
      isMounted = false;
    };
  }, [subjectCopy.loadPreferenceError]);

  const offlineStatusText = useMemo(() => {
    if (!offlineMode) return null;
    if (classLoadError) return classLoadError;
    if (isOfflineLoading) return subjectCopy.offlineLoading;
    if (offlineDataError) return offlineDataError;
    if (!isOfflineReady) return subjectCopy.offlineUnavailable;
    return null;
  }, [classLoadError, isOfflineLoading, offlineDataError, isOfflineReady, offlineMode, subjectCopy.offlineLoading, subjectCopy.offlineUnavailable]);

  const handleModeChange = useCallback((mode: 'offline' | 'online') => {
    setOfflineMode(mode === 'offline');
    setPrompt('');
    setIsResponding(false);
  }, []);

  const fetchOnlineAnswer = useCallback(
    async (query: string): Promise<Message> => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwNzI0MTZkMC0zOWFlLTQ4M2YtYmZhNy0yNTY4MjgxNWMwMGQiLCJpYXQiOjE3NjQxODY4ODQsImV4cCI6MTc2NTA1MDg4NH0.Hjhy7bUi9s3gQlXLyRrDkDK0ATK4LGaN64kSlOyXj90";
      if (!token) {
        throw new Error('Missing Lunnaa token. Set EXPO_PUBLIC_LUNNAA_TOKEN in your .env.');
      }

      const response = await fetch('https://lunnaa.vercel.app/api/proxy/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ prompt: query, options: { includeYouTube: true, includeImageSearch: true } }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to reach Lunnaa API.');
      }

      let aggregatedText = '';
      let images: OnlineImage[] = [];
      let videos: OnlineVideo[] = [];
      let sources: OnlineSource[] = [];

      const applyEventData = (eventType: string, dataLine: string) => {
        if (!dataLine) return;
        try {
          const parsed = JSON.parse(dataLine);
          switch (eventType) {
            case 'message':
              aggregatedText += parsed?.text ?? '';
              break;
            case 'images':
              images = parsed?.images ?? images;
              break;
            case 'youtubeResults':
              videos =
                parsed?.videos?.map((video: any) => ({
                  videoId: video.videoId,
                  title: video.title,
                  url: video.url ?? `https://www.youtube.com/watch?v=${video.videoId}`,
                  channelTitle: video.channelTitle,
                  publishedAt: video.publishedAt,
                })) ?? videos;
              break;
            case 'sources':
              sources = parsed?.sources ?? sources;
              break;
            default:
              break;
          }
        } catch (error) {
          console.warn('[online] event parse error', error);
        }
      };

      const processBufferChunks = (buffer: string) => {
        let workingBuffer = buffer;
        let boundary = workingBuffer.indexOf('\n\n');
        while (boundary > -1) {
          const chunk = workingBuffer.slice(0, boundary).trim();
          workingBuffer = workingBuffer.slice(boundary + 2);
          boundary = workingBuffer.indexOf('\n\n');
          if (!chunk) continue;

          let eventType = 'message';
          let dataLine = '';
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              dataLine += line.replace('data:', '').trim();
            }
          }

          applyEventData(eventType, dataLine);
        }
        return workingBuffer;
      };

      if (!response.body || typeof response.body.getReader !== 'function') {
        const payload = await response.text();
        const normalized = payload.replace(/\r\n/g, '\n');
        normalized
          .split('\n\n')
          .map((chunk) => chunk.trim())
          .filter(Boolean)
          .forEach((chunk) => {
            let eventType = 'message';
            let dataLine = '';
            for (const line of chunk.split('\n')) {
              if (line.startsWith('event:')) {
                eventType = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                dataLine += line.replace('data:', '').trim();
              }
            }
            applyEventData(eventType, dataLine);
          });
      } else {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          buffer = processBufferChunks(buffer);
        }
        // process any trailing data without delimiter
        if (buffer.trim()) {
          processBufferChunks(`${buffer}\n\n`);
        }
      }

      if (!aggregatedText.trim()) {
        aggregatedText = 'I was unable to find an answer right now.';
      }

      return {
        id: `${Date.now()}-online-response`,
        role: 'assistant',
        text: aggregatedText.trim(),
        attachments: {
          images: images.length ? images : undefined,
          videos: videos.length ? videos : undefined,
          sources: sources.length ? sources : undefined,
        },
      };
    },
    [],
  );

  const handleSend = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed || isResponding) return;

    const newUserMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    if (offlineMode) {
      const qaResult = findAnswer(trimmed);
      const fallbackText = offlineDataError ?? (isOfflineLoading ? subjectCopy.offlineLoading : subjectCopy.offlineNoAnswer);
      const offlineReply: Message = {
        id: `${Date.now()}-offline-reply`,
        role: 'assistant',
        text: qaResult
          ? qaResult.topic
            ? `**${qaResult.topic}**\n\n${qaResult.answer}`
            : qaResult.answer
          : fallbackText,
      };
      setOfflineHistory((prev) => [...prev, newUserMessage, offlineReply]);
    } else {
      setIsResponding(true);
      setChatError(null);
      setOnlineHistory((prev) => [...prev, newUserMessage]);
      fetchOnlineAnswer(trimmed)
        .then((assistantMessage) => {
          setOnlineHistory((prev) => [...prev, assistantMessage]);
        })
        .catch((error) => {
          console.error('[online] fetch error', error);
          setChatError(error instanceof Error ? error.message : 'Unable to fetch online answer.');
        })
        .finally(() => {
          setIsResponding(false);
        });
    }

    setPrompt('');
  }, [fetchOnlineAnswer, findAnswer, isOfflineLoading, offlineDataError, offlineMode, isResponding, prompt]);

  const animateMic = useCallback(() => {
    Animated.sequence([
      Animated.timing(micScale, {
        toValue: 1.15,
        duration: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(micScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [micScale]);

  const maxSpeechLength = (Speech as unknown as { maxSpeechInputLength?: number })?.maxSpeechInputLength ?? 3900;

  const speakText = useCallback(
    async (utterance: string, options?: Speech.SpeechOptions) => {
      setVoiceError(null);
      try {
        await Speech.stop();
        const truncatedUtterance =
          utterance.length > maxSpeechLength ? `${utterance.slice(0, maxSpeechLength - 1)}…` : utterance;
        Speech.speak(truncatedUtterance, {
          ...options,
          rate: options?.rate ?? 1,
          pitch: options?.pitch ?? 1,
          onStart: () => {
            console.log('[speech] onStart');
            options?.onStart?.();
          },
          onDone: () => {
            console.log('[speech] onDone');
            options?.onDone?.();
          },
          onStopped: () => {
            console.log('[speech] onStopped');
            options?.onStopped?.();
          },
          onError: (event) => {
            console.error('[speech] onError', event);
            setVoiceError(typeof event === 'string' ? event : event?.message ?? 'Unable to play audio.');
            options?.onError?.(event as never);
          },
        });
      } catch (error) {
        console.error('[speech] exception', error);
        setVoiceError(error instanceof Error ? error.message : 'Unable to trigger text-to-speech.');
      }
    },
    [maxSpeechLength],
  );

  const startWaveAnimation = useCallback(() => {
    waveLoopRef.current?.stop();
    waveLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(wavePulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wavePulse, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    waveLoopRef.current.start();
  }, [wavePulse]);

  const stopWaveAnimation = useCallback(() => {
    waveLoopRef.current?.stop();
    wavePulse.setValue(0);
  }, [wavePulse]);

  useEffect(() => {
    typingLoopRef.current.forEach((anim) => anim.stop());
    typingLoopRef.current = [];

    if (isResponding && !offlineMode) {
      typingDots.forEach((dot, index) => {
        const sequence = Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(dot, {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 360,
            useNativeDriver: true,
          }),
        ]);
        const loop = Animated.loop(sequence);
        typingLoopRef.current.push(loop);
        loop.start();
      });
    } else {
      typingDots.forEach((dot) => dot.setValue(0.3));
    }

    return () => {
      typingLoopRef.current.forEach((anim) => anim.stop());
      typingLoopRef.current = [];
    };
  }, [isResponding, offlineMode, typingDots]);

  const startRecording = useCallback(async () => {
    try {
      setVoiceError(null);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setVoiceError('Microphone permission is required.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      startWaveAnimation();
      animateMic();
    } catch (error) {
      console.error('[recording] start:error', error);
      setVoiceError(error instanceof Error ? error.message : 'Unable to start recording.');
    }
  }, [animateMic, startWaveAnimation]);

  const stopRecordingAndTranscribe = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    try {
      setIsRecording(false);
      setIsTranscribing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      if (!uri) {
        throw new Error('No recording data found.');
      }

      const response = await fetch(uri);
      const audioBlob = await response.blob();

      const deepgramKey = "b0c3e3948041ea483954cac7a74e755fcdaf98c8";
      if (!deepgramKey) {
        throw new Error('Missing Deepgram key. Set EXPO_PUBLIC_DEEPGRAM_KEY in your .env.');
      }

      const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          Authorization: `Token ${deepgramKey}`,
          'Content-Type': 'audio/wav',
        },
        body: audioBlob,
      });

      if (!deepgramResponse.ok) {
        const errorText = await deepgramResponse.text();
        throw new Error(`Deepgram error ${deepgramResponse.status}: ${errorText}`);
      }

      const deepgramJson = await deepgramResponse.json();
      const transcript =
        deepgramJson?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? '';

      if (transcript) {
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      } else {
        setVoiceError('No speech detected. Try again.');
      }
    } catch (error) {
      console.error('[recording] stop:error', error);
      setVoiceError(error instanceof Error ? error.message : 'Unable to transcribe audio.');
    } finally {
      stopWaveAnimation();
      setIsTranscribing(false);
      recordingRef.current = null;
    }
  }, [stopWaveAnimation]);

  const handleMicPress = useCallback(() => {
    if (isRecording) {
      stopRecordingAndTranscribe();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecordingAndTranscribe]);

  const handleListen = useCallback(
    (messageText: string) => {
      speakText(messageText, { rate: 1, pitch: 1 });
    },
    [speakText],
  );

  const handleOpenLink = useCallback((url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((error) => console.warn('[link] open error', error));
  }, []);

  const micStatusMessage = isRecording
    ? subjectCopy.offlineModeLabel
    : isTranscribing
      ? subjectCopy.onlineModeLabel
      : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={22} color={OnboardingPalette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>{pageTitle}</Text>
          {subjectDefinition?.description ? (
            <Text style={styles.headerSubtitle}>{subjectDefinition.description}</Text>
          ) : null}
        </View>
        <TouchableOpacity activeOpacity={0.8} style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={18} color={OnboardingPalette.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
        {activeMessages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <View key={message.id} style={styles.messageWrapper}>
              <View style={[styles.messageRow, isUser ? styles.rowEnd : styles.rowStart]}>
                {!isUser && (
                  <View style={styles.avatarBadge}>
                    <Ionicons name="sparkles" size={16} color={OnboardingPalette.accent} />
                  </View>
                )}
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                  {isUser ? (
                    <Text style={[styles.messageText, styles.userText]}>{message.text}</Text>
                  ) : (
                    <Markdown style={markdownStyles}>{message.text}</Markdown>
                  )}
                </View>
                {isUser && (
                  <View style={[styles.avatarBadge, styles.userAvatar]}>
                    <Ionicons name="person" size={14} color={OnboardingPalette.background} />
                  </View>
                )}
              </View>
              {!isUser && (
                <TouchableOpacity activeOpacity={0.8} style={styles.listenButton} onPress={() => handleListen(message.text)}>
                  <Ionicons name="volume-high" size={16} color={OnboardingPalette.textPrimary} />
                  <Text style={styles.listenLabel}>Listen</Text>
                </TouchableOpacity>
              )}
              {!!message.attachments?.images?.length && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentScroll}>
                  {message.attachments.images.map((image) => (
                    <TouchableOpacity
                      key={`${message.id}-${image.imageUrl}`}
                      style={styles.imageCard}
                      activeOpacity={0.85}
                      onPress={() => handleOpenLink(image.pageUrl)}>
                      <Image source={{ uri: image.imageUrl }} style={styles.imageThumb} resizeMode="cover" />
                      <Text style={styles.imageTitle} numberOfLines={2}>
                        {image.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {!!message.attachments?.videos?.length && (
                <View style={styles.videoList}>
                  {message.attachments.videos.map((video) => (
                    <TouchableOpacity
                      key={`${message.id}-${video.videoId}`}
                      style={styles.videoItem}
                      activeOpacity={0.85}
                      onPress={() => handleOpenLink(video.url)}>
                      <Ionicons name="logo-youtube" size={18} color={OnboardingPalette.accent} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                          {video.title}
                        </Text>
                        {video.channelTitle ? (
                          <Text style={styles.videoMeta}>{video.channelTitle}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!!message.attachments?.sources?.length && (
                <View style={styles.sourceList}>
                  <ScrollView
                    style={styles.sourceScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={message.attachments.sources!.length > 4}>
                    {message.attachments.sources.map((source) => (
                      <TouchableOpacity
                        key={`${message.id}-${source.url}`}
                        style={styles.sourceItem}
                        activeOpacity={0.85}
                        onPress={() => handleOpenLink(source.url)}>
                        <Ionicons name="link" size={14} color={OnboardingPalette.accent} />
                        <Text style={styles.sourceTitle} numberOfLines={1}>
                          {source.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
        {isResponding && !offlineMode ? (
          <View style={styles.typingWrapper}>
            <View style={styles.avatarBadge}>
              <Ionicons name="sparkles" size={16} color={OnboardingPalette.accent} />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
              <Text style={styles.typingLabel}>Vidya AI is formulating an answer…</Text>
              <View style={styles.typingDotsRow}>
                {typingDots.map((dot, idx) => (
                  <Animated.View key={`typing-dot-${idx}`} style={[styles.typingDot, { opacity: dot }]} />
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[styles.modePill, offlineMode && styles.modePillActive]}
          activeOpacity={0.85}
          onPress={() => handleModeChange('offline')}>
          <Text style={[styles.modeLabel, offlineMode && styles.modeLabelActive]}>{subjectCopy.offlineModeLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modePill, !offlineMode && styles.modePillActive]}
          activeOpacity={0.85}
          onPress={() => handleModeChange('online')}>
          <Text style={[styles.modeLabel, !offlineMode && styles.modeLabelActive]}>{subjectCopy.onlineModeLabel}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.modeHint}>{modeHintText}</Text>
      {offlineStatusText ? <Text style={styles.packStatus}>{offlineStatusText}</Text> : null}

      <View style={styles.inputRow}>
        {micStatusMessage ? (
          <View style={styles.statusBanner}>
            <Ionicons name={isRecording ? 'mic' : 'sync'} size={16} color={OnboardingPalette.textPrimary} />
            <Text style={styles.statusLabel}>{micStatusMessage}</Text>
          </View>
        ) : (
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder={inputPlaceholder}
            placeholderTextColor={OnboardingPalette.textSecondary}
            style={styles.promptInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        )}
        <TouchableOpacity
          style={[styles.sendButton, (isSendDisabled || !!micStatusMessage) && styles.sendButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleSend}
          disabled={isSendDisabled || !!micStatusMessage}>
          <Ionicons name="arrow-up" size={18} color={OnboardingPalette.background} />
        </TouchableOpacity>
        <Animated.View style={[styles.micWrapper, { transform: [{ scale: micScale }] }]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.micWave,
              {
                opacity: isRecording
                  ? wavePulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] })
                  : 0,
                transform: [
                  {
                    scale: wavePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }),
                  },
                ],
              },
            ]}
          />
          <TouchableOpacity style={[styles.micButton, isRecording && styles.micButtonActive]} activeOpacity={0.85} onPress={handleMicPress}>
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color={OnboardingPalette.background} />
          </TouchableOpacity>
        </Animated.View>
      </View>
     
      {chatError ? <Text style={styles.speechError}>{chatError}</Text> : null}
      {voiceError ? <Text style={styles.speechError}>{voiceError}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: OnboardingPalette.background,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  messageWrapper: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  headerButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: OnboardingPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    color: OnboardingPalette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
    marginBottom: 16,
  },
  chatContent: {
    gap: 12,
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  rowEnd: {
    justifyContent: 'flex-end',
  },
  avatarBadge: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: OnboardingPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: OnboardingPalette.accent,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  assistantBubble: {
    backgroundColor: OnboardingPalette.surface,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: OnboardingPalette.accent,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  assistantText: {
    color: OnboardingPalette.textPrimary,
  },
  userText: {
    color: '#1B1D10',
    fontWeight: '600',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listenLabel: {
    color: OnboardingPalette.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  attachmentScroll: {
    marginTop: 8,
  },
  imageCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
  },
  imageThumb: {
    width: '100%',
    height: 90,
  },
  imageTitle: {
    color: OnboardingPalette.textPrimary,
    fontSize: 12,
    padding: 8,
  },
  videoList: {
    marginTop: 8,
    gap: 8,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 12,
    padding: 10,
  },
  videoTitle: {
    color: OnboardingPalette.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  videoMeta: {
    color: OnboardingPalette.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  sourceList: {
    marginTop: 10,
    gap: 6,
    borderRadius: 16,
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sourceScroll: {
    maxHeight: 200,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  sourceTitle: {
    color: OnboardingPalette.accent,
    fontSize: 12,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 26,
    padding: 4,
    gap: 4,
  },
  modePill: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modePillActive: {
    backgroundColor: OnboardingPalette.accent,
  },
  modeLabel: {
    color: OnboardingPalette.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  modeLabelActive: {
    color: '#1B1D10',
  },
  modeHint: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  promptInput: {
    flex: 1,
    color: OnboardingPalette.textPrimary,
    height: 40,
  },
  micWrapper: {
    borderRadius: 28,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micWave: {
    position: 'absolute',
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: OnboardingPalette.accent,
  },
  micButton: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: OnboardingPalette.textPrimary,
  },
  sendButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  typingIndicator: {
    marginTop: 10,
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  typingWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  typingBubble: {
    gap: 6,
  },
  typingLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  typingDotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: OnboardingPalette.accent,
  },
  voiceStatus: {
    marginTop: 6,
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  statusBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusLabel: {
    color: OnboardingPalette.textPrimary,
    fontSize: 13,
  },
  speechError: {
    marginTop: 10,
    color: '#D84040',
    textAlign: 'center',
  },
  packStatus: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: OnboardingPalette.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: OnboardingPalette.textPrimary,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: OnboardingPalette.textPrimary,
  },
  paragraph: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listItemText: {
    flex: 1,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  link: {
    color: OnboardingPalette.accent,
    textDecorationLine: 'underline',
  },
});
