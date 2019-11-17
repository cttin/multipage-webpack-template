import React from 'react';
import MintUI from 'mint-ui'

import { post } from '../../services/api'

post()

console.log(React, MintUI);

document.getElementById('test').onclick = function() {
  console.log(React, 'React')
  console.log(MintUI)
}