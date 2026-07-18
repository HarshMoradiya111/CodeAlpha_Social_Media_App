import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { id } = useParams();
  const { token, user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        const [profileData, postsData] = await Promise.all([
          apiRequest(`/api/users/${id}`),
          apiRequest(`/api/posts/user/${id}`),
        ]);

        if (active) {
          setProfile(profileData);
          setPosts(postsData);
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

    loadProfile();

    return () => {
      active = false;
    };
  }, [id]);

  const isOwnProfile = currentUser?.id === id;
  const isFollowing = useMemo(
    () => profile?.followers?.some((follower) => follower.id === currentUser?.id),
    [profile, currentUser]
  );

  async function handleFollowToggle() {
    if (!isAuthenticated || isOwnProfile) {
      return;
    }

    try {
      setFollowBusy(true);
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await apiRequest(`/api/users/${id}/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        const updatedFollowers = isFollowing
          ? currentProfile.followers.filter((follower) => follower.id !== currentUser.id)
          : [
              ...currentProfile.followers,
              {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
              },
            ];

        return { ...currentProfile, followers: updatedFollowers };
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) {
    return <div className="notice-card">Loading profile...</div>;
  }

  if (error) {
    return <div className="notice-card">{error}</div>;
  }

  if (!profile) {
    return <div className="notice-card">Profile not found.</div>;
  }

  return (
    <>
      <section className="profile-card">
        <img className="profile-avatar" src={profile.avatar || 'https://via.placeholder.com/240'} alt={profile.name} />
        <div>
          <p className="eyebrow">Profile</p>
          <div className="profile-header">
            <div>
              <h1>{profile.name}</h1>
              <p className="profile-bio">{profile.bio || 'No bio added yet.'}</p>
            </div>
            {isAuthenticated && !isOwnProfile ? (
              <button className="primary-button" type="button" onClick={handleFollowToggle} disabled={followBusy}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            ) : null}
          </div>

          <div className="profile-stats">
            <span>{profile.followers.length} followers</span>
            <span>{profile.following.length} following</span>
            <span>{posts.length} posts</span>
          </div>
        </div>
      </section>

      <section className="section-header">
        <div>
          <p className="eyebrow">Posts</p>
          <h2>{isOwnProfile ? 'Your posts' : `${profile.name}'s posts`}</h2>
        </div>
        <Link className="secondary-button" to="/">
          Back to feed
        </Link>
      </section>

      <section className="post-grid">
        {posts.length ? (
          posts.map((post) => (
            <article key={post._id} className="post-card">
              <p className="post-body">{post.content}</p>
              {post.image ? <img className="post-media" src={post.image} alt="Post visual" /> : null}
              <div className="post-actions">
                <div className="post-meta">
                  <span>{post.likes.length} likes</span>
                  <span>{post.comments.length} comments</span>
                </div>
                <Link className="secondary-button" to={`/post/${post._id}`}>
                  Open post
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="notice-card empty-state">No posts here yet.</div>
        )}
      </section>
    </>
  );
}

export default ProfilePage;