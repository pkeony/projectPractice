/*
  Warnings:

  - You are about to drop the column `discauntRate` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "discauntRate",
ADD COLUMN     "discountRate" INTEGER NOT NULL DEFAULT 0;
