import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

function PostDetailPage() {
  const { id } = useParams();
  const { token, user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPost() {
      try {
        setLoading(true);
        const data = await apiRequest(`/api/posts/${id}`);

        if (active) {
          setPost(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleLike() {
    if (!isAuthenticated || !post) {
      return;
    }

    try {
      const response = await apiRequest(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPost((currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        const liked = response.liked;
        const likes = liked
          ? [...currentPost.likes, user.id]
          : currentPost.likes.filter((id) => id !== user.id);

        return { ...currentPost, likes };
      });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const createdComment = await apiRequest(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      setPost((currentPost) =>
        currentPost
          ? { ...currentPost, comments: [...currentPost.comments, createdComment] }
          : currentPost
      );
      setCommentText('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="notice-card">Loading post...</div>;
  }

  if (error) {
    return <div className="notice-card">{error}</div>;
  }

  if (!post) {
    return <div className="notice-card">Post not found.</div>;
  }

  return (
    <>
      <section className="detail-card">
        <div className="detail-header">
          <div className="comment-row">
            <div className="avatar-badge">{post.author?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div>
              <h1>{post.author?.name}</h1>
              <p className="meta-copy">{post.author?.bio || 'No bio available.'}</p>
            </div>
          </div>
          <Link className="secondary-button" to={`/profile/${post.author?._id || post.author?.id}`}>
            View profile
          </Link>
        </div>

        <p className="post-body">{post.content}</p>
        {post.image ? <img className="post-media" src={post.image} alt="Post visual" /> : null}

        <div className="post-actions">
          <div className="post-meta">
            <span>{post.likes.length} likes</span>
            <span>{post.comments.length} comments</span>
          </div>
          <button className="primary-button" type="button" onClick={handleLike}>
            Like
          </button>
        </div>
      </section>

      <section className="comment-card">
        <div className="comment-header">
          <div>
            <p className="eyebrow">Comments</p>
            <h2>Join the discussion</h2>
          </div>
          <span className="status-pill">{post.comments.length} total</span>
        </div>

        {isAuthenticated ? (
          <form className="composer-grid" onSubmit={handleCommentSubmit}>
            <textarea
              rows="3"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a thoughtful reply..."
              required
            />
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <div className="notice-card empty-state">
            <Link className="small-link" to="/login">
              Log in
            </Link>{' '}
            to comment on posts.
          </div>
        )}

        <div className="comment-list">
          {post.comments.length ? (
            post.comments.map((comment) => (
              <article key={comment._id} className="comment-item">
                <div className="comment-meta">
                  <strong>{comment.user?.name || 'Someone'}</strong>
                  <span className="meta-copy">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </article>
            ))
          ) : (
            <div className="notice-card empty-state">No comments yet.</div>
          )}
        </div>
      </section>
    </>
  );
}

export default PostDetailPage;