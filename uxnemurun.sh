#!/bin/bash

set -euo pipefail

f=${1:-}
shift

uxnasm $f ${f%.tal}.rom 2>&1 | grep -v 'Unused label'

< /dev/null uxnemu ${f%.tal}.rom "$@"
