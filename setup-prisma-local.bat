@echo off
echo Setting up Prisma locally...

REM Install Prisma
call npm install prisma @prisma/client
call npm install -D prisma

REM Initialize Prisma
call npx prisma init --datasource-provider mysql

echo Prisma setup complete!
echo Next: Update schema and test locally
pause