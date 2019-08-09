npm run restart > >(tee -a stdout.log) 2> >(tee -a stderr.log >&2)
