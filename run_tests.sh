#!/bin/bash

set -euo pipefail

testlist=${1:-$(find . -name '*_tests.tal')}

for testfile in $testlist; do
  uxnasm $testfile ${testfile%.tal}.rom 2>&1 | (egrep -v 'Unused label|^Assembled' ||:)

  diff -U 2 <(
    if [ -f ${testfile%.tal}.expected ]; then
      cat ${testfile%.tal}.expected
    else
      < $testfile awk '
        /\( EXPECT/ { sub(".*\\( EXPECT ",""); sub(" \\)$",""); print; }
        /STKCHK/ { print("🥞"); }
      '
    fi
  ) <(</dev/null uxncli ${testfile%.tal}.rom)
done

echo "All OK!"
