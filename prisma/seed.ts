import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// This special import loads .env automatically before anything else runs
import 'dotenv/config' 

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})


const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log("Seeding database...");
  
  // Create the endpoint
  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      description: "Local Test Endpoint",
      // YOUR Webhook.site URL
      targetUrl: "https://webhook.site/7b5f6600-6569-4c1c-81bb-e22f54f8a116", 
      provider: "github",
      secret: "my_secret_key_123" 
    }
  })

  console.log("------------------------------------------------")
  console.log("✅ Created Endpoint ID:", endpoint.id)
  console.log("YOUR NEW INGEST URL:")
  console.log(`http://localhost:3000/api/ingest/${endpoint.id}`)
  console.log("------------------------------------------------")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
