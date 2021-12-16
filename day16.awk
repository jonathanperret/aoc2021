BEGIN {
   print "[f] sf [1+] so [0*] sz [1+]so [ sa sb 0 la lb <o ]s<  [ sa sb 0 la lb >o ]s> [ sa sb 0 la lb =o ]s= [ * ]s* [ + ]s+ [r]sr [ sa sb la lb la lb >r sZ ]sM [ sa sb la lb la lb <r sZ ]sm";
}
/\|/{
  printf "[%s\n]P\n", $0; op=substr($0,1,1);
  if(op=="#"){}
  else if(op!=" "){
    print "l" op "x";
  }else{
    print substr($0,1,22);
  };
  print "f"
}
