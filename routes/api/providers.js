import express from 'express';
import bcrypt from 'bcryptjs';
import Provider from '../../models/Provider.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import nodemailer from 'nodemailer';
import keys from '../../config/keys.js';
import validateLoginInput from '../../validation/login.js';
import validateRegisterInput from '../../validation/register.js';
import validateChangepwInput from '../../validation/changepw.js';



const providersRouter = express.Router();


//@route    POST    /api/providers/register
//@desc     Register provider
//@access   Public
providersRouter.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Provider.findOne({name: req.body.name})
    .then((provider) => {
      if(provider) {
      return res.status(404).json({ name: "Provider with that name already exists" });
      } else {
        const newProvider = new Provider({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
      });

      if(req.body.email){
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newProvider.password, salt, (err, hash) => {
          if (err) throw err;
          newProvider.password = hash;
          newProvider 
            .save()
            .then((provider) => res.json(provider))
            .catch((err) => console.log(err))
        });
      });
      } else {
        newProvider
          .save()
          .then((provider) => res.json(provider))
          .catch((err) => console.log(err))
      }
    }
  })
  .catch((err) => console.log(err))
});

//@route    POST    /api/providers/login
//@desc     Log in provider
//@access   Public

providersRouter.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  Provider.findOne({ email })
    .then((provider) => {
      if (!provider) return res.status(404).json({ email: "provider not found" });

      //check password
      bcrypt 
        .compare(password, provider.password)
        .then((isMatch) => {
          if(isMatch){
            //provider matched, create token
            const payload = {
              email: provider.email,
            };

            jwt.sign(
              payload,
              keys.secretOrKey, 
              { expiresIn: 3600 },
              (err, token) => {
                return res.json({token: `Bearer ` + token});
              }
            );
          } else {
            return res.status(400).json({ password: "Invalid password" });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch(err => console.log(err))
});

//'current' route for testing passport on serverside without UI
//@route    GET   api/providers/current
//@desc     Return current provider
//@access   Private

providersRouter.get('/current', 
  passport.authenticate('jwt', {
  session: false}), (req, res) => {
    return res.json(req.provider);
  }
);

//@route    POST  /api/providers/forgotpw
//@desc     Reset provider's password
//@access   Public
providersRouter.post('/forgotpw', (req, res) => {
  const email = req.body.email;
  let newPassword = JSON.stringify(Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);

  //find a provider with that email
  Provider.findOne({ email })
    .then((provider) => {
      if(!provider) {
        return res.status(404).json({
          email: "Provider not found"
        });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) throw err;
            newPassword = hash;
            Provider.updateOne(
              { email: email },
              { $set: { password: newPassword }}
            ).then((provider) => {
              res.json(provider)
            });
          });
        });
        var transporter = nodemailer.createTransport(keys.smtp);

        //set up email data with unicode symbols
        var mailOptions = {
          from: req.body.email,
          to: email,
          subject: "Whos.In provider password request",
          text: `${req.body.name}, your temporary password is: ${newPassword}, please log in and set a new password immediately!`
        };

        //send email with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
          if(!error){
            res.send("Email sent");
          } else {
            res.sendStatus(`Failed, error: ${error}`);
          }
          transporter.close();
          console.log("Message sent: " + info.response )
        });
      }
    })
    .catch((err) => console.log(err));
});

//@route  POST  /api/providers/changepw
//@desc   Change provider's password
//@access Private
providersRouter.post(
  '/changepw', 
  passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateChangepwInput(req.body);

      if (!isValid) {
        return res.status(400).json(errors);
      }
    
    const email = req.body.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    Provider.findOne({ email })
      .then((provider) => {
        if (!provider) {
          return res.status(404).json({ email: "Provider not found"});
        }
        bcrypt  
          .compare(oldPassword, provider.password)
          .then((isMatch) => {
            if(isMatch) {
              //provider matched
              bcrypt.genSalt(10, (err, salt) => {
                if(err) throw err;
                bcrypt.hash(newPassword, salt, (err, hash) => {
                  if (err) throw err;
                  provider.newPassword = hash;
                  Provider.updateOne(
                    { email: req.body.email },
                    { $set: { password: provider.newPassword }}
                  )
                    .then((provider) => { res.json(provider)})
                    .catch((err) => console.log(err));
                });
              });
            } else {
              console.log("Could not change password. Try again later.")
            }
          })
          .catch((err => console.log(err)));
      })
      .catch((err) => console.log(err));
  }
);

// @route   DELETE  api/providers/delete
// @desc    Delete a provider/admin
// @access  Private
providersRouter.delete(
  '/delete', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Provider.findOneAndRemove({ name: req.body.name })
      .then(() => res.json({success: true}))
      .catch((err) => res.status(404).json(err));
  }
);

//@route    POST api/providers/update
//@desc     Update a provider's name
//@access   Private
providersRouter.post('/update', passport.authenticate('jwt', { session: false }), (req, res) => {
  Provider.findOne({name: req.body.name})
    .then(provider)

  }
)

// @route   GET api/providers/all
// @desc    Get all providers' names
// @access  Public
providersRouter.get('/all', (req, res) => {
  const errors = {};

  Provider.find({}, '-password')
    .populate('provider')
    .then((providers) => {
      if (!providers) {
        errors.noproviders = "There are no providers";
        return res.status(404).json(errors);
      }
      res.json(providers);
    })
    .catch((err) => res.status(404).json(err));
});

export default providersRouter;