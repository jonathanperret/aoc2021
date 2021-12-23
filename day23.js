const fs = require('fs');
const util = require('util');
const input = fs.readFileSync(process.argv[2], 'ascii');
const { astar } = require('./astar');
const assert = require('assert').strict;

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
const roomToHallway = [
  //        to   0  1  2  3  4  5  6
  /* from a */ [ 3, 2, 2, 4, 6, 8, 9 ],
  /* from b */ [ 5, 4, 2, 2, 4, 6, 7 ],
  /* from c */ [ 7, 6, 4, 2, 2, 4, 5 ],
  /* from d */ [ 9, 8, 6, 4, 2, 2, 3 ],
];

const spotsToHallway = [
  //        to   0               1             2         3      4         5           6
  /* from a */ [ [ 1 ],          [ ],          [ ],      [ 2 ], [ 2, 3 ], [ 2, 3, 4 ], [ 2, 3, 4, 5 ] ],
  /* from b */ [ [ 1, 2 ],       [ 2 ],        [ ],      [ ],   [ 3 ],    [ 3, 4 ],    [ 3, 4, 5 ]    ],
  /* from c */ [ [ 1, 2, 3 ],    [ 2, 3 ],     [ 3 ],    [ ],   [ ],      [ 4 ],       [ 4, 5 ]       ],
  /* from d */ [ [ 1, 2, 3, 4 ], [ 2, 3, 4 ],  [ 3, 4 ], [ 4 ], [ ],      [ ],         [ 5 ]          ],
];

const roomToRoom = [
  //        to   a             b           c          d
  /* from a */ [ null,         [ 2 ],      [ 2, 3 ],  [ 2, 3, 4 ]  ],
  /* from b */ [ [ 2 ],        null,       [ 3 ],     [ 3, 4 ]     ],
  /* from c */ [ [ 2, 3 ],     [ 3 ],      null,      [ 4 ]        ],
  /* from d */ [ [ 2, 3, 4 ],  [ 3, 4 ],   [ 4 ],     null         ],
];

const roomToRoomDistances = [
  //        to   a  b  c  d
  /* from a */ [ 0, 4, 6, 8 ],
  /* from b */ [ 4, 0, 4, 6 ],
  /* from c */ [ 6, 4, 0, 4 ],
  /* from d */ [ 8, 6, 4, 0 ],
];

const hallwaySpots = [ 0, 1, 2, 3, 4, 5, 6 ];

const roomIndices = [ 0, 1, 2, 3];

assert.equal(nextStates('||BC||..A....').length, 4);
// assert.equal(nextStates('B|CD|B|DA|.......').length, 28);

function pathIsFree(hallway, roomIndex, hallwaySpot) {
  const intermediateSteps = spotsToHallway[roomIndex][hallwaySpot];
  for (const spot of intermediateSteps) if (hallway[spot] !== '.') return false;
  return true;
}

function roomToRoomPathIsFree(hallway, roomIndex1, roomIndex2) {
  if (roomIndex1 === roomIndex2) throw new Error("no room-to-room in same room");
  const intermediateSteps = roomToRoom[roomIndex1][roomIndex2];
  for (const spot of intermediateSteps) if (hallway[spot] !== '.') return false;
  return true;
}

function nextStates(state) {
  const parts = state.split('|');
  const [ hallway, [ ...rooms ] ] = [ parts.pop(), parts ];

  const states = [];
  // - pick a room
  rooms.forEach((fromRoomContents, fromRoomIndex) => {
    // - if it is empty, continue;
    if (fromRoomContents.length == 0) return;
    const [ amphipod, roomRest ] = [ fromRoomContents.slice(0,1), fromRoomContents.slice(1) ];

    // console.log({fromRoomContents, fromRoomIndex, amphipod, roomRest})

    // - pick a hallway spot
    roomToHallway[fromRoomIndex].forEach((toHallwayDistance, hallwaySpot) => {
      // - check if spot is free
      if ( hallway[hallwaySpot] !== '.' ) return false;
      // - check if there are no obstacles to that spot
      if (!pathIsFree(hallway, fromRoomIndex, hallwaySpot)) return;

      let cost = Amphipods.costs[amphipod] * toHallwayDistance;

      const newHallway = [ ...hallway ];
      newHallway[hallwaySpot] = amphipod;

      const newRooms = [ ...rooms ];
      newRooms[fromRoomIndex] = roomRest;

      const mkStateStr = () => [ ...newRooms, newHallway.join('') ].join('|');

      // console.log({ amphipod, hallwaySpot, toHallwayDistance, finalRoom, distanceToFinalRoom, stepCost, cost, newHallway: newHallway.join(''), newState: mkStateStr() });
      // console.log('bfre', mkStateStr());

      // auto-remove all amphipods that can reach their target room
      let newState = mkStateStr();

      const via = [];
      let again = false;
      do {
        again = false;

        // auto hallway-to-room
        newHallway.forEach((hallwayAmphipod, spot) => {
          if (hallwayAmphipod === '.') return;
          const target = Amphipods.targetRooms[hallwayAmphipod];
          // target room must be free
          if (newRooms[target].length) return;
          //console.log({target,spot,newHallway})
          if (!pathIsFree(newHallway, target, spot)) return;

          newHallway[spot] = '.';

          via.push({ state: newState, cost });
          cost += roomToHallway[target][spot] * Amphipods.costs[hallwayAmphipod];
          newState = mkStateStr();
          again = true;
          // console.log("auto", mkStateStr(), cost);
        });

        // auto room-to-room
        newRooms.forEach((roomContents, roomIndex) => {
          if (!roomContents.length) return;
          const roomAmphipod = roomContents[0];
          const targetRoom = Amphipods.targetRooms[roomAmphipod];
          if (newRooms[targetRoom].length != 0) return;
          if (!roomToRoomPathIsFree(newHallway, roomIndex, targetRoom)) return;

          // amphipod exits
          newRooms[roomIndex] = roomContents.slice(1);

          via.push({ state: newState, cost });
          cost += roomToRoomDistances[roomIndex][targetRoom] * Amphipods.costs[roomAmphipod];
          newState = mkStateStr();
          again = true;
        });
      } while(again);

      states.push({ state: newState, cost, via });
    });
  });
  return states;
}

function fixedCost(state) {
  const parts = state.split('|');
  const [ hallway, [ ...rooms ] ] = [ parts.pop(), parts ];
  const population = { A:0, B:0, C:0, D:0 };
  let exitCosts = 0, enterCosts = 0;

  rooms.forEach((roomContents, roomIndex) => {
    for(let depth = 0; depth < roomContents.length; depth++) {
      const amphipod = roomContents[depth];
      const stepCost = Amphipods.costs[amphipod];
      // each amphipod starting in a room past the top one needs an extra step to exit it
      exitCosts += depth * stepCost;
      // each amphipod after the first of each type needs an extra step to get into place
      enterCosts += population[amphipod] * stepCost;
      population[amphipod]++;
    }
  });

  return exitCosts + enterCosts;
}

function render(state) {
  const parts = state.split('|');
  const [ hallway, [ ...rooms ] ] = [ parts.pop(), parts ];

  const roomDepth = part2 ? 4 : 2;

  const exitedPopulation = { A: roomDepth, B: roomDepth, C: roomDepth, D: roomDepth };
  for(const a of state) {
    if(a in exitedPopulation) {
      exitedPopulation[a]--;
    }
  }

  const realRooms = rooms.map((roomContents, roomIndex) => {
    const expectedAmphipod = 'ABCD'[roomIndex];
    if(roomContents.length === 0) {
      // "empty" room: in fact full of every amphipod not present elsewhere
      return '.'.repeat(roomDepth - exitedPopulation[expectedAmphipod])
        + expectedAmphipod.repeat(exitedPopulation[expectedAmphipod]);
    } else {
      // non-empty room: contains already-exited amphipods at bottom, filled
      // with blanks at top
      return ('....' + roomContents + expectedAmphipod.repeat(exitedPopulation[expectedAmphipod])).slice(-roomDepth);
    }
  });

  const rows = [];
  for(let i=0; i<roomDepth; i++) {
    rows.push(
      `${i?'  │':'└─┐'}${realRooms[0][i]}│${realRooms[1][i]}│${realRooms[2][i]}│${realRooms[3][i]}${i?'│':'┌─┘'}`
    );
  }

  return `${state}
┌───────────┐
│${hallway.slice(0,2)}.${hallway[2]}.${hallway[3]}.${hallway[4]}.${hallway.slice(5)}│
${rows.join('\n')}
  └─┴─┴─┴─┘`;
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

function dump(ns) {
  ns.forEach(({ state, cost, via }) => {
    const allStates = [ ...(via || []).map(v=>v.state), state ];
    console.log(allStates.map(render).reduce(paste));
    console.log('---');
  });
};

function renderPath(path) {
  console.log(render(path[0].parent.state));
  path.forEach(toNode => {
    const fromNode = toNode.parent;
    const via = toNode.getVia(fromNode);
    console.log([
      ...via.map(v=>`    ${v.cost}\n${render(v.state)}`),
      `    ${toNode.getCost(fromNode)}\n${render(toNode.state)}`
    ].reduce(paste));
  });
}

function assertTransition(fromState, toState, expectedCost) {
  // console.log({ fromState });
  const newStates = nextStates(fromState);
  // dump(newStates);
  const found = newStates.find(({state,cost})=>state === toState);
  assert.ok(found);
  assert.equal(found.cost, expectedCost);
}

assertTransition('B|CD|B|DA|.......', 'B|D||DA|..B....', 40 + 400);
assertTransition('B|D||DA|..B....',   '|||DA|...D...',   3000 - 1000 + 30 - 10 + 40);
assertTransition('|||DA|...D...',     '|||A|...DD..',    2000);
assertTransition('|||A|...DD..',      goalState,         3 - 1 + 3000 - 1000 + 4000 + 8);

assert.equal(fixedCost('B|CD|B|DA|.......'),
     1 + 1000  // cost to exit wrong rooms (<depth> moves per amphipod starting in wrong room)
   + 10 + 1000 // cost to enter final room (0+1+… moves per amphipod of a given type starting in wrong room )
);

assert.equal(
  40 + 400 +
  3000 - 1000 + 30 - 10 + 40 +
  2000 +
  3 - 1 + 3000 - 1000 + 4000 + 8 +
  fixedCost('B|CD|B|DA|.......'), 12521);

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
    return ns.cost;
  }

  getVia(fromNode) {
    const ns = fromNode.nextStates.find(({ state }) => state === this.state);
    if(!ns) {
      throw new Error(`can't reach ${ this.state } from ${ fromNode.state }`);
    }
    return ns.via ? ns.via : [];
  }
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

function minStateDistance(node1, node2) {
  if(process.env.ASTAR_NO_HEURISTIC == '1') return 0;

  if(node2.state != goalState) throw new Exception("no heuristic to " + node2.state);

  const parts = node1.state.split('|');
  const [ hallway, [ ...rooms ] ] = [ parts.pop(), parts ];

  let minTotalCost = 0;

  // ghost hallway-to-room
  [...hallway].forEach((hallwayAmphipod, spot) => {
    if (hallwayAmphipod === '.') return;
    const target = Amphipods.targetRooms[hallwayAmphipod];
    minTotalCost += roomToHallway[target][spot] * Amphipods.costs[hallwayAmphipod];
  });

  // ghost room-to-room
  rooms.forEach((roomContents, roomIndex) => {
    if (!roomContents.length) return;
    const roomAmphipod = roomContents[0];
    const targetRoom = Amphipods.targetRooms[roomAmphipod];
    minTotalCost += roomToRoomDistances[roomIndex][targetRoom] * Amphipods.costs[roomAmphipod];
  });

  return minTotalCost;
}

if(process.env.ASTAR=='1') {
  Astar();
} else {
  UCS();
}

function Astar() {
  const path = astar.search(stateGraph,
                 stateGraph.node(initialState),
                 stateGraph.node(goalState),
                 { heuristic: minStateDistance });

  renderPath(path);
  const pathCost = path[path.length-1].f;
  const fixed = fixedCost(initialState);
  const totalCost = pathCost + fixed;
  console.log({ pathCost, fixedCost:fixed, totalCost });
  console.log(`Explored ${stateGraph.nodes.size} nodes (0x${(Math.round(stateGraph.nodes.size / 8)).toString(16)} bits).`);
}


function UCS() {
  function Entry(state, cost, from, via) {
    this.state = state;
    this.cost = cost;
    this.from = from;
    this.via = via;
  }
  Entry.prototype[util.inspect.custom] = Entry.prototype.toString = function() {
    return '\n' + [' ', `    ${this.cost}\n${render(this.state)}`,
      ...(this.from ? [
                        ...(this.via ? [...this.via].reverse().map(v=>`    ${v.cost}\n${render(v.state)}`) : []),
                        `\n${render(this.from.state)}`
                      ]
                    : [''])
    ].reduce(paste);
  }
  const byEntryCost = (e1, e2) => e1.cost - e2.cost;

  const pathCosts = new Map();
  const frontier = [ new Entry(initialState, 0) ];
  let bestEntry;

  while(!(frontier.length === 0)) {
    // console.log(`frontier ${frontier.length}`);

    const from = frontier.pop();
    // console.log(`starting from ${from}`);

    for(const { state: toState, cost: toCost, via } of nextStates(from.state)) {
      // console.log(['  can get to', render(toState), `for ${toCost}`].reduce(paste));
      // todo check frontier for target state with higher cost
      const pathCost = from.cost + toCost;
      const bestKnownCost = pathCosts.get(toState) || 1/0;
      if (pathCost < bestKnownCost) {
        pathCosts.set(toState, pathCost);
        const newEntry = new Entry(toState, pathCost, from, via);

        if (toState === goalState) {
          console.log(`*** found goal with cost ${pathCost}! ***`);
          bestEntry = newEntry;
        }

        frontier.push(newEntry);
        // console.log(`visiting ${newEntry}`);
      }
    }
    frontier.sort(byEntryCost);

  }

  const pathCost = pathCosts.get(goalState);
  const fixed = fixedCost(initialState);
  const totalCost = pathCost + fixed;
  console.log({ pathCost, fixedCost:fixed, totalCost });
  console.log(`Explored ${pathCosts.size} nodes.`);

  const path = [];

  while(bestEntry) {
    path.push(bestEntry);
    bestEntry = bestEntry.from;
  }

  console.log(path);
}
