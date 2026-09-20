import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useLocale } from '../../context/LocaleContext';
import { useMembership } from '../../hooks/useMembership';
import {
  createPost,
  createComment,
  subscribePosts,
  subscribeComments,
  togglePostLike,
  toggleReaction,
  toggleCommentVote,
  getUserLikedPosts,
  getUserReactions,
  getUserCommentVotes,
  REACTION_EMOJIS,
} from '../../services/communityService';
import { showNotifications } from '../../utils/notifications';
import { colors } from '../../theme/colors';
import { styles } from './CommunityScreen.styles';

function formatTime(ts) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function PostDiscussion({
  post,
  canInteract,
  liked,
  reactions,
  commentVotes,
  onReaction,
  onLike,
  onCommentVote,
  onUpgrade,
  authorName,
  userId,
  t,
  scrollRef,
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const replyComposerRef = useRef(null);

  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount, post.id]);

  useEffect(() => {
    if (!expanded) return undefined;
    return subscribeComments(post.id, (next) => {
      setComments(next);
      setCommentCount((prev) => Math.max(prev, next.length));
    });
  }, [expanded, post.id]);

  const handleReply = async () => {
    if (!canInteract) {
      onUpgrade();
      return;
    }
    if (!reply.trim()) return;

    setSending(true);
    try {
      const comment = await createComment({
        postId: post.id,
        userId,
        authorName,
        content: reply,
      });
      setComments((prev) => [...prev.filter((c) => c.id !== comment.id), comment]);
      setCommentCount((prev) => prev + 1);
      setReply('');
    } catch (error) {
      Alert.alert(t('community.replyFailed'), error.message || t('community.replyFailed'));
    } finally {
      setSending(false);
    }
  };

  const replyCount = Math.max(commentCount, comments.length);

  const scrollReplyIntoView = () => {
    const composerNode = findNodeHandle(replyComposerRef.current);
    const scrollNode = findNodeHandle(scrollRef?.current);
    if (!composerNode || !scrollNode) {
      setTimeout(() => {
        scrollRef?.current?.scrollToEnd?.({ animated: true });
      }, 120);
      return;
    }

    UIManager.measureLayout(
      composerNode,
      scrollNode,
      () => {},
      (_x, y, _width, height) => {
        const targetY = Math.max(0, y - 24);
        scrollRef?.current?.scrollTo?.({
          y: targetY + Math.max(0, height - 40),
          animated: true,
        });
      }
    );
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.authorName?.[0] ?? '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{post.authorName}</Text>
          <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.reactionRow}>
        {REACTION_EMOJIS.map((emoji) => {
          const count = post.reactions?.[emoji] || 0;
          const active = reactions[post.id] === emoji;
          return (
            <Pressable
              key={emoji}
              style={[
                styles.reactionChip,
                active && styles.reactionChipActive,
                !canInteract && styles.reactionChipLocked,
              ]}
              onPress={() => onReaction(post, emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              {count > 0 ? <Text style={styles.reactionCount}>{count}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.likeRow} onPress={() => onLike(post)}>
          <Ionicons
            name={liked[post.id] ? 'heart' : 'heart-outline'}
            size={18}
            color={canInteract ? colors.primary : colors.locked}
          />
          <Text style={styles.likeText}>
            {post.likes ?? 0} {t('community.likes')}
          </Text>
          {!canInteract ? (
            <Ionicons name="lock-closed" size={14} color={colors.locked} />
          ) : null}
        </Pressable>

        <Pressable
          style={styles.replyToggle}
          onPress={() => {
            if (!canInteract && replyCount === 0) {
              onUpgrade();
              return;
            }
            setExpanded((v) => !v);
          }}
        >
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={canInteract ? colors.primary : colors.locked}
          />
          <Text style={styles.replyToggleText}>
            {expanded
              ? t('community.hideReplies')
              : replyCount > 0
                ? t('community.viewReplies', { count: replyCount })
                : t('community.reply')}
          </Text>
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.discussionBox}>
          {comments.length === 0 ? (
            <Text style={styles.noReplies}>{t('community.noReplies')}</Text>
          ) : (
            comments.map((comment) => {
              const userVote = commentVotes[comment.id] || null;
              return (
                <View key={comment.id} style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.authorName?.[0] ?? '?'}
                    </Text>
                  </View>
                  <View style={styles.commentBody}>
                    <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                    <View style={styles.commentMetaRow}>
                      <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                      <View style={styles.commentVoteRow}>
                        <Pressable
                          style={[
                            styles.commentVoteBtn,
                            userVote === 'up' && styles.commentVoteBtnActive,
                            !canInteract && styles.commentVoteBtnLocked,
                          ]}
                          onPress={async () => {
                            const result = await onCommentVote(post, comment, 'up');
                            if (!result) return;
                            setComments((prev) =>
                              prev.map((c) =>
                                c.id === comment.id
                                  ? { ...c, likes: result.likes, dislikes: result.dislikes }
                                  : c
                              )
                            );
                          }}
                          hitSlop={6}
                        >
                          <Ionicons
                            name={userVote === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
                            size={14}
                            color={
                              userVote === 'up'
                                ? colors.primary
                                : canInteract
                                  ? colors.textMuted
                                  : colors.locked
                            }
                          />
                          <Text
                            style={[
                              styles.commentVoteCount,
                              userVote === 'up' && styles.commentVoteCountActive,
                            ]}
                          >
                            {comment.likes ?? 0}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            styles.commentVoteBtn,
                            userVote === 'down' && styles.commentVoteBtnActiveDown,
                            !canInteract && styles.commentVoteBtnLocked,
                          ]}
                          onPress={async () => {
                            const result = await onCommentVote(post, comment, 'down');
                            if (!result) return;
                            setComments((prev) =>
                              prev.map((c) =>
                                c.id === comment.id
                                  ? { ...c, likes: result.likes, dislikes: result.dislikes }
                                  : c
                              )
                            );
                          }}
                          hitSlop={6}
                        >
                          <Ionicons
                            name={userVote === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
                            size={14}
                            color={
                              userVote === 'down'
                                ? '#B45309'
                                : canInteract
                                  ? colors.textMuted
                                  : colors.locked
                            }
                          />
                          <Text
                            style={[
                              styles.commentVoteCount,
                              userVote === 'down' && styles.commentVoteCountDown,
                            ]}
                          >
                            {comment.dislikes ?? 0}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {canInteract ? (
            <View ref={replyComposerRef} style={styles.replyComposer} collapsable={false}>
              <TextInput
                style={styles.replyInput}
                placeholder={t('community.replyPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={reply}
                onChangeText={setReply}
                multiline
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(scrollReplyIntoView, 80);
                  setTimeout(scrollReplyIntoView, 280);
                }}
              />
              <Pressable
                style={[styles.replySendBtn, (!reply.trim() || sending) && styles.replySendDisabled]}
                onPress={handleReply}
                disabled={!reply.trim() || sending}
              >
                <Text style={styles.replySendText}>
                  {sending ? t('common.pleaseWait') : t('community.sendReply')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.replyLocked} onPress={onUpgrade}>
              <Ionicons name="lock-closed" size={14} color={colors.locked} />
              <Text style={styles.replyLockedText}>{t('community.upgradeToReply')}</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function CommunityScreen() {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const { openMenu } = useMenu();
  const { t } = useLocale();
  const { features } = useMembership();
  const canInteract = features.hasCommunityInteract;
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState({});
  const [reactions, setReactions] = useState({});
  const [commentVotes, setCommentVotes] = useState({});
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef(null);
  const composeRef = useRef(null);
  const insets = useSafeAreaInsets();
  const bottomPad = useTabBarPadding();

  useEffect(() => {
    getUserLikedPosts().then(setLiked);
    getUserReactions().then(setReactions);
    getUserCommentVotes().then(setCommentVotes);
    const unsub = subscribePosts(setPosts);
    return unsub;
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollComposerIntoView = () => {
    const composerNode = findNodeHandle(composeRef.current);
    const scrollNode = findNodeHandle(scrollRef.current);
    if (!composerNode || !scrollNode) return;
    setTimeout(() => {
      UIManager.measureLayout(
        composerNode,
        scrollNode,
        () => {},
        (_x, y) => {
          scrollRef.current?.scrollTo?.({ y: Math.max(0, y - 16), animated: true });
        }
      );
    }, 120);
  };

  const promptUpgrade = () => {
    Alert.alert(t('community.upgradeTitle'), t('community.upgradeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.upgradeSubscription'),
        onPress: () => navigation.navigate('Membership'),
      },
    ]);
  };

  const handlePost = async () => {
    if (!canInteract) {
      promptUpgrade();
      return;
    }
    if (!content.trim()) return;

    setPosting(true);
    try {
      const post = await createPost({
        userId: user?.uid,
        authorName: profile?.displayName || user?.displayName || 'Learner',
        content,
      });
      setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
      setContent('');
    } catch (error) {
      Alert.alert(t('community.postFailed'), error.message);
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (post, emoji) => {
    if (!canInteract) {
      promptUpgrade();
      return;
    }

    try {
      const { reactions: nextReactions, userReaction } = await toggleReaction(
        post.id,
        emoji,
        post.reactions
      );
      setReactions((prev) => {
        const next = { ...prev };
        if (userReaction) {
          next[post.id] = userReaction;
        } else {
          delete next[post.id];
        }
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, reactions: nextReactions } : p))
      );
    } catch (error) {
      Alert.alert(t('community.reactFailed'), error.message || t('community.reactFailed'));
    }
  };

  const handleLike = async (post) => {
    if (!canInteract) {
      promptUpgrade();
      return;
    }

    try {
      const { liked: isLiked, likes } = await togglePostLike(post.id, post.likes || 0);
      setLiked((prev) => ({ ...prev, [post.id]: isLiked }));
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likes } : p)));
    } catch (error) {
      Alert.alert(t('community.reactFailed'), error.message || t('community.reactFailed'));
    }
  };

  const handleCommentVote = async (post, comment, vote) => {
    if (!canInteract) {
      promptUpgrade();
      return null;
    }

    try {
      const result = await toggleCommentVote(
        post.id,
        comment.id,
        vote,
        comment.likes || 0,
        comment.dislikes || 0
      );
      setCommentVotes((prev) => {
        const next = { ...prev };
        if (result.userVote) next[comment.id] = result.userVote;
        else delete next[comment.id];
        return next;
      });
      return result;
    } catch (error) {
      Alert.alert(t('community.voteFailed') || t('community.reactFailed'), error.message);
      return null;
    }
  };

  const keyboardPad =
    Platform.OS === 'android'
      ? Math.max(0, keyboardHeight - bottomPad + insets.bottom + 24)
      : Math.max(0, keyboardHeight > 0 ? 24 : 0);

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPad + keyboardPad },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <AppHeader
            variant="title"
            title={t('community.title')}
            onMenuPress={openMenu}
            onNotificationsPress={showNotifications}
          />

          {!canInteract ? (
            <View style={styles.readOnlyBanner}>
              <Ionicons name="eye-outline" size={22} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.readOnlyTitle}>{t('community.readOnlyTitle')}</Text>
                <Text style={styles.readOnlyText}>{t('community.readOnlyMessage')}</Text>
              </View>
            </View>
          ) : null}

          {canInteract ? (
            <View ref={composeRef} style={styles.composeCard} collapsable={false}>
              <View style={styles.composeHeader}>
                <View style={styles.composeAvatar}>
                  <Text style={styles.avatarText}>
                    {(profile?.displayName || user?.displayName || 'L')[0]}
                  </Text>
                </View>
                <Text style={styles.composeLabel}>{t('community.composeHint')}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('community.placeholder')}
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                onFocus={scrollComposerIntoView}
              />
              <View style={styles.composeActions}>
                <PrimaryButton
                  label={posting ? t('common.posting') : t('common.post')}
                  onPress={handlePost}
                  disabled={posting || !content.trim()}
                  style={styles.postBtn}
                />
              </View>
            </View>
          ) : (
            <Pressable style={styles.upgradeCard} onPress={() => navigation.navigate('Membership')}>
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
              <Text style={styles.upgradeCardText}>{t('community.upgradeToPost')}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          )}

          {posts.length === 0 ? (
            <Text style={styles.empty}>{t('community.empty')}</Text>
          ) : null}

          {posts.map((post) => (
            <PostDiscussion
              key={post.id}
              post={post}
              canInteract={canInteract}
              liked={liked}
              reactions={reactions}
              commentVotes={commentVotes}
              onReaction={handleReaction}
              onLike={handleLike}
              onCommentVote={handleCommentVote}
              onUpgrade={promptUpgrade}
              authorName={profile?.displayName || user?.displayName || 'Learner'}
              userId={user?.uid}
              t={t}
              scrollRef={scrollRef}
            />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
