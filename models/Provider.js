import mongoose from 'mongoose'

const Schema = mongoose.Schema

const providerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    Lowercase: true,
  },
  password: {
    type: String,
  }
});

const Provider = mongoose.model('providers', providerSchema);
export default Provider