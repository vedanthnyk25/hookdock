/*
  Warnings:

  - You are about to drop the column `source` on the `WebhookEvent` table. All the data in the column will be lost.
  - Added the required column `endpointId` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "source",
ADD COLUMN     "endpointId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "targetUrl" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "provider" TEXT NOT NULL,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
