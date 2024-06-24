

import passportJwt from 'passport-jwt';
import Provider from '../models/Provider.js';
import keys from './keys.js';

const {ExtractJwt,Strategy: JwtStrategy} = passportJwt;


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;


export default (passport) => {
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    Provider.findOne({email: jwt_payload.email})
      .then(provider => {
        if (provider) {
          return done(null, provider);
        }
        return done(null, false);
      })
      .catch(err => console.log(err))
  }))
}