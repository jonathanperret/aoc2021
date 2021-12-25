const fs = require('fs');

const input = fs.readFileSync(process.argv[2], 'ascii').split('\n');
input.pop();

const matrix = input.map(line => [...line]);

const partial = Math.min(parseInt(process.env.COLUMNS) - 4, parseInt(process.env.LINES) - 3);

function dump() {
  const isPartial = partial < matrix[0].length - 3;
  const rowStr = row => row.join('').replace(/>/g,'▷').replace(/v/g,'▽').replace(/\./g,'·');
  const dumpRow = row =>
    isPartial ? `${rowStr(row.slice(0,partial/2))} ┄ ${rowStr(row.slice(-Math.ceil(partial/2)))}`
              : rowStr(row);
  console.log(
    isPartial ?
      `${matrix.slice(0, partial/2).map(dumpRow).join('\n')}
┊${' '.repeat(partial + 1)}┊
${matrix.slice(-Math.ceil(partial/2)).map(dumpRow).join('\n')}
`             : matrix.map(dumpRow).join('\n')
  );
}

let moved = true;

function hmove(row) {
  let left = 0, right = 0;
  while(true) {
    // find start of > train
    while (left < row.length && row[left] != '>') {
      left++;
    }
    if (left >= row.length) break;
    // find end of > train
    right = left;
    while (row[right] == '>') right = (right + 1) % row.length;
    // can train move?
    if (row[right] == '.') {
      row[left] = '.';
      row[right] = '>';
      moved = true;
    }
    // look for next train
    if (right <= left) break;
    left = right + 1;
  }
}

function vmove(_, colIndex) {
  let left = 0, right = 0;
  while(true) {
    // find start of v train
    while (left < matrix.length && matrix[left][colIndex] != 'v') {
      left++;
    }
    if (left >= matrix.length) break;
    // find end of > train
    right = left;
    while (matrix[right][colIndex] == 'v') right = (right + 1) % matrix.length;
    // can train move?
    if (matrix[right][colIndex] == '.') {
      matrix[left][colIndex] = '.';
      matrix[right][colIndex] = 'v';
      moved = true;
    }
    // look for next train
    if (right <= left) break;
    left = right + 1;
  }
}

//dump();
//matrix.forEach(hmove);
for(i=0;i<1;i++) {
  matrix.forEach(hmove);
  matrix[0].forEach(vmove);
}
dump();
