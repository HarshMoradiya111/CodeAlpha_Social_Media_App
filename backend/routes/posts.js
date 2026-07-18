const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function isOwner(userId, resourceUserId) {
  return userId.toString() === resourceUserId.toString();
}

router.post('/', protect, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Post content is required.' });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      image: image || '',
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create post.', error: error.message });
  }
});

router.get('/feed', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const visibleUsers = [...user.following.map((id) => id.toString()), req.user._id.toString()];

    const posts = await Post.find({ author: { $in: visibleUsers } })
      .populate('author', 'name avatar bio')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name avatar' },
      })
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch feed.', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (!isOwner(req.user._id, post.author)) {
      return res.status(403).json({ message: 'You can only delete your own post.' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    return res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete post.', error: error.message });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const alreadyLiked = post.likes.some((userId) => userId.toString() === req.user._id.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    return res.json({
      message: alreadyLiked ? 'Post unliked.' : 'Post liked.',
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to toggle like.', error: error.message });
  }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text,
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name avatar');

    return res.status(201).json(populatedComment);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add comment.', error: error.message });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: 1 });

    return res.json(comments);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch comments.', error: error.message });
  }
});

module.exports = router;