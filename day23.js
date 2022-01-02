const fs = require('fs');
const util = require('util');
const input = fs.readFileSync(process.argv[2], 'ascii');
const { astar } = require('./astar');
const assert = require('assert').strict;
const _ = require('./lodash');

const part2 = process.argv[3] == '2';

function parse(input, isPart2) {
  const lines = input.split('\n');
  return `${
         lines[2][3] }${ isPart2 ? 'DD': '' }${ lines[3][3].replace('A','')
    }|${ lines[2][5] }${ isPart2 ? 'CB': '' }${ lines[3][5].replace('B','')
    }|${ lines[2][7] }${ isPart2 ? 'BA': '' }${ lines[3][7].replace('C','')
    }|${ lines[2][9] }${ isPart2 ? 'AC': '' }${ lines[3][9].replace('D','')
    }|.......`;
}

const inputState = parse(input, part2);
console.log("inputState", inputState);

assert.equal(
  parse(
`#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########
`, true),
  'BDD|CCBD|BBA|DACA|.......'
);

const Amphipods = {
  targetRooms: { A:0, B:1, C:2, D:3 },
  costs: { A:1, B:10, C:100, D:1000 },
}

//    #############
//    #01.2.3.4.56#
//    ###a#b#c#d###

const hallwaySpots = [ 0, 1, 2, 3, 4, 5, 6 ];
const roomIndices = [ 0, 1, 2, 3 ];
const roomNames = [ 'a', 'b', 'c', 'd' ];

const roomToHallwayDistances = [
  //        to   0  1  2  3  4  5  6
  /* from a */ [ 3, 2, 2, 4, 6, 8, 9 ],
  /* from b */ [ 5, 4, 2, 2, 4, 6, 7 ],
  /* from c */ [ 7, 6, 4, 2, 2, 4, 5 ],
  /* from d */ [ 9, 8, 6, 4, 2, 2, 3 ],
];

// console.log(roomToHallwayDistances.map(roomData => roomData.map((distance, spot) =>
//                                                               (distance + 0x100).toString(16).slice(-2)
//                                                             ).join(' ')).join('\n'));
// return

const roomToHallwaySpots = [
  //        to   0               1             2         3      4         5           6
  /* from a */ [ [ 1 ],          [ ],          [ ],      [ 2 ], [ 2, 3 ], [ 2, 3, 4 ], [ 2, 3, 4, 5 ] ],
  /* from b */ [ [ 1, 2 ],       [ 2 ],        [ ],      [ ],   [ 3 ],    [ 3, 4 ],    [ 3, 4, 5 ]    ],
  /* from c */ [ [ 1, 2, 3 ],    [ 2, 3 ],     [ 3 ],    [ ],   [ ],      [ 4 ],       [ 4, 5 ]       ],
  /* from d */ [ [ 1, 2, 3, 4 ], [ 2, 3, 4 ],  [ 3, 4 ], [ 4 ], [ ],      [ ],         [ 5 ]          ],
];

// console.log(roomToHallwaySpots.map(roomData => roomData.map((steps, spot) =>
//                                                               steps.map(s=>0x40>>s).reduce((m1,m2)=>m1|m2,0x100).toString(16).slice(-2)
//                                                             ).join(' ')).join('\n'));
// return

function roomToHallwayCost(amphipod, fromRoomIndex, hallwaySpot) {
  const toHallwayDistance = roomToHallwayDistances[fromRoomIndex][hallwaySpot];
  const fromHallwayDistance = roomToHallwayDistances[Amphipods.targetRooms[amphipod]][hallwaySpot];
  return (toHallwayDistance + fromHallwayDistance) * Amphipods.costs[amphipod];
}

class State {
  static fromString(state) {
    const parts = state.split('|');
    const [ hallway, [ ...rooms ] ] = [ parts.pop(), parts ];
    const st = new State();
    st.hallway = [ ...hallway ];
    st.rooms = rooms.map(s => [...s]);
    return st;
  }

  get state() {
    return [  ...this.rooms, this.hallway ].map(a => a.join('')).join('|');
  }

  clone() {
    return State.fromString(this.state);
  }

  fork() {
    const newSt = this.clone();
    return newSt;
  }

  hasAmphipodInRoom(roomIndex) {
    return this.rooms[roomIndex].length > 0;
  }

  hasAmphipodInHallway(spot) {
    return this.hallway[spot] !== '.';
  }

  canMoveFromRoomToHallway(fromRoomIndex, hallwaySpot) {
    // - check if spot is free
    return !this.hasAmphipodInHallway(hallwaySpot) && this.pathIsFree(fromRoomIndex, hallwaySpot);
  }

  popRoom(roomIndex) {
    const [ amphipod, ...roomRest ] = this.rooms[roomIndex];
    this.rooms[roomIndex] = roomRest;
    return amphipod;
  }

  moveFromRoomToHallway(fromRoomIndex, hallwaySpot) {
    const newSt = this.fork();

    const amphipod = newSt.popRoom(fromRoomIndex);
    newSt.hallway[hallwaySpot] = amphipod;

    newSt.addCost = roomToHallwayCost(amphipod, fromRoomIndex, hallwaySpot);

    newSt.move = `${amphipod}${roomNames[fromRoomIndex]}${hallwaySpot}`;

    return newSt;
  }

  canMoveFromHallwayToRoom(spot, targetRoomIndex) {
    if (this.hasAmphipodInRoom(targetRoomIndex)) return false;
    return this.pathIsFree(targetRoomIndex, spot);
  }

  moveFromHallwayToRoom(spot, targetRoomIndex) {
    const newSt = this.fork();
    newSt.hallway[spot] = '.';
    newSt.addCost = 0;
    newSt.move = `${this.hallway[spot]}${spot}${roomNames[targetRoomIndex]}`;
    return newSt;
  }

  pathIsFree(roomIndex, hallwaySpot) {
    const intermediateSteps = roomToHallwaySpots[roomIndex][hallwaySpot];
    return !intermediateSteps.some(spot => this.hasAmphipodInHallway(spot));
  }

  fixedCost() {
    const population = { A:0, B:0, C:0, D:0 };
    let exitCosts = 0, enterCosts = 0;

    for (const [ roomIndex, roomContents ] of this.rooms.entries()) {
      for (const [ depth, amphipod ] of [...roomContents].entries()) {
        const stepCost = Amphipods.costs[amphipod];
        // each amphipod starting in a room past the top one needs an extra step to exit it
        exitCosts += depth * stepCost;
        // each amphipod after the first of each type needs an extra step to get into place
        enterCosts += population[amphipod] * stepCost;
        population[amphipod]++;
      }
    }

    return exitCosts + enterCosts;
  }

  render(s) {
    const roomDepth = part2 ? 4 : 2;

    const exitedPopulation = { A: roomDepth, B: roomDepth, C: roomDepth, D: roomDepth };
    for (const a of [this.rooms, this.hallway].flat()) {
      exitedPopulation[a]--;
    }

    const realRooms = this.rooms.map((roomContents, roomIndex) => {
      const expectedAmphipod = 'ABCD'[roomIndex];
      if(roomContents.length === 0) {
        // "empty" room: in fact full of every amphipod not present elsewhere
        return '.'.repeat(roomDepth - exitedPopulation[expectedAmphipod])
          + expectedAmphipod.repeat(exitedPopulation[expectedAmphipod]);
      } else {
        // non-empty room: contains already-exited amphipods at bottom,
        // then its contents, then is filled with blanks up to the top
        return ('.'.repeat(roomDepth) + [...roomContents].join('') + expectedAmphipod.repeat(exitedPopulation[expectedAmphipod])).slice(-roomDepth);
      }
    });

    const rows = [];
    for(let i=0; i<roomDepth; i++) {
      rows.push(
        `${i?'  │':'└─┐'}${realRooms[0][i]}│${realRooms[1][i]}│${realRooms[2][i]}│${realRooms[3][i]}${i?'│':'┌─┘'}`
      );
    }

    const h = this.hallway;

    return `┌───────────┐
│${h[0]}${h[1]}.${h[2]}.${h[3]}.${h[4]}.${h[5]}${h[6]}│
${rows.join('\n')}
  └─┴─┴─┴─┘`;
  }
}

function nextStates(state) {
  const st = State.fromString(state);

  const states = [];

  // - pick a hallway spot, try to move its amphipod to its target room
  for (const spot of hallwaySpots) {
    if (!st.hasAmphipodInHallway(spot)) continue;

    const hallwayAmphipod = st.hallway[spot];
    const target = Amphipods.targetRooms[hallwayAmphipod];

    if (!st.canMoveFromHallwayToRoom(spot, target)) continue;

    const newSt = st.moveFromHallwayToRoom(spot, target);
    states.push(newSt);

    // optimization: don't return any other state if an amphipod can exit
    return states;
  }

  // - pick a room, try to move its top amphipod to the hallway
  for (const fromRoomIndex of roomIndices) {
    // - if it is empty, continue;
    if (!st.hasAmphipodInRoom(fromRoomIndex)) continue;

    // - pick a hallway spot
    for(const hallwaySpot of hallwaySpots) {
      if (!st.canMoveFromRoomToHallway(fromRoomIndex, hallwaySpot)) continue;

      const newSt = st.moveFromRoomToHallway(fromRoomIndex, hallwaySpot);

      states.push(newSt);
    }
  }

  return states;
}

const goalState = '||||.......';
const initialState = inputState;

function paste(s1, s2) {
  const lines1 = s1.split('\n');
  const lines2 = s2.split('\n');
  const maxLines = lines1.length > lines2.length ? lines1 : lines2;
  const l1width = Math.max.apply(null, lines1.map(l=>l.length));
  return maxLines.map((_, i) => {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';
    return  line1 + ' '.repeat(l1width - line1.length + 1)
          + line2
  }).join('\n');
}

if(process.env.ASTAR=='1') {
  Astar();
} else {
  DFS();
}

function Astar() {
  class Node {
    constructor(state) {
      this.state = state;
    }

    isWall() {
      return false;
    }

    get nextStates() {
      if (!this._nextStates) {
        this._nextStates = nextStates(this.state);
      }
      return this._nextStates;
    }

    neighbors() {
      return this.nextStates.map(({ state }) => stateGraph.node(state));
    }

    getCost(fromNode) {
      const ns = fromNode.nextStates.find(({ state }) => state === this.state);
      if(!ns) {
        throw new Error(`can't reach ${ this.state } from ${ fromNode.state }`);
      }
      return ns.addCost;
    }

    getMove(fromNode) {
      const ns = fromNode.nextStates.find(({ state }) => state === this.state);
      if(!ns) {
        throw new Error(`can't reach ${ this.state } from ${ fromNode.state }`);
      }
      return ns.move;
    }
  }

  const roomToRoomSpot = [
    //        to   a  b  c  d
    /* from a */ [ 2, 2, 2, 2 ],
    /* from b */ [ 2, 2, 3, 3 ],
    /* from c */ [ 3, 3, 4, 4 ],
    /* from d */ [ 4, 4, 4, 4 ],
  ];

  function minStateDistance(node1, node2) {
    if(process.env.ASTAR_NO_HEURISTIC == '1') return 0;

    if(node2.state != goalState) throw new Exception("no heuristic to " + node2.state);

    const st = State.fromString(node1.state);

    let minTotalCost = 0;

    // ghost room-to-room
    st.rooms.forEach((roomContents, roomIndex) => {
      if (!roomContents.length) return;
      const roomAmphipod = roomContents[0];
      const targetRoom = Amphipods.targetRooms[roomAmphipod];
      const spot = roomToRoomSpot[roomIndex][targetRoom];
      const cost = roomToHallwayCost(roomAmphipod, roomIndex, spot);
      minTotalCost += cost;
    });

    return minTotalCost;
  }

  const stateGraph = {
    nodes: new Map(),

    node(state) {
      const existing = this.nodes.get(state);
      if(existing) return existing;
      const newNode = new Node(state);
      // console.log(this.nodes.size, state);
      astar.cleanNode(newNode);
      this.nodes.set(state, newNode);
      return newNode;
    },

    cleanDirty() {
      this.dirty = new Set();
    },

    markDirty(node) {
      this.dirty.add(node);
    },

    neighbors(node) {
      return node.neighbors();
    }
  };

  const path = astar.search(stateGraph,
                 stateGraph.node(initialState),
                 stateGraph.node(goalState),
                 { heuristic: minStateDistance });

  function renderPath(path) {
    console.log(State.fromString(path[0].parent.state).render());
    path.forEach(toNode => {
      const fromNode = toNode.parent;
      console.log(paste(`\n      ${toNode.getMove(fromNode)}\n${`       +${toNode.getCost(fromNode)}`.slice(-8)}`, `${State.fromString(toNode.state).render()}`));
    });
  }

  renderPath(path);
  const pathCost = path[path.length-1].f;
  const fixed = State.fromString(initialState).fixedCost();
  const totalCost = pathCost + fixed;
  console.log({ pathCost, fixedCost:fixed, totalCost });
  console.log(`Explored ${stateGraph.nodes.size} nodes (0x${(Math.round(stateGraph.nodes.size / 8)).toString(16)} bits).`);
}


function DFS() {
  function Entry(state, cost, from, move, addCost) {
    this.state = state;
    this.cost = cost;
    this.addCost = addCost;
    this.from = from;
    this.move = move;
    this.depth = from ? from.depth + 1 : 0;
    this.moves = from ? from.moves + move : '';
  }
  Entry.prototype[util.inspect.custom] = Entry.prototype.toString = function() {
    return '\n' + [`[${this.depth}] ${this.move}`,
      ` ${this.move} ${this.addCost}\n${State.fromString(this.state).render()}`,
    ].reduce(paste);
  }

  const pathCosts = new Map();
  const initialEntry =  new Entry(initialState, 0, null, '  ', 0);
  let bestEntry;
  let iterCount = 0;

  const CACHESIZE = ~~process.argv[4];
  const cache = [];

  const byteShuffle = [...Array(256)].map((x,i)=>i); //.sort(()=>Math.random()-0.5);
  let maxStateVal = 0;
  let cacheHits = 0;

  function hashState(state) {
    const stateCode = state.replace(/[^|]*\|/g,(s)=>s.length-1).replace(/[A-D]/g,c=>c.charCodeAt(0)-64).replace(/\./g,'0');
    const stateVal = parseInt(stateCode, 5);
    if(stateVal>maxStateVal) {
      console.log(stateVal.toString(16))
      maxStateVal = stateVal
    }
    if(CACHESIZE > 0) {
      const shuffled = (byteShuffle[(stateVal >> 24) & 0xff] << 0 | byteShuffle[(stateVal >> 16) & 0xff] << 8) << 1
                     ^ (byteShuffle[(stateVal >>  8) & 0xff] << 8 | byteShuffle[(stateVal      ) & 0xff]);
      return shuffled % CACHESIZE;
    }
    return stateVal;
  }

  let abortCount = 0;

  function dfs(from) {

    const hash = hashState(from.state);

    const cachedEntry = cache[hash];
    if(cachedEntry && cachedEntry.state === from.state) {
      if (cachedEntry.cost <= from.cost) {
        // console.log(`skipping ${from.state} (${from.cost}), found in cache for ${cachedEntry.cost}`);
        cacheHits++;
        return;
      } else {
        // console.log(`replacing ${from.state} (${from.cost} ${from.moves}), found in cache for ${cachedEntry.cost} (${cachedEntry.moves})`);
      }
    }
    cache[hash] = from;

    // console.log(`${from.moves}\t${from.state}\tcost ${from.cost}\titer ${iterCount}\t${hashState(from.state)}`);
    // console.log(render(from.state))

    if (bestEntry && from.cost >= bestEntry.cost) {
       // console.log(`aborting, from cost (${from.cost}) is too high`);
      abortCount++;
      return;
    }

    iterCount++;
    if((iterCount & 0xffff) === 0) process.stdout.write('.');

    if (from.state === goalState) {
      //console.log(`*** found goal at depth ${from.depth} with cost ${from.cost}! ***`);
      if (!bestEntry || from.cost < bestEntry.cost) {
        bestEntry = from;
      }
      return;
    }

    for(const { state: toState, addCost, move } of nextStates(from.state)) {
      const pathCost = from.cost + addCost;

      const newEntry = new Entry(toState, pathCost, from, move, addCost);

      dfs(newEntry);
    }
  }

  dfs(initialEntry);

  const pathCost = bestEntry.cost; // pathCosts.get(goalState);
  const fixed = State.fromString(initialState).fixedCost();
  const totalCost = pathCost + fixed;

  const path = [];

  while(bestEntry) {
    path.unshift(bestEntry);
    bestEntry = bestEntry.from;
  }

  console.log(path);
  console.log(`Did ${iterCount} iterations.`);
  console.log(`${cache.flat().length} cache entries used.`);
  console.log(`${cacheHits} cache hits.`);
  if (abortCount > 0) console.log(`${abortCount} aborts.`);
  console.log({ pathCost, fixedCost:fixed, totalCost });
}
