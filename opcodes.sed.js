const opcodes = [
  "LIT", "INC", "POP", "DUP", "NIP", "SWP", "OVR", "ROT",
  "EQU", "NEQ", "GTH", "LTH", "JMP", "JCN", "JSR", "STH",
  "LDZ", "STZ", "LDR", "STR", "LDA", "STA", "DEI", "DEO",
  "ADD", "SUB", "MUL", "DIV", "AND", "ORA", "EOR", "SFT",
  "LIT2", "INC2", "POP2", "DUP2", "NIP2", "SWP2", "OVR2", "ROT2",
  "EQU2", "NEQ2", "GTH2", "LTH2", "JMP2", "JCN2", "JSR2", "STH2",
  "LDZ2", "STZ2", "LDR2", "STR2", "LDA2", "STA2", "DEI2", "DEO2",
  "ADD2", "SUB2", "MUL2", "DIV2", "AND2", "ORA2", "EOR2", "SFT2",
  "LITr", "INCr", "POPr", "DUPr", "NIPr", "SWPr", "OVRr", "ROTr",
  "EQUr", "NEQr", "GTHr", "LTHr", "JMPr", "JCNr", "JSRr", "STHr",
  "LDZr", "STZr", "LDRr", "STRr", "LDAr", "STAr", "DEIr", "DEOr",
  "ADDr", "SUBr", "MULr", "DIVr", "ANDr", "ORAr", "EORr", "SFTr",
  "LIT2r", "INC2r", "POP2r", "DUP2r", "NIP2r", "SWP2r", "OVR2r", "ROT2r",
  "EQU2r", "NEQ2r", "GTH2r", "LTH2r", "JMP2r", "JCN2r", "JSR2r", "STH2r",
  "LDZ2r", "STZ2r", "LDR2r", "STR2r", "LDA2r", "STA2r", "DEI2r", "DEO2r",
  "ADD2r", "SUB2r", "MUL2r", "DIV2r", "AND2r", "ORA2r", "EOR2r", "SFT2r",
  "LITk", "INCk", "POPk", "DUPk", "NIPk", "SWPk", "OVRk", "ROTk",
  "EQUk", "NEQk", "GTHk", "LTHk", "JMPk", "JCNk", "JSRk", "STHk",
  "LDZk", "STZk", "LDRk", "STRk", "LDAk", "STAk", "DEIk", "DEOk",
  "ADDk", "SUBk", "MULk", "DIVk", "ANDk", "ORAk", "EORk", "SFTk",
  "LIT2k", "INC2k", "POP2k", "DUP2k", "NIP2k", "SWP2k", "OVR2k", "ROT2k",
  "EQU2k", "NEQ2k", "GTH2k", "LTH2k", "JMP2k", "JCN2k", "JSR2k", "STH2k",
  "LDZ2k", "STZ2k", "LDR2k", "STR2k", "LDA2k", "STA2k", "DEI2k", "DEO2k",
  "ADD2k", "SUB2k", "MUL2k", "DIV2k", "AND2k", "ORA2k", "EOR2k", "SFT2k",
  "LITrk", "INCrk", "POPrk", "DUPrk", "NIPrk", "SWPrk", "OVRrk", "ROTrk",
  "EQUrk", "NEQrk", "GTHrk", "LTHrk", "JMPrk", "JCNrk", "JSRrk", "STHrk",
  "LDZrk", "STZrk", "LDRrk", "STRrk", "LDArk", "STArk", "DEIrk", "DEOrk",
  "ADDrk", "SUBrk", "MULrk", "DIVrk", "ANDrk", "ORArk", "EORrk", "SFTrk",
  "LIT2rk", "INC2rk", "POP2rk", "DUP2rk", "NIP2rk", "SWP2rk", "OVR2rk", "ROT2rk",
  "EQU2rk", "NEQ2rk", "GTH2rk", "LTH2rk", "JMP2rk", "JCN2rk", "JSR2rk", "STH2rk",
  "LDZ2rk", "STZ2rk", "LDR2rk", "STR2rk", "LDA2rk", "STA2rk", "DEI2rk", "DEO2rk",
  "ADD2rk", "SUB2rk", "MUL2rk", "DIV2rk", "AND2rk", "ORA2rk", "EOR2rk", "SFT2rk"
];

opcodes.forEach((opcode,i) => {
  console.log(`s/#00${(0x100+i).toString(16).slice(-2)}/ on \x1b[4m${opcode}\x1b[24m/`)
});
