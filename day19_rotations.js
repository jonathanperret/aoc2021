// node day19_rotations.js > day19_rotations.tal

const dirs = [
  [ 1, 0, 0 ],
  [ -1, 0, 0 ],
  [ 0, 1, 0 ],
  [ 0, -1, 0 ],
  [ 0, 0, 1 ],
  [ 0, 0, -1 ],
];

const neg = ([x,y,z])=>[-x,-y,-z];
const cross = ([x1,y1,z1],[x2,y2,z2])=>[y1*z2-z1*y2, z1*x2-x1*z2, x1*y2-y1*x2];

const axis = (v) => `${v.some(x=>x>0) ? '+':'-'}${"XYZ"[v.findIndex(x=>x!=0)]}`;

const fns=[];

console.log(`
%ROTATIONCOUNT { #0018 }

@rotations
  ( i -- [ vout* vin* -- ] )
  &get
    ROTATIONCOUNT OVR2 GTH2 ,&ok JCN
      P< "unknown-rotation-id 20 >P DBGSHORT
      !
    &ok
    2** ;&_fns ADD2 LDA2
    RTN
`);

let i = 0;
dirs.forEach(dir1 => {
  dirs.forEach(dir2 => {
    if(dir1 == dir2) return;
    if(dir1.toString().replace(/-/g,'') == dir2.toString().replace(/-/g,'')) return;
    //console.log(i, dir1, dir2, cross(dir1,dir2));
    const dir3 = cross(dir1,dir2);
    // console.log(i, axis(dir1), axis(dir2), axis(dir3));
    const label = `&${axis(dir1)}${axis(dir2)}${axis(dir3)}`;
    console.log(`  ${label}
${[dir1,dir2,dir3].map((dir,n) => {
       const ax = dir.findIndex(x=>x!=0);
       const neg = dir.some(x=>x>0);
       return `    ${n<2?'DUP2':'    '} ${ax==0?'          ':`#000${ax*2} ADD2`} LDA2 ${neg?'    ':'NEG2'} STH2`;
    }).join('\n')}
    ;&_store JMP2
`);
    fns.push(`:${label}`);
    i++;
  });
});

console.log(`  &_store
    STH2r OVR2 #0004 ADD2 STA2
    STH2r OVR2 #0002 ADD2 STA2
    STH2r SWP2            STA2
    RTN

  [ &_fns ${fns.join(' ')} ]
`);
