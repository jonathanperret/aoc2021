#!/bin/bash

set -euo pipefail

for mod in math string; do
  uxnasm ./library/${mod}_tests.{tal,rom} 2>&1 | grep -v 'Unused label'

  diff -U 2 <(</dev/null uxncli ./library/${mod}_tests.rom) ./library/${mod}_tests.expected
done
