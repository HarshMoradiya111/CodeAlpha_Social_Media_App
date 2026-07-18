import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

function formatCount(value) {
  if (value > 999) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${value}`;
}

function PostCard({ post, currentUserId, onLike }) {
  const liked = currentUserId ? post.likes.some((id) => id === currentUserId) : false;

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="comment-row">
          <div className="avatar-badge">{post.author?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <h3>{post.author?.name || 'Unknown author'}</h3>
            <p className="meta-copy">{post.author?.bio || 'Sharing thoughts and updates'}</p>
          </div>
        </div>

        <Link className="small-link" to={`/profile/${post.author?._id || post.author?.id}`}>
          View profile
        </Link>
      </div>

      <p className="post-body">{post.content}</p>

      {post.image ? <img className="post-media" src={post.image} alt="Post visual" /> : null}

      <div className="post-actions">
        <div className="post-meta">
          <span>{formatCount(post.likes.length)} likes</span>
          <span>{formatCount(post.comments.length)} comments</span>
        </div>
        <div className="hero-actions">
          <button className={liked ? 'post-button' : 'secondary-button'} type="button" onClick={() => onLike(post)}>
            {liked ? 'Liked' : 'Like'}
          </button>
          <Link className="secondary-button" to={`/post/${post._id}`}>
            Comment
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { token, user, isAuthenticated } = useAuth();

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiRequest('/api/posts/feed', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (active) {
          setPosts(data);
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

    loadFeed();

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  const feedStats = useMemo(
    () => [
      { label: 'Posts in view', value: posts.length },
      { label: 'Your presence', value: user?.name ? 'Ready' : 'Guest' },
      { label: 'Live focus', value: 'Feed + comments' },
    ],
    [posts.length, user]
  );

  async function handleCreatePost(event) {
    event.preventDefault();

    if (!content.trim()) {
      setError('Post content is required.');
      return;
    }

    try {
      setSubmitting(true);
      const createdPost = await apiRequest('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, image }),
      });

      setPosts((currentPosts) => [
        {
          ...createdPost,
          author: {
            _id: user.id,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
          },
          likes: [],
          comments: [],
        },
        ...currentPosts,
      ]);
      setContent('');
      setImage('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(post) {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await apiRequest(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts((currentPosts) =>
        currentPosts.map((item) => {
          if (item._id !== post._id) {
            return item;
          }

          const likes = response.liked
            ? [...item.likes, user.id]
            : item.likes.filter((id) => id !== user.id);

          return { ...item, likes };
        })
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <>
      <section className="feed-hero">
        <div className="hero-copy">
          <p className="eyebrow">CodeAlpha Internship Phase 4</p>
          <h1>Pulse Loop is ready for feed-driven sharing.</h1>
          <p className="intro">
            The frontend now handles auth, follows, likes, comments, and profile pages on top of the
            MongoDB-backed API.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/register">
              Create account
            </Link>
            <Link className="secondary-button" to={user?.id ? `/profile/${user.id}` : '/login'}>
              Open profile
            </Link>
          </div>
        </div>

        <aside className="hero-side">
          {feedStats.map((item) => (
            <div key={item.label} className="metric">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </aside>
      </section>

      {isAuthenticated ? (
        <form className="composer-card" onSubmit={handleCreatePost}>
          <div className="composer-header">
            <div>
              <p className="eyebrow">Create post</p>
              <h2>Share what’s happening now</h2>
            </div>
            <span className="status-pill">Posting as {user?.name}</span>
          </div>

          <div className="composer-grid">
            <textarea
              rows="4"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write something useful, honest, or visual..."
              required
            />
            <input
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="Optional image URL"
            />
          </div>

          {error ? <div className="notice-card">{error}</div> : null}

          <div className="composer-actions">
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish post'}
            </button>
          </div>
        </form>
      ) : (
        <section className="notice-card empty-state">
          Log in to create posts, follow people, and see your personalized feed.
        </section>
      )}

      {loading ? <div className="notice-card">Loading feed...</div> : null}
      {error && !posts.length ? <div className="notice-card">{error}</div> : null}

      {!loading && isAuthenticated ? (
        <section className="post-grid">
          {posts.length ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} currentUserId={user?.id} onLike={handleLike} />
            ))
          ) : (
            <div className="notice-card empty-state">
              Your feed is empty. Follow a few people or post your first update.
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}

export default FeedPage;