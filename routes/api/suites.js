const passport = require('passport');
const express = require('express');
const router = express.Router();
//load suite model
const Suite = require('../../models/Suite')
//validation
const validateSuiteInput = require ('../../validation/suite');

//@route  GET /api/suites/test
//@desc   Tests suite js
//@access Public
router.get('/test', (req, res) => res.json({msg: 'Suites works'}));

//@route  POST  /api/suites/add
//@route  Add a suite
//@access Public
router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {
  const {errors, isValid} = 
  validateSuiteInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  Suite.findOne({suitename: req.body.suitename})
    .then((suite) => {
      if(suite){
        return res.status(400).json({suite: 'A suite with that name already exists'});
      } else {
        const newSuite = new Suite({
          suitename: req.body.suitename,
          status: req.body.status,
          provider: req.body.provider,
          notes: req.body.notes
        });
        newSuite.save()
          .then(suite => res.json(suite))
          .catch(err => console.log(err));
      }
    })
    .catch();
})

//@route  POST  /api/suites/update
//@desc   Update a suite's status, notes, etc.
//@access Public
router.post('/update', (req, res) => {
  Suite.findOne({suitename: req.body.suitename})
    .then((suite) => {
      const suiteFields = {};
      suiteFields.status = req.body.status;
      suiteFields.provider = req.body.provider;
      suiteFields.notes = req.body.notes;

      if(suite){
        //update suite status
        Suite.findOneAndUpdate(
          { suitename: req.body.suitename },
          { $set: suiteFields },
          { new: true }
          )
          .then(suite => res.json(suite));
      } else {
        return res.status(400).json({suite: 'That suite does not exist'});
      }
    })
    .catch()
})

//@route   GET   /api/suites
//@desc    Get all suite data
//@access  Public
router.get('/', (req, res) => {
  const errors = {};

  Suite.find()
    .then((suites) => {
      if(!suites) {
        errors.nosuites = "There are no suites";
        return res.status(404).json(errors);
      }

      res.json(suites);
    })
    .catch((err) => res.status(404).json(err))
});


//@route   DELETE /api/suites/delete
//@desc    Delete a suite from the record
//@access  PUBLIC
router.delete(
  '/delete', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Suites.findOneAndRemove({name: req.body.suitename})
    .then(() => res.json({ success: true }))
    .catch((err) => console.log(err));
  }
);

module.exports = router;