const express = require('express');
const Assignment = require('../models/Assignment');

const router = express.Router();

function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// list assignments
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.session.user.id }).sort({ dueDate: 1 });
    res.render('assignments', { title: 'My Assignments', assignments });
  } catch (err) {
    console.error(err);
    res.send('Error fetching assignments');
  }
});

// new form
router.get('/new', isAuthenticated, (req, res) => {
  res.render('new-assignment', { title: 'New Assignment' });
});

// create
router.post('/', isAuthenticated, async (req, res) => {
  const { title, course, dueDate, status } = req.body;

  try {
    const assignment = new Assignment({
      title,
      course,
      dueDate,
      status,
      user: req.session.user.id,
    });

    await assignment.save();
    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.send('Error creating assignment');
  }
});

// edit form
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.session.user.id,
    });

    if (!assignment) return res.send('Assignment not found');

    res.render('edit-assignment', { title: 'Edit Assignment', assignment });
  } catch (err) {
    console.error(err);
    res.send('Error loading edit form');
  }
});

// update
router.put('/:id', isAuthenticated, async (req, res) => {
  const { title, course, dueDate, status } = req.body;

  try {
    await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.session.user.id },
      { title, course, dueDate, status }
    );
    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.send('Error updating assignment');
  }
});

// delete confirm page
router.get('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      user: req.session.user.id,
    });

    if (!assignment) return res.send('Assignment not found');

    res.render('delete-confirm', { title: 'Delete Assignment', assignment });
  } catch (err) {
    console.error(err);
    res.send('Error loading delete page');
  }
});

// delete
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    await Assignment.findOneAndDelete({
      _id: req.params.id,
      user: req.session.user.id,
    });
    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.send('Error deleting assignment');
  }
});

module.exports = router;
