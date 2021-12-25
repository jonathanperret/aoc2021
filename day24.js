const fns = require('./day24fns');

function fall(inputDigits) {
  try {
    let z0 = 0;
    z1  = fns.f0 (z0,  inputDigits[0]);
    z2  = fns.f1 (z1,  inputDigits[1]);
    z3  = fns.f2 (z2,  inputDigits[2]);
    z4  = fns.f3 (z3,  inputDigits[3]);
    z5  = fns.f4 (z4,  inputDigits[4]);
    z6  = fns.f5 (z5,  inputDigits[5]);
    z7  = fns.f6 (z6,  inputDigits[6]);
    z8  = fns.f7 (z7,  inputDigits[7]);
    z9  = fns.f8 (z8,  inputDigits[8]);
    z10 = fns.f9 (z9,  inputDigits[9]);
    z11 = fns.f10(z10, inputDigits[10]);
    z12 = fns.f11(z11, inputDigits[11]);
    z13 = fns.f12(z12, inputDigits[12]);
    z14 = fns.f13(z13, inputDigits[13]);
    return [ z14, z13, z12, z11, z10, z9, z8, z7, z6, z5, z4, z3, z2, z1, z0 ];
  } catch(e) {
    return Number.NaN;
  }
}

function from9(n) {
  return parseInt(n - 11111111111111, 9);
}

function to9(n) {
  return parseInt(n.toString(9), 10) + 11111111111111;
}

function digits(n) {
  return [ ...(n.toString(10)) ].map(s => parseInt(s, 10));
}

function minSearch() {
  let z = -1, lastZ = -1;
  let iter = from9(38772636719111);
  let best = 1/0;
  let lastBestPos = iter;
  let count = 0;
  const end = from9(99999999999999);
  while(z != 0 && iter <= end) {
    const inputStr = to9(iter);
    const input = digits(inputStr);
    [ z, ...zinter ] = fall(input);
    if(z<=best || (iter - lastBestPos) < 30 || 1) {
      const inputStr = input.join('');
      console.log(inputStr, z, iter, iter - lastBestPos, zinter.join(','));
      if(z<=best) {
        best = z;
        lastBestPos = iter;
      }
    }
    lastZ = z;
    iter++;
    count++;
  }
}

// minSearch();


function testfn(fn, wantedOutputs) {
  console.log(fn.name);
  const inputs = new Set();
  for(z=0;z<1000000;z++) {
    for(i=1; i<=9; i++) {
      const out = fn(z, i);
      if(wantedOutputs.has(out)) {
        console.log(z, i, out);
        inputs.add(z);
      }
    }
  }
  return inputs;
}

const f13inputs = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22]);
const f12inputs = testfn(fns.f12, f13inputs);
const f11inputs = testfn(fns.f11, f12inputs);
const f10inputs = testfn(fns.f10, f11inputs);
const f9inputs = testfn(fns.f9, f10inputs);
// const f9inputs = new Set([ 376, 402, 428, 454, 480, 506, 532, 558, 584 ]);
const f8inputs = testfn(fns.f8, f9inputs);
const f7inputs = testfn(fns.f7, f8inputs);
const f6inputs = testfn(fns.f6, f7inputs);
const f5inputs = testfn(fns.f5, f6inputs);
const f4inputs = testfn(fns.f4, f5inputs);
const f3inputs = testfn(fns.f3, f4inputs);
const f2inputs = testfn(fns.f2, f3inputs);
const f1inputs = testfn(fns.f1, f2inputs);
const f0inputs = testfn(fns.f0, f1inputs);


