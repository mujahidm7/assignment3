const express = require('express');
const Assignment = require('../models/Assignment');

const router = express.Router();

// Middleware to block guests from CRUD
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

// LIST ASSIGNMENTS
// - Guests see ALL assignments (read-only)
// - Logged-in users see ONLY their assignments
router.get('/', async (req, res) => {
  try {
    let query = {};
    let title = 'Assignments (Read Only)';

    if (req.isAuthenticated && req.isAuthenticated()) {
      query = { user: req.user._id };
      title = 'My Assignments';
    }

    const assignments = await Assignment.find(query).sort({ dueDate: 1 });

    res.render('assignments', {
      title,
      assignments,
    });
  } catch (err) {
    console.error(err);
    res.send('Error loading assignments');
  }
});

// CREATE FORM (only logged-in)
router.get('/new', isAuthenticated, (req, res) => {
  res.render('new-assignment', { title: 'New Assignment' });
});

// CREATE HANDLER (only logged-in)
router.post('/', isAuthenticated, async (req, res) => {
  const { title, course, dueDate, status } = req.body;

  try {
    await Assignment.create({
      title,
      course,
      dueDate,
      status,
      user: req.user._id,
    });

    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.send('Error creating assignment');
  }
});

// EDIT FORM (only logged-in & ownership check)
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.send('Assignment not found or access denied');
    }

    res.render('edit-assignment', {
      title: 'Edit Assignment',
      assignment,
    });
  } catch (err) {
    console.error(err);
    res.send('Error loading edit form');
  }
});

// UPDATE (only logged-in & ownership check)
router.put('/:id', isAuthenticated, async (req, res) => {
  const { title, course, dueDate, status } = req.body;

  try {
    await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, course, dueDate, status }
    );

    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.send('Error updating assignment');
  }
});

// DELETE CONFIRMATION PAGE (only logged-in & owner)
router.get('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!assignment) {
      return res.send('Assignment not found or access denied');
    }

    res.render('delete-confirm', {
      title: 'Delete Assignment',
      assignment,
    });
  } catch (err) {
    console.error(err);
    res.send('Error loading delete page');
  }
});

// DELETE (only logged-in & owner)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    await Assignment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.send('Error deleting assignment');
  }
});

module.exports = router;
