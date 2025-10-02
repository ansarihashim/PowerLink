import crypto from 'crypto';

console.log('\n🔐 Generating secure JWT secrets for Railway deployment...\n');
console.log('Copy these to your Railway environment variables:\n');
console.log('─'.repeat(80));
console.log(`JWT_ACCESS_SECRET=${crypto.randomBytes(64).toString('hex')}`);
console.log('─'.repeat(80));
console.log(`JWT_REFRESH_SECRET=${crypto.randomBytes(64).toString('hex')}`);
console.log('─'.repeat(80));
console.log('\n✅ Secrets generated successfully!');
console.log('⚠️  Keep these secret and never commit them to Git!\n');
