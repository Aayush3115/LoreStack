import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { BACKEND_URL } from '../../api/api';
import './CommentSection.css';
import { Send, Reply, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const CommentItem = ({ comment, postId, onCommentAdded, onDelete, currentUser, isReply = false }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);


    const handleReply = async () => {
        if (!replyContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await api.post('/comments/', {
                post: postId,
                parent: comment.id,
                content: replyContent
            });
            onCommentAdded(response.data);
            setReplyContent('');
            setIsReplying(false);
            setShowReplies(true);
        } catch (error) {
            console.error("Error replying to comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`comment-item ${isReply ? 'reply-item' : ''}`}>
            <div className="comment-main">
                <div className="comment-avatar">
                   <Link to={`/profile/${comment.user_username}`}>
                    <img 
                        src={comment.user_profile_picture || `${BACKEND_URL}/media/profile_pics/default.jpg`} 
                        alt={comment.user_username} 
                    />
                   </Link>
                </div>
                <div className="comment-content-wrapper">
                    <div className="comment-header">
                        <Link to={`/profile/${comment.user_username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span className="comment-author">{comment.user_username}</span>
                        </Link>
                        <span className="comment-date">
                            {new Date(comment.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>

                    </div>
                    <p className="comment-body">{comment.content}</p>
                    <div className="comment-actions">
                        <button 
                            className="comment-action-btn"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            <Reply size={14} />
                            Reply
                        </button>
                        {currentUser && currentUser.id === comment.user && (
                            <div className="delete-confirm-wrapper">
                                {isConfirmingDelete ? (
                                    <div className="delete-confirm-actions">
                                        <span className="confirm-label">Sure?</span>
                                        <button 
                                            className="confirm-btn yes"
                                            onClick={() => onDelete(comment.id)}
                                        >
                                            Yes
                                        </button>
                                        <button 
                                            className="confirm-btn no"
                                            onClick={() => setIsConfirmingDelete(false)}
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        className="comment-action-btn delete"
                                        onClick={() => setIsConfirmingDelete(true)}
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}

                    </div>

                    {isReplying && (
                        <div className="reply-input-container">
                            <textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                            />
                            <div className="reply-buttons">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => setIsReplying(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="send-btn"
                                    onClick={handleReply}
                                    disabled={!replyContent.trim() || isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 size={14} className="spinning" /> : <Send size={14} />}
                                    Reply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <div className="replies-container">
                    <button 
                        className="toggle-replies-btn"
                        onClick={() => setShowReplies(!showReplies)}
                    >
                        {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showReplies ? 'Hide' : `Show ${comment.replies.length}`} replies
                    </button>
                    {showReplies && comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            postId={postId}
                            onCommentAdded={onCommentAdded}
                            onDelete={onDelete}
                            currentUser={currentUser}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CommentSection = ({ postId, currentUser, onReplyCountChange }) => {
    const [comments, setComments] = useState([]);

    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/comments/', {
                params: { post_id: postId }
            });
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await api.post('/comments/', {
                post: postId,
                content: newComment
            });
            setComments([response.data, ...comments]);
            setNewComment('');
            if (onReplyCountChange) onReplyCountChange(1);
        } catch (error) {

            console.error("Error posting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}/`);

            // Update state locally
            const removeItem = (list) => {
                return list.filter(c => {
                    if (c.id === commentId) return false;
                    if (c.replies) c.replies = removeItem(c.replies);
                    return true;
                });
            };
            setComments(removeItem(comments));
            if (onReplyCountChange) onReplyCountChange(-1);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleCommentAdded = (newReply) => {
        // Find the parent and add it there locally or just refetch
        // For simplicity, let's refetch or do a deep update.
        // Deep update is better for UX.
        const updateReplies = (list) => {
            return list.map(c => {
                if (c.id === newReply.parent) {
                    return { ...c, replies: [...(c.replies || []), newReply] };
                }
                if (c.replies) {
                    return { ...c, replies: updateReplies(c.replies) };
                }
                return c;
            });
        };
        setComments(updateReplies(comments));
        if (onReplyCountChange) onReplyCountChange(1);
    };


    return (
        <div className="comment-section">
            <div className="comment-input-area">
                <textarea
                    placeholder="Write a reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />

                <button 
                    className="submit-comment-btn"
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="spinning" size={16} /> : 'Reply'}
                </button>


            </div>

            {isLoading ? (
                <div className="comments-loading">
                    <Loader2 className="spinning" size={24} />
                    <span>Loading replies...</span>
                </div>

            ) : (
                <div className="comments-list">
                    {comments.length === 0 ? (
                        <div className="no-comments">No replies yet. Start the conversation!</div>
                    ) : (

                        comments.map(comment => (
                            <CommentItem 
                                key={comment.id} 
                                comment={comment} 
                                postId={postId}
                                onCommentAdded={handleCommentAdded}
                                onDelete={handleDelete}
                                currentUser={currentUser}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
