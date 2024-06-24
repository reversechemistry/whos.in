import proKeys from "./keys_prod.js"

import devKeys from "./keys_dev.js"

let keys = devKeys


if(process.env.NODE_ENV === 'production'){
  keys = proKeys
}

export default keys