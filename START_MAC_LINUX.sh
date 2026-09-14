#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required. Install it, then run this script again."
  exit 1
fi
if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  sed -i.bak "s/^JWT_SECRET=.*/JWT_SECRET=$SECRET/" .env
  rm -f .env.bak
fi
npm install
node backend/seed.js
npm start
