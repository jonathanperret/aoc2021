#!/bin/bash

set -euo pipefail

testlist=${1:-$(find . -name '*_tests.tal')}

for testfile in $testlist; do
  uxnasm $testfile ${testfile%.tal}.rom 2>&1 | (egrep -v 'Unused label|^Assembled' ||:)

  diff -U 2 <(</dev/null uxncli ${testfile%.tal}.rom) ${testfile%.tal}.expected
done

echo "All OK!"
