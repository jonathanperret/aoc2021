#!/bin/bash

set -euo pipefail

for testfile in $(find . -name '*_tests.tal'); do
  uxnasm $testfile ${testfile%.tal}.rom 2>&1 | (egrep -v 'Unused label|^Assembled' ||:)

  diff -U 2 <(</dev/null uxncli ${testfile%.tal}.rom) ${testfile%.tal}.expected
done

echo "All OK!"
