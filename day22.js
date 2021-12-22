const fs = require('fs');
const _ = require('./lodash');
const input = fs.readFileSync(process.argv[2], 'ascii');

const trace = ()=>{};

const orders = input.split('\n').flatMap((line, i) => {
  const m = line.match(/(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/);
  if(!m) { return [] };
  const [ _, onoff, xmin, xmax, ymin, ymax, zmin, zmax ] = m;
  return [{
    onoff: onoff=='on',
    xmin: parseInt(xmin),
    xmax: parseInt(xmax),
    ymin: parseInt(ymin),
    ymax: parseInt(ymax),
    zmin: parseInt(zmin),
    zmax: parseInt(zmax),
    priority: i,
    activity: 0,
  }];
});

const zEvents = _.sortBy(orders.flatMap(order => {
  return [
    { active: true, order, z: order.zmin },
    { active: false, order, z: order.zmax+1 },
  ];
}), 'z');

const yEvents = _.sortBy(orders.flatMap(order => {
  return [
    { active: true, order, y: order.ymin },
    { active: false, order, y: order.ymax+1 },
  ];
}), 'y');

const xEvents = _.sortBy(orders.flatMap(order => {
  return [
    { active: true, order, x: order.xmin },
    { active: false, order, x: order.xmax+1 },
  ];
}), 'x');

let totalCount = 0;

// z-sweep
let startZ = -16777216;
zEvents.forEach(zEvent => {
  if(zEvent.z > startZ ) {
    const endZ = zEvent.z - 1;

    // process slab
    trace(`  ( EXPECT z=[${startZ}..${endZ}]=${endZ-startZ+1} )`);

    // y-sweep
    let startY = -16777216;
    yEvents.forEach(yEvent => {
      if(yEvent.order.activity<1) return;
      if(yEvent.y > startY) {
        const endY = yEvent.y - 1;

        // process band
        trace(`  ( EXPECT  y=[${startY}..${endY}]=${endY-startY+1} )`);

        // x-sweep
        let startX = -16777216;
        xEvents.forEach(xEvent => {
          if(xEvent.order.activity < 2) return;
          if(xEvent.x > startX) {
            const endX = xEvent.x - 1;

            // process segment
            trace(`  ( EXPECT   x=[${startX}..${endX}]=${endX-startX+1} )`);
            const segmentActiveOrder = _.findLast(orders, o => o.activity >= 3);
            if(segmentActiveOrder?.onoff) {
              const area = (endZ - startZ + 1) * (endY - startY + 1) * (endX - startX + 1);
              trace(`  ( EXPECT    +${area} )`);
              totalCount += area;
            };

            // start new segment
            startX = xEvent.x;
          }

          xEvent.order.activity += xEvent.active?1:-1;
        });

        // start new band
        startY = yEvent.y;
      }

      yEvent.order.activity += yEvent.active?1:-1;
    });

    // start new slab
    startZ = zEvent.z;
  }
  zEvent.order.activity += zEvent.active?1:-1;
});

console.log(`  ( EXPECT total=${totalCount} )`);
