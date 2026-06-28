CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"currency" text NOT NULL,
	"identifiers" jsonb NOT NULL,
	"balance_amount" numeric NOT NULL,
	"balance_currency" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"booked_at" timestamp with time zone NOT NULL,
	"direction" text NOT NULL,
	"status" text NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;