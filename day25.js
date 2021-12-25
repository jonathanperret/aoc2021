const fs = require('fs');

const input = fs.readFileSync(process.argv[2], 'ascii').split('\n');
input.pop();

const matrix = input.map(line => [...line]);

const partial = Math.min(parseInt(process.env.COLUMNS) - 4, parseInt(process.env.LINES) - 3);

function tostr() {
  const isPartial = partial < matrix[0].length - 3;
  const rowStr = row => row.join('')
    //.replace(/>/g,'▷').replace(/v/g,'▽').replace(/\./g,'·')
  ;
  const dumpRow = row =>
    isPartial ? `${rowStr(row.slice(0,partial/2))} ┄ ${rowStr(row.slice(-Math.ceil(partial/2)))}`
              : rowStr(row);
  return isPartial ?
      `${matrix.slice(0, partial/2).map(dumpRow).join('\n')}
┊${' '.repeat(partial + 1)}┊
${matrix.slice(-Math.ceil(partial/2)).map(dumpRow).join('\n')}

`             : `${matrix.map(dumpRow).join('\n')}\n`
}

let buf = '';

function dump(msg) {
  const str = `${msg}\n${tostr()}`;
  const newbuf = paste(buf, str);
  const width = Math.max.apply(null, newbuf.split('\n').map(l=>l.length));
  //console.log({buf,newbuf,str, width})
  if(width>= process.env.COLUMNS - 1) {
    console.log(buf);
    buf = str;
  } else {
    buf = newbuf;
  }
}

function paste(s1, s2) {
  if(s1.length === 0) return s2;
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

let moved = true;

function hmove(row) {
  const first = row[0];
  for(let col = 0; col < row.length; col++) {
    const next = (col+1)%row.length;
    const nextchar = next > 0 ? row[next] : first;
    if(row[col] === '>' && (nextchar === '.' && 1)) {
      row[col] = '.';
      row[next] = '>';
      moved = true;
      col++;
    }
  }
  return;
}

function vmove(_, colIndex) {
  const first = matrix[0][colIndex];
  for(let row = 0; row < matrix.length; row++) {
    const next = (row+1)%matrix.length;
    const nextchar = next > 0 ? matrix[next][colIndex] : first;
    if(matrix[row][colIndex] === 'v' && nextchar === '.') {
      matrix[row][colIndex] = '.';
      matrix[next][colIndex] = 'v';
      moved = true;
      row++;
    }
  }
}

dump('Initial state:');
for(i=1;i<=60000;i++) {
  moved = false;
  matrix.forEach(hmove);
  matrix[0].forEach(vmove);
  dump(`After ${i} step${i>1?'s':''}:`);
  if(!moved) break;
}
console.log(buf);
