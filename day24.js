const fns = require('./day24fns');

function fall(inputDigits) {
  try {
    let z = 0;
    z = fns.f0(z, inputDigits[0]);
    z = fns.f1(z, inputDigits[1]);
    z = fns.f2(z, inputDigits[2]);
    z = fns.f3(z, inputDigits[3]);
    z = fns.f4(z, inputDigits[4]);
    z = fns.f5(z, inputDigits[5]);
    z = fns.f6(z, inputDigits[6]);
    z = fns.f7(z, inputDigits[7]);
    z = fns.f8(z, inputDigits[8]);
    z = fns.f9(z, inputDigits[9]);
    z = fns.f10(z, inputDigits[10]);
    z = fns.f11(z, inputDigits[11]);
    z = fns.f12(z, inputDigits[12]);
    z = fns.f13(z, inputDigits[13]);
    return z;
  } catch(e) {
    return Number.NaN;
  }
}

let input = [    ... "99996914719111" ].map(s=>parseInt(s));
let z = -1, lastZ = -1;
while(z != 0) {
  z = fall(input);
  if(z<600) {
    console.log(input.join(''), z, z-lastZ);
  }
  lastZ = z;
  for(i=input.length-1; i>=0; i--) {
    input[i]--;
    if(input[i] == 0) {
      input[i] = 9;
    } else {
      break;
    }
  }
}
