/*
  Warnings:

  - You are about to drop the column `minAmout` on the `Grade` table. All the data in the column will be lost.
  - Added the required column `minAmount` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "minAmout",
ADD COLUMN     "minAmount" INTEGER NOT NULL;
