
import mongoose from 'mongoose'


const Schema = mongoose.Schema
//Create schema
const AssistantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: String,
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Assistant = mongoose.model('assistants', AssistantSchema)
export default Assistant