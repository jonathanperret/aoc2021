function turn({ p1pos, p2pos, p1score, p2score, nextup }, dicesum) {
  if(nextup == 0) {
    p1pos = (p1pos + dicesum -1 ) % 10 + 1;
    p1score += p1pos;
    return { p1pos, p2pos, p1score, p2score, nextup:1 };
  } else {
    p2pos = (p2pos + dicesum -1 ) % 10 + 1;
    p2score += p2pos;
    return { p1pos, p2pos, p1score, p2score, nextup:0 };
  }
}

function tokey({ p1pos, p2pos, p1score, p2score, nextup }) {
  return [p1pos,p2pos,p1score,p2score,nextup].join(':');
}

function fromkey(key) {
  const [p1pos,p2pos,p1score,p2score,nextup] = key.split(':').map(s=>parseInt(s));
  return { p1pos, p2pos, p1score, p2score, nextup };
}

console.log(turn({p1pos:4, p2pos:8, p1score:0, p2score:0, nextup:0}, 3));
console.log(turn({p1pos:7, p2pos:8, p1score:7, p2score:0, nextup:1}, 3));
console.log(turn({p1pos:7, p2pos:8, p1score:20, p2score:0, nextup:0}, 3));
console.log(turn({p1pos:7, p2pos:8, p1score:0, p2score:20, nextup:1}, 3));
console.log(tokey({p1pos:7, p2pos:8, p1score:0, p2score:20, nextup:1}));
console.log(fromkey(tokey({p1pos:7, p2pos:8, p1score:0, p2score:20, nextup:1})));

const initStates = { [tokey({p1pos:parseInt(process.argv[2]), p2pos:parseInt(process.argv[3]), p1score:0, p2score:0, nextup:0})]: 1 };

const dicesums = {
  3: 1,
  4: 3,
  5: 6,
  6: 7,
  7: 6,
  8: 3,
  9: 1,
};

let p1wincount = 0;
let p2wincount = 0;
function advance(states) {
  const newstates = {};
  Object.entries(states).forEach(([key, count]) => {
    const state = fromkey(key);
    Object.entries(dicesums).forEach(([dsum, repeats]) => {
      const newstate = turn(state, parseInt(dsum));
      if(newstate.p1score >= 21) {
        p1wincount += repeats * count;
      } else if(newstate.p2score >= 21) {
        p2wincount += repeats * count;
      } else {
        const newkey = tokey(newstate);
        newstates[newkey] = (newstates[newkey] || 0) + repeats * count;
      }
    });
  });
  return newstates;
}

let states = advance(initStates);
console.log(states);
for(let i=0; i<20; i++) {
  states = advance(states);
  const len = Object.keys(states).length
  console.log(i, len);
  console.log(p1wincount, p2wincount);
  if(len == 0) break;
  const minscore = Math.min.apply(null, Object.keys(states).map(fromkey).flatMap(k => [k.p1score, k.p2score]));
  console.log("minscore=", minscore);
  const maxscore = Math.max.apply(null, Object.keys(states).map(fromkey).flatMap(k => [k.p1score, k.p2score]));
  console.log("maxscore=", maxscore);

  console.log(Object.keys(states).filter(key => fromkey(key).p1score==minscore || fromkey(key).p2score ==minscore)
              .slice(0,3));
}

console.log(p1wincount, p2wincount);
console.log(Math.max(p1wincount, p2wincount));

