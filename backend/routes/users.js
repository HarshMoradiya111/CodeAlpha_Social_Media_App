const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    followers: user.followers,
    following: user.following,
  };
}

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(serializeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user.', error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'You can only edit your own profile.' });
    }

    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined ? { name } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
      { new: true }
    );

    return res.json(serializeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user.', error: error.message });
  }
});

router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!currentUser.following.some((userId) => userId.toString() === req.params.id)) {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      await currentUser.save();
      await targetUser.save();
    }

    return res.json({ message: 'Followed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to follow user.', error: error.message });
  }
});

router.post('/:id/unfollow', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    currentUser.following = currentUser.following.filter(
      (userId) => userId.toString() !== req.params.id
    );
    targetUser.followers = targetUser.followers.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await targetUser.save();

    return res.json({ message: 'Unfollowed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to unfollow user.', error: error.message });
  }
});

module.exports = router;