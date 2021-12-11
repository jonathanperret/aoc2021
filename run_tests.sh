#!/bin/bash

set -euo pipefail

testlist=${1:-$(find . -name '*_tests.tal')}

set +e
for testfile in $testlist; do
  set +e
  uxnasm $testfile ${testfile%.tal}.rom > ${testfile%.tal}.log 2>&1
  asmfailed=$?
  set -e

  if [ $asmfailed -gt 0 ]; then
    echo $testfile assembly failed:
    echo -n $'\x1b[31;1m'
    cat ${testfile%.tal}.log | egrep -v 'Unused label|^Assembled'
    echo -n $'\x1b[0m'
    exit 1
  fi

  < $testfile awk '
    /\( EXPECT/ { sub(".*\\( EXPECT ",""); sub(" \\)$",""); print; }
    /STKCHK/ { print("🥞"); }
  ' > ${testfile%.tal}.expected.out

  set +e
  </dev/null uxncli ${testfile%.tal}.rom 2>${testfile%.tal}.err >${testfile%.tal}.out
  runfailed=$?
  set -e
  if grep -v '^Loaded' ${testfile%.tal}.err >/dev/null; then
    runfailed=1
  fi

  set +e
  git diff --no-prefix --color-moved --text -U2 \
    --no-index --color=always \
    ${testfile%.tal}.expected.out ${testfile%.tal}.out > ${testfile%.tal}.diff
  difffailed=$?
  set -e

  if [ $runfailed -gt 0 -o $difffailed -gt 0 ]; then
    echo $testfile run failed:

    echo -n $'\x1b[31;1m'

    cat ${testfile%.tal}.err | grep -v '^Loaded' | sed -E -f opcodes.sed ||:

    echo -n $'\x1b[0m'
    cat ${testfile%.tal}.diff | tail -n +5

    exit 2
  fi

done

echo $'\x1b[32mAll OK! Have a cookie: 🍪\x1b[0m'
