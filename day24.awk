function trace(s) {
  # print "  console.log(" s ");"
}
function assign(r, expr) {
  trace("'" r " <-', " expr)
  print "  " r " = " expr ";"
}
function endfn() {
  print "  return z;\n}"
  print "exports."fname".a = "a";"
  print "exports."fname".b = "b";"
  print "exports."fname".c = "c";"
  print ""
}
/inp/ { if (NR>1) endfn()
        a = 0; b = 0; c = 0;
        fname = "f"(NR-1)/18
        print "exports."fname" = function (z, w) {"
        print "  if (w > 9 || w < 1) throw new Error('bad input');"
        print "  let x = 0, y = 0;" }
/mul/ { assign($2, $2 " * " $3) }
/add/ { assign($2, $2 " + " $3) }
/mod/ { print "  if ("$2" < 0 || "$3" <= 0) throw new Error('bad mod');"
        assign($2, $2 " % " $3) }
/div/ { print "  if ("$3" <= 0) throw new Error('bad div');"
        assign($2, "Math.trunc("$2" / "$3")") }
/eql/ { assign($2, "("$2" == "$3") ? 1 : 0") }

NR % 18 == 5  { a = $3 }
NR % 18 == 6  { b = $3 }
NR % 18 == 16 { c = $3 }

END   { endfn() }
