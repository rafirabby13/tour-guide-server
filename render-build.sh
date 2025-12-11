

set -o errexit

bun install

bun run build

bun prisma generate

bun prisma migrate deploy