#!/bin/bash

# Run prisma generate
npx prisma generate

# Start your Nest.js application
node dist/main.js
