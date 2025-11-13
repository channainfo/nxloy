/*
  Warnings:

  - You are about to drop the column `oauthId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `oauthProvider` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_LINKING', 'TWO_FACTOR_AUTH', 'PHONE_NUMBER_CHANGE');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('PURCHASE', 'REVIEW', 'PHOTO_UPLOAD', 'VIDEO_UPLOAD', 'SOCIAL_SHARE', 'REFERRAL', 'CHECK_IN', 'COMBO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrendSource" AS ENUM ('TIKTOK', 'INSTAGRAM', 'TWITTER', 'YOUTUBE', 'AI_GENERATED', 'MANUAL');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('JOINED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "CodeType" AS ENUM ('PERSONAL', 'CAMPAIGN', 'INFLUENCER', 'PARTNER');

-- CreateEnum
CREATE TYPE "CodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'QUALIFIED', 'REWARDED', 'EXPIRED', 'CANCELLED', 'FRAUDULENT');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('POINTS', 'DISCOUNT', 'FREE_PRODUCT', 'CASH', 'UPGRADE', 'BONUS_ENTRY');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'DISTRIBUTED', 'REDEEMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InfluencerTier" AS ENUM ('NANO', 'MICRO', 'MID', 'MACRO', 'MEGA');

-- CreateEnum
CREATE TYPE "InfluencerStatus" AS ENUM ('INVITED', 'ACTIVE', 'PAUSED', 'INACTIVE', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('PRODUCT_REVIEW', 'UNBOXING', 'SPONSORED_POST', 'GIVEAWAY', 'AFFILIATE', 'BRAND_AMBASSADOR');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "UGCContentType" AS ENUM ('PHOTO', 'VIDEO', 'TEXT_REVIEW', 'PHOTO_REVIEW', 'VIDEO_REVIEW');

-- CreateEnum
CREATE TYPE "UGCPlatform" AS ENUM ('DIRECT_UPLOAD', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'TWITTER', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "UGCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ModerationType" AS ENUM ('AI_AUTO_APPROVE', 'AI_AUTO_REJECT', 'HUMAN_REVIEW', 'USER_REPORTED', 'SYSTEM_FLAG');

-- CreateEnum
CREATE TYPE "ModerationDecision" AS ENUM ('APPROVE', 'REJECT', 'FLAG_FOR_REVIEW', 'REQUEST_CHANGES', 'REMOVE');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'INAPPROPRIATE', 'COPYRIGHT', 'FAKE_REVIEW', 'OFFENSIVE', 'PRIVACY_VIOLATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "oauthId",
DROP COLUMN "oauthProvider",
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaSecret" TEXT;

-- CreateTable
CREATE TABLE "backup_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "userId" TEXT,
    "pinHash" TEXT NOT NULL,
    "pinSalt" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "hashtag" TEXT,
    "trendSource" "TrendSource" NOT NULL DEFAULT 'MANUAL',
    "trendData" JSONB,
    "tasks" JSONB NOT NULL,
    "rewards" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "maxParticipants" INTEGER,
    "minAge" INTEGER,
    "eligibleCustomerIds" TEXT[],
    "eligibleTiers" TEXT[],
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "aiModel" TEXT,
    "predictedViralScore" DOUBLE PRECISION DEFAULT 0,
    "predictedReach" INTEGER,
    "predictedParticipation" DOUBLE PRECISION,
    "totalParticipants" INTEGER NOT NULL DEFAULT 0,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "totalImpressions" INTEGER NOT NULL DEFAULT 0,
    "actualViralScore" DOUBLE PRECISION,
    "actualReach" INTEGER NOT NULL DEFAULT 0,
    "coverImageUrl" TEXT,
    "exampleVideoUrl" TEXT,
    "instructionsVideoUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participations" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'JOINED',
    "tasksCompleted" JSONB NOT NULL,
    "submissionIds" TEXT[],
    "shareUrls" TEXT[],
    "sharesGenerated" INTEGER NOT NULL DEFAULT 0,
    "impressionsGenerated" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "badgesEarned" TEXT[],
    "prizesWon" JSONB,
    "rank" INTEGER,
    "score" DOUBLE PRECISION,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_leaderboards" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "points" INTEGER NOT NULL,
    "shares" INTEGER NOT NULL,
    "impressions" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAvatar" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CodeType" NOT NULL,
    "status" "CodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerCustomer" INTEGER DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "referrerReward" JSONB NOT NULL,
    "referredReward" JSONB NOT NULL,
    "requirements" JSONB,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viralCoefficient" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "secondaryReferrals" INTEGER NOT NULL DEFAULT 0,
    "shareChannels" JSONB,
    "lastSharedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "clickedAt" TIMESTAMP(3),
    "signedUpAt" TIMESTAMP(3),
    "qualifiedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "channel" TEXT,
    "orderId" TEXT,
    "orderValue" DOUBLE PRECISION,
    "orderDate" TIMESTAMP(3),
    "referrerRewardId" TEXT,
    "referredRewardId" TEXT,
    "fraudScore" DOUBLE PRECISION,
    "fraudFlags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "referralId" TEXT,
    "customerId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "type" "RewardType" NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distributedAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_analytics" (
    "id" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "signups" INTEGER NOT NULL DEFAULT 0,
    "purchases" INTEGER NOT NULL DEFAULT 0,
    "clickToSignupRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "signupToPurchaseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clickToPurchaseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerLTV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "primaryReferrals" INTEGER NOT NULL DEFAULT 0,
    "secondaryReferrals" INTEGER NOT NULL DEFAULT 0,
    "tertiaryReferrals" INTEGER NOT NULL DEFAULT 0,
    "viralCoefficient" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viralCycleTime" DOUBLE PRECISION DEFAULT 0,
    "channelPerformance" JSONB DEFAULT '{}',
    "dailyMetrics" JSONB DEFAULT '[]',
    "topReferrers" JSONB DEFAULT '[]',
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_social_graphs" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "estimatedNetworkSize" INTEGER NOT NULL DEFAULT 0,
    "connectedPlatforms" JSONB DEFAULT '[]',
    "influenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isSuperReferrer" BOOLEAN NOT NULL DEFAULT false,
    "referralPotential" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "successfulReferrals" INTEGER NOT NULL DEFAULT 0,
    "referralSuccessRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgReferralValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReferralRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "networkQuality" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "botScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lookalikeClusters" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ageRange" TEXT,
    "gender" TEXT,
    "location" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "dataSourceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAnalysisAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_social_graphs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencers" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "tier" "InfluencerTier" NOT NULL,
    "avgLikes" INTEGER NOT NULL DEFAULT 0,
    "avgComments" INTEGER NOT NULL DEFAULT 0,
    "avgShares" INTEGER NOT NULL DEFAULT 0,
    "avgViews" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "audienceOverlap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "audienceDemographics" JSONB,
    "campaignsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgConversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "InfluencerStatus" NOT NULL DEFAULT 'INVITED',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "fixedFee" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "contactPreference" TEXT,
    "referralCode" TEXT,
    "referralLink" TEXT,
    "botFollowerScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fraudScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invitedAt" TIMESTAMP(3),
    "invitedBy" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencer_campaigns" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'PLANNED',
    "description" TEXT,
    "requiredPosts" INTEGER NOT NULL DEFAULT 1,
    "completedPosts" INTEGER NOT NULL DEFAULT 0,
    "platforms" TEXT[],
    "hashtags" TEXT[],
    "mentions" TEXT[],
    "contentGuidelines" TEXT,
    "commissionRate" DOUBLE PRECISION,
    "fixedPayment" DOUBLE PRECISION,
    "productValue" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencer_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencer_performance" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "campaignId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cvr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "influencer_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ugc_submissions" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "contentType" "UGCContentType" NOT NULL,
    "platform" "UGCPlatform" NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "caption" TEXT,
    "hashtags" TEXT[],
    "productId" TEXT,
    "productSku" TEXT,
    "externalId" TEXT,
    "externalUrl" TEXT,
    "permalink" TEXT,
    "qualityScore" DOUBLE PRECISION DEFAULT 0,
    "viralityScore" DOUBLE PRECISION DEFAULT 0,
    "sentimentScore" DOUBLE PRECISION,
    "engagementScore" DOUBLE PRECISION,
    "aiAnalysis" JSONB,
    "status" "UGCStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "rejectionReason" TEXT,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "pointsAwardedAt" TIMESTAMP(3),
    "bonusPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "sharedToSocial" BOOLEAN NOT NULL DEFAULT false,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "shareBonusAwarded" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCountExternal" INTEGER NOT NULL DEFAULT 0,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentTypes" TEXT[],
    "canUseCommercially" BOOLEAN NOT NULL DEFAULT false,
    "canSharePlatforms" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ugc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ugc_moderation" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "type" "ModerationType" NOT NULL,
    "decision" "ModerationDecision" NOT NULL,
    "moderatorId" TEXT,
    "reason" TEXT,
    "flags" TEXT[],
    "confidence" DOUBLE PRECISION,
    "aiModel" TEXT,
    "aiMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ugc_moderation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ugc_reports" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "ipAddress" TEXT,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "evidence" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ugc_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backup_codes_userId_idx" ON "backup_codes"("userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_identifier_type_idx" ON "verification_tokens"("identifier", "type");

-- CreateIndex
CREATE INDEX "verification_tokens_expiresAt_idx" ON "verification_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "challenges_businessId_status_idx" ON "challenges"("businessId", "status");

-- CreateIndex
CREATE INDEX "challenges_startDate_endDate_idx" ON "challenges"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "challenges_trendSource_idx" ON "challenges"("trendSource");

-- CreateIndex
CREATE INDEX "challenges_predictedViralScore_idx" ON "challenges"("predictedViralScore");

-- CreateIndex
CREATE INDEX "challenge_participations_businessId_customerId_idx" ON "challenge_participations"("businessId", "customerId");

-- CreateIndex
CREATE INDEX "challenge_participations_status_idx" ON "challenge_participations"("status");

-- CreateIndex
CREATE INDEX "challenge_participations_rank_idx" ON "challenge_participations"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participations_challengeId_customerId_key" ON "challenge_participations"("challengeId", "customerId");

-- CreateIndex
CREATE INDEX "challenge_leaderboards_challengeId_rank_idx" ON "challenge_leaderboards"("challengeId", "rank");

-- CreateIndex
CREATE INDEX "challenge_leaderboards_businessId_idx" ON "challenge_leaderboards"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_leaderboards_challengeId_customerId_key" ON "challenge_leaderboards"("challengeId", "customerId");

-- CreateIndex
CREATE INDEX "referral_codes_businessId_ownerId_idx" ON "referral_codes"("businessId", "ownerId");

-- CreateIndex
CREATE INDEX "referral_codes_status_idx" ON "referral_codes"("status");

-- CreateIndex
CREATE INDEX "referral_codes_viralCoefficient_idx" ON "referral_codes"("viralCoefficient");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_businessId_code_key" ON "referral_codes"("businessId", "code");

-- CreateIndex
CREATE INDEX "referrals_businessId_referrerId_idx" ON "referrals"("businessId", "referrerId");

-- CreateIndex
CREATE INDEX "referrals_businessId_referredId_idx" ON "referrals"("businessId", "referredId");

-- CreateIndex
CREATE INDEX "referrals_codeId_idx" ON "referrals"("codeId");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referral_rewards_businessId_customerId_idx" ON "referral_rewards"("businessId", "customerId");

-- CreateIndex
CREATE INDEX "referral_rewards_codeId_idx" ON "referral_rewards"("codeId");

-- CreateIndex
CREATE INDEX "referral_rewards_status_idx" ON "referral_rewards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "referral_analytics_codeId_key" ON "referral_analytics"("codeId");

-- CreateIndex
CREATE INDEX "referral_analytics_businessId_idx" ON "referral_analytics"("businessId");

-- CreateIndex
CREATE INDEX "referral_analytics_viralCoefficient_idx" ON "referral_analytics"("viralCoefficient");

-- CreateIndex
CREATE UNIQUE INDEX "customer_social_graphs_customerId_key" ON "customer_social_graphs"("customerId");

-- CreateIndex
CREATE INDEX "customer_social_graphs_businessId_isSuperReferrer_idx" ON "customer_social_graphs"("businessId", "isSuperReferrer");

-- CreateIndex
CREATE INDEX "customer_social_graphs_influenceScore_idx" ON "customer_social_graphs"("influenceScore");

-- CreateIndex
CREATE INDEX "customer_social_graphs_referralPotential_idx" ON "customer_social_graphs"("referralPotential");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_referralCode_key" ON "influencers"("referralCode");

-- CreateIndex
CREATE INDEX "influencers_businessId_status_idx" ON "influencers"("businessId", "status");

-- CreateIndex
CREATE INDEX "influencers_tier_idx" ON "influencers"("tier");

-- CreateIndex
CREATE INDEX "influencers_matchScore_idx" ON "influencers"("matchScore");

-- CreateIndex
CREATE INDEX "influencers_audienceOverlap_idx" ON "influencers"("audienceOverlap");

-- CreateIndex
CREATE UNIQUE INDEX "influencers_businessId_platform_username_key" ON "influencers"("businessId", "platform", "username");

-- CreateIndex
CREATE INDEX "influencer_campaigns_businessId_status_idx" ON "influencer_campaigns"("businessId", "status");

-- CreateIndex
CREATE INDEX "influencer_campaigns_influencerId_idx" ON "influencer_campaigns"("influencerId");

-- CreateIndex
CREATE INDEX "influencer_performance_businessId_influencerId_periodStart_idx" ON "influencer_performance"("businessId", "influencerId", "periodStart");

-- CreateIndex
CREATE INDEX "influencer_performance_campaignId_idx" ON "influencer_performance"("campaignId");

-- CreateIndex
CREATE INDEX "ugc_submissions_businessId_status_idx" ON "ugc_submissions"("businessId", "status");

-- CreateIndex
CREATE INDEX "ugc_submissions_customerId_idx" ON "ugc_submissions"("customerId");

-- CreateIndex
CREATE INDEX "ugc_submissions_platform_externalId_idx" ON "ugc_submissions"("platform", "externalId");

-- CreateIndex
CREATE INDEX "ugc_submissions_qualityScore_idx" ON "ugc_submissions"("qualityScore");

-- CreateIndex
CREATE INDEX "ugc_submissions_viralityScore_idx" ON "ugc_submissions"("viralityScore");

-- CreateIndex
CREATE INDEX "ugc_submissions_createdAt_idx" ON "ugc_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "ugc_moderation_submissionId_idx" ON "ugc_moderation"("submissionId");

-- CreateIndex
CREATE INDEX "ugc_moderation_type_decision_idx" ON "ugc_moderation"("type", "decision");

-- CreateIndex
CREATE INDEX "ugc_reports_submissionId_idx" ON "ugc_reports"("submissionId");

-- CreateIndex
CREATE INDEX "ugc_reports_status_idx" ON "ugc_reports"("status");

-- CreateIndex
CREATE INDEX "ugc_reports_reportedBy_idx" ON "ugc_reports"("reportedBy");

-- AddForeignKey
ALTER TABLE "backup_codes" ADD CONSTRAINT "backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_leaderboards" ADD CONSTRAINT "challenge_leaderboards_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_analytics" ADD CONSTRAINT "referral_analytics_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_campaigns" ADD CONSTRAINT "influencer_campaigns_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_performance" ADD CONSTRAINT "influencer_performance_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_performance" ADD CONSTRAINT "influencer_performance_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "influencer_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ugc_moderation" ADD CONSTRAINT "ugc_moderation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ugc_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ugc_reports" ADD CONSTRAINT "ugc_reports_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ugc_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
