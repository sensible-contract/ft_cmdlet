#!/usr/bin/env node
const program = require("commander");
program
  .version("1.0.0", "-v, --version")
  .usage("[command] [args]")
  .command("genesis", "创建新的FT")
  .command("issue", "发行FT")
  .command("transfer", "将FT所有权转移给他人")
  .parse(process.argv);
